from utils.repo_env import load_root_env

load_root_env()

import os
import re
import hashlib
import json as _json
from contextlib import asynccontextmanager
from datetime import datetime, timezone, timedelta
from typing import Optional, Literal

from pydantic import BaseModel
from fastapi import FastAPI, Query, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId
from loguru import logger

from database.db import col_offres, col_archives, col_logs, test_connection, init_db
from scheduler.scheduler import start_scheduler, stop_scheduler
import requests


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Scraping Service démarré")
    init_db()
    start_scheduler()
    yield
    stop_scheduler()
    logger.info("Scraping Service arrêté")


app = FastAPI(
    title="Glybette Scraping Service",
    description="Service interne de scraping d'offres d'emploi",
    version="3.2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _serialize(doc: dict) -> dict:
    doc["_id"] = str(doc["_id"])
    for key in ["date_publication", "date_scraped", "date_updated", "date_archivage"]:
        val = doc.get(key)
        if val and isinstance(val, datetime):
            if val.tzinfo is None:
                val = val.replace(tzinfo=timezone.utc)
            doc[key] = val.isoformat()
    return doc


def _require_admin(request: Request) -> None:
    roles_header = request.headers.get("x-user-roles", "")
    roles = [item.strip() for item in roles_header.split(",") if item.strip()]
    is_admin = "admin" in roles or request.headers.get("x-user-is-admin", "").lower() == "true"
    if not is_admin:
        raise HTTPException(403, "Admin role required")


def _build_date_filter(date_posted: str) -> dict | None:
    now = datetime.now(timezone.utc)
    delta_map = {
        "this_hour": timedelta(hours=1),
        "today":     timedelta(hours=24),
        "3days":     timedelta(days=3),
        "this_week": timedelta(days=7),
    }
    delta = delta_map.get(date_posted)
    if not delta:
        return None

    since = now - delta
    return {
        "$or": [
            {
                "date_publication": {"$gte": since, "$ne": None},
            },
            {
                "date_publication": {"$in": [None]},
                "date_scraped": {"$gte": since},
            },
        ]
    }


_score_cache: dict[tuple[str, str], int] = {}
_MAX_CACHE = 2000


def _profile_hash(user_skills: list[str] | None, user_experience: str | None) -> str:
    key = _json.dumps({"s": sorted(user_skills or []), "e": user_experience or ""}, sort_keys=True)
    return hashlib.md5(key.encode()).hexdigest()


def _build_offre_text(offre: dict) -> str:
    parts = [
        f"Titre: {offre.get('titre', '')}",
        f"Entreprise: {offre.get('entreprise', '')}" if offre.get("entreprise") else "",
        f"Description: {offre.get('description', '')}" if offre.get("description") else "",
        f"Compétences requises: {', '.join(offre.get('competences', []))}" if offre.get("competences") else "",
        f"Localisation: {offre.get('localisation', '')}" if offre.get("localisation") else "",
        f"Niveau: {offre.get('niveau_experience', '')}" if offre.get("niveau_experience") else "",
        f"Contrat: {offre.get('type_contrat', '')}" if offre.get("type_contrat") else "",
    ]
    return "\n".join(p for p in parts if p)


def _build_profile_text(user_skills: list[str] | None, user_experience: str | None) -> str:
    parts = []
    if user_skills:
        parts.append(f"Compétences: {', '.join(user_skills)}")
    if user_experience:
        parts.append(f"Niveau d'expérience: {user_experience}")
    return "\n".join(parts)


def _call_ai_matching(profile_text: str, offre_text: str) -> int:
    ai_url = os.getenv("AI_SERVICE_URL", "http://localhost:3007")
    secret = os.getenv("INTERNAL_SERVICE_SECRET", "")
    try:
        resp = requests.post(
            f"{ai_url}/ai/jobs/matching",
            json={"profileText": profile_text, "offreText": offre_text},
            headers={"x-internal-secret": secret, "Content-Type": "application/json"},
            timeout=10,
        )
        if resp.status_code == 200:
            data = resp.json()
            return int(data.get("score", 0))
    except Exception as e:
        logger.warning(f"[scraping-service] ai-service matching failed: {e}")
    return 0


def _calculate_matching_score(
    offre: dict,
    user_skills: list[str] | None = None,
    user_experience: str | None = None,
) -> int:
    if not user_skills and not user_experience:
        return 0

    offre_id = str(offre.get("_id", ""))
    ph = _profile_hash(user_skills, user_experience)
    cache_key = (ph, offre_id)

    if cache_key in _score_cache:
        return _score_cache[cache_key]

    profile_text = _build_profile_text(user_skills, user_experience)
    offre_text = _build_offre_text(offre)

    score = _call_ai_matching(profile_text, offre_text)

    if len(_score_cache) >= _MAX_CACHE:
        for k in list(_score_cache.keys())[:200]:
            del _score_cache[k]

    _score_cache[cache_key] = score
    return score


def _fetch_user_profile(request: Request) -> tuple[list[str] | None, str | None]:
    headers = {}
    auth = request.headers.get("authorization") or request.headers.get("Authorization")
    if auth:
        headers["Authorization"] = auth

    portfolio_url = os.getenv("PORTFOLIO_SERVICE_URL", "http://localhost:3004")
    users_url = os.getenv("USERS_SERVICE_URL", "http://localhost:3001")

    try:
        resp = requests.get(f"{portfolio_url}/portfolio/me", headers=headers, timeout=3)
        if resp.status_code == 200:
            data = resp.json()
            portfolio = data.get("portfolio")
            if portfolio:
                skills = []
                for tab in portfolio.get("tabs", []):
                    for block in tab.get("blocks", []):
                        if block.get("type") == "skills":
                            d = block.get("data", {})
                            if isinstance(d.get("skills"), list):
                                skills.extend([s for s in d.get("skills") if isinstance(s, str)])
                            if isinstance(d.get("skillGroups"), list):
                                for g in d.get("skillGroups"):
                                    for s in (g.get("skills") or []):
                                        if isinstance(s, str):
                                            skills.append(s)
                skills = list({s.strip() for s in skills if isinstance(s, str) and s.strip()})
                if skills:
                    return skills, None
    except Exception:
        pass

    try:
        resp = requests.get(f"{users_url}/users/me", headers=headers, timeout=3)
        if resp.status_code == 200:
            data = resp.json()
            user = data.get("user")
            if user:
                skills = user.get("skills") if isinstance(user.get("skills"), list) else None
                experience = user.get("experience") if isinstance(user.get("experience"), str) else None
                if skills:
                    return skills, experience
    except Exception:
        pass

    return None, None


@app.get("/offres")
def get_offres(
    type_offre:        Optional[str] = Query(None),
    source:            Optional[str] = Query(None),
    localisation:      Optional[str] = Query(None),
    search:            Optional[str] = Query(None),
    page:              int           = Query(1, ge=1),
    limit:             int           = Query(20, ge=1, le=100),
    tri:               str           = Query("recent"),
    date_posted:       Optional[Literal["this_hour", "today", "3days", "this_week"]] = Query(None),
    teletravail:       Optional[Literal["remote", "hybrid", "onsite"]] = Query(None),
    niveau_experience: Optional[str] = Query(None),
    user_skills:       Optional[str] = Query(None),
    user_experience:   Optional[str] = Query(None),
    request:           Request        = None,
):
    filtre: dict = {"status": "active"}

    if type_offre:
        filtre["type_offre"] = type_offre
    if source:
        filtre["source_site"] = source
    if localisation:
        filtre["localisation"] = {"$regex": localisation, "$options": "i"}
    if search:
        filtre["$text"] = {"$search": search}

    if date_posted:
        date_filter = _build_date_filter(date_posted)
        if date_filter:
            filtre.update(date_filter)

    if teletravail:
        remote_patterns = {
            "remote": r"remote|full\s*remote|télétravail\s*complet|100\s*%",
            "hybrid": r"hybride|hybrid|télétravail\s*partiel|partiel",
            "onsite": r"présentiel|on[\-\s]site|sur\s*site|pas\s*de\s*télétravail|non\s*autorisé",
        }
        pattern = remote_patterns.get(teletravail, teletravail)
        filtre["teletravail"] = {"$regex": pattern, "$options": "i"}

    if niveau_experience:
        exp_patterns = {
            "junior":  r"junior|<\s*6\s*mois|0[\-–]1\s*an|débutant|entry\s*level",
            "mid":     r"1[\-–]3\s*ans|2[\-–]3\s*ans|intermédiaire|confirmé|mid",
            "senior":  r"senior|3\+?\s*ans|5\+?\s*ans|expert|lead|expérimenté",
        }
        pattern = exp_patterns.get(niveau_experience, re.escape(niveau_experience))
        filtre["niveau_experience"] = {"$regex": pattern, "$options": "i"}

    profile_skills = [s.strip() for s in user_skills.split(",") if s.strip()] if user_skills else None
    profile_experience = user_experience.strip() if user_experience else None

    if not profile_skills and not profile_experience and request is not None:
        try:
            prof_skills, prof_exp = _fetch_user_profile(request)
            if prof_skills and not profile_skills:
                profile_skills = prof_skills
            if prof_exp and not profile_experience:
                profile_experience = prof_exp
        except Exception:
            pass

    sort_map = {
        "recent": [("date_publication", -1), ("date_scraped", -1)],
        "vues":   [("nb_vues", -1)],
    }
    sort = sort_map.get(tri, [("date_publication", -1), ("date_scraped", -1)])

    col   = col_offres()
    total = col.count_documents(filtre)

    projection = None if (profile_skills or profile_experience) else {"description": 0, "company_about": 0}
    all_docs = list(
        col.find(filtre, projection)
           .sort(sort)
    )

    if profile_skills or profile_experience:
        for doc in all_docs:
            doc["_matching_score"] = _calculate_matching_score(
                doc, profile_skills, profile_experience
            )

        def _sort_key(x):
            score = x.get("_matching_score", 0)
            dt = x.get("date_publication") or x.get("date_scraped")
            ts = dt.timestamp() if isinstance(dt, datetime) else 0
            return (-score, -ts)

        all_docs.sort(key=_sort_key)

    docs = all_docs[(page - 1) * limit : page * limit]

    serialized_offres = []
    for d in docs:
        serialized = _serialize(d)
        if "_matching_score" in d:
            serialized["matching_score"] = d["_matching_score"]
        serialized_offres.append(serialized)

    return {
        "total":  total,
        "page":   page,
        "pages":  (total + limit - 1) // limit if limit else 1,
        "offres": serialized_offres,
    }


@app.get("/offres/{offre_id}")
def get_offre(offre_id: str):
    try:
        oid = ObjectId(offre_id)
    except Exception:
        raise HTTPException(400, "ID invalide")

    col   = col_offres()
    offre = col.find_one({"_id": oid})
    if not offre:
        raise HTTPException(404, "Offre non trouvée")

    col.update_one({"_id": oid}, {"$inc": {"nb_vues": 1}})
    return _serialize(offre)


@app.get("/stats")
def get_stats():
    col = col_offres()

    par_type   = {r["_id"]: r["count"] for r in col.aggregate([
        {"$match": {"status": "active"}},
        {"$group": {"_id": "$type_offre", "count": {"$sum": 1}}}
    ])}
    par_source = {r["_id"]: r["count"] for r in col.aggregate([
        {"$match": {"status": "active"}},
        {"$group": {"_id": "$source_site", "count": {"$sum": 1}}}
    ])}

    hier = datetime.now(timezone.utc) - timedelta(hours=24)
    nouvelles_24h = col.count_documents({
        "status": "active",
        "$or": [
            {"date_publication": {"$gte": hier}},
            {"date_publication": None, "date_scraped": {"$gte": hier}},
        ]
    })

    avec_description   = col.count_documents({"status": "active", "description":   {"$ne": None, "$exists": True}})
    avec_company_about = col.count_documents({"status": "active", "company_about": {"$ne": None, "$exists": True}})

    logs = []
    for log in col_logs().find({}, {"_id": 0}).sort("started_at", -1).limit(20):
        for k in ["started_at", "finished_at"]:
            if log.get(k):
                v = log[k]
                if isinstance(v, datetime):
                    if v.tzinfo is None:
                        v = v.replace(tzinfo=timezone.utc)
                    log[k] = v.isoformat()
        logs.append(log)

    return {
        "total_actives":      col.count_documents({"status": "active"}),
        "total_archives":     col_archives().count_documents({}),
        "nouvelles_24h":      nouvelles_24h,
        "par_type":           par_type,
        "par_source":         par_source,
        "avec_description":   avec_description,
        "avec_company_about": avec_company_about,
        "derniers_scrapings": logs,
    }


class TriggerScrapeBody(BaseModel):
    source: str = "all"


def _enqueue_scrape(source: str, background_tasks: BackgroundTasks) -> dict:
    valides = ["indeed", "welcometothejungle", "linkedin", "pfebooks", "all"]
    if source not in valides:
        raise HTTPException(400, f"Source invalide. Options: {valides}")
    from scrapers.manager import run_scraper, run_all_scrapers
    if source == "all":
        background_tasks.add_task(run_all_scrapers)
    else:
        background_tasks.add_task(run_scraper, source)
    return {"message": f"Scraping '{source}' lancé", "timestamp": datetime.now(timezone.utc).isoformat()}


@app.post("/scrape/now")
def scrape_now(source: str, background_tasks: BackgroundTasks):
    return _enqueue_scrape(source, background_tasks)


@app.post("/trigger")
def trigger_scrape(body: TriggerScrapeBody, background_tasks: BackgroundTasks):
    return _enqueue_scrape(body.source, background_tasks)


@app.get("/admin/stats")
def get_admin_stats(request: Request):
    _require_admin(request)
    return get_stats()


@app.post("/admin/trigger")
def trigger_scrape_admin(body: TriggerScrapeBody, background_tasks: BackgroundTasks, request: Request):
    _require_admin(request)
    return _enqueue_scrape(body.source, background_tasks)


@app.get("/sources")
def get_sources():
    col = col_offres()
    sources = col.distinct("source_site", {"status": "active"})
    return {"sources": sources}


@app.get("/health")
def health():
    return {
        "service":   "scraping-service",
        "status":    "ok" if test_connection() else "degraded",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }