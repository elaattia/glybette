import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone, timedelta
from typing import Optional

from pydantic import BaseModel
from fastapi import FastAPI, Query, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId
from loguru import logger

from database.db import col_offres, col_archives, col_logs, test_connection, init_db
from scheduler.scheduler import start_scheduler, stop_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Scraping Service demarre")
    init_db()
    start_scheduler()
    yield

    stop_scheduler()
    logger.info("Scraping Service arretee")


app = FastAPI(
    title="Glybette Scraping Service",
    description="Service interne de scraping d'offres d'emploi",
    version="3.0.0",
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




#endpoint
@app.get("/offres")
def get_offres(
    type_offre:   Optional[str] = Query(None),
    source:       Optional[str] = Query(None),
    localisation: Optional[str] = Query(None),
    search:       Optional[str] = Query(None),
    page:         int           = Query(1, ge=1),
    limit:        int           = Query(20, ge=1, le=100),
    tri:          str           = Query("recent"),
):
    filtre = {"status": "active"}
    if type_offre:   filtre["type_offre"]  = type_offre
    if source:       filtre["source_site"] = source
    if localisation: filtre["localisation"] = {"$regex": localisation, "$options": "i"}
    if search:       filtre["$text"]        = {"$search": search}

    sort  = [("date_scraped", -1)] if tri == "recent" else [("nb_vues", -1)]
    col   = col_offres()
    total = col.count_documents(filtre)
    docs  = list(col.find(filtre, {"description": 0}).sort(sort).skip((page-1)*limit).limit(limit))

    return {
        "total":  total,
        "page":   page,
        "pages":  (total + limit - 1) // limit if limit else 1,
        "offres": [_serialize(d) for d in docs]
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
    nouvelles_24h = col.count_documents({"status": "active", "date_scraped": {"$gte": hier}})

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
    """JSON body alias for clients that call `/trigger` via the API gateway."""
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
