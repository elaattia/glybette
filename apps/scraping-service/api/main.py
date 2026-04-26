import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone, timedelta
from typing import Optional, Literal

from fastapi import FastAPI, Query, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId
from loguru import logger

from database.db import col_offres, col_archives, col_logs, test_connection, init_db
from scheduler.scheduler import start_scheduler, stop_scheduler


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
    """Convertit un document MongoDB en dict JSON-sérialisable."""
    doc["_id"] = str(doc["_id"])
    for key in ["date_publication", "date_scraped", "date_updated", "date_archivage"]:
        val = doc.get(key)
        if val and isinstance(val, datetime):
            if val.tzinfo is None:
                val = val.replace(tzinfo=timezone.utc)
            doc[key] = val.isoformat()
    return doc


def _build_date_filter(date_posted: str) -> dict | None:
    """
    Retourne un filtre MongoDB pour la date.

    Priorité : date_publication (date réelle de publication sur le site source)
    Fallback  : date_scraped (date à laquelle on a scrappé l'offre)

    On utilise $or pour couvrir les deux cas :
      - offre avec date_publication connue → filtrer dessus
      - offre sans date_publication → utiliser date_scraped
    """
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

    
    sort_map = {
        "recent": [("date_scraped", -1)],
        "vues":   [("nb_vues", -1)],
    }
    sort = sort_map.get(tri, [("date_scraped", -1)])

    col   = col_offres()
    total = col.count_documents(filtre)
    docs  = list(
        col.find(filtre, {"description": 0, "company_about": 0})
           .sort(sort)
           .skip((page - 1) * limit)
           .limit(limit)
    )

    return {
        "total":  total,
        "page":   page,
        "pages":  (total + limit - 1) // limit if limit else 1,
        "offres": [_serialize(d) for d in docs],
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


@app.post("/scrape/now")
def scrape_now(source: str, background_tasks: BackgroundTasks):
    valides = ["indeed", "welcometothejungle", "linkedin", "pfebooks", "all"]
    if source not in valides:
        raise HTTPException(400, f"Source invalide. Options: {valides}")
    from scrapers.manager import run_scraper, run_all_scrapers
    if source == "all":
        background_tasks.add_task(run_all_scrapers)
    else:
        background_tasks.add_task(run_scraper, source)
    return {"message": f"Scraping '{source}' lancé", "timestamp": datetime.now(timezone.utc).isoformat()}


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


import re