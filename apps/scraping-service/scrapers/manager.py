from datetime import timezone, timedelta
from loguru import logger
from pymongo.errors import DuplicateKeyError

from database.db import col_offres, col_archives, col_logs, make_offre_doc, now_utc
from utils.dedup import is_new_and_mark

from scrapers.indeed    import IndeedScraper
from scrapers.wttj      import WTTJScraper
from scrapers.linkedin  import LinkedInScraper
from scrapers.pfebooks  import PFEBooksScraper

SCRAPERS = {
    "indeed":             IndeedScraper,
    "welcometothejungle": WTTJScraper,
    "linkedin":           LinkedInScraper,
    "pfebooks":           PFEBooksScraper,
}


def run_scraper(source_name: str) -> dict:
    if source_name not in SCRAPERS:
        return {"error": f"Scraper inconnu: {source_name}"}

    log_id = col_logs().insert_one({
        "source_site": source_name,
        "started_at":  now_utc(),       
        "status":      "running",
    }).inserted_id

    try:
        scraper = SCRAPERS[source_name]()
        offres_brutes = scraper.scrape()
    except Exception as e:
        logger.error(f"Erreur critique {source_name}: {e}")
        col_logs().update_one({"_id": log_id}, {"$set": {
            "status": "failed", "message": str(e),
            "finished_at": now_utc()   
        }})
        return {"error": str(e)}

    nb_nouvelles = nb_doublons = nb_erreurs = 0

    for offre_data in offres_brutes:
        try:
            result = _save_offre(offre_data)
            if result == "new":
                nb_nouvelles += 1
            elif result in ("duplicate", "invalid"):
                nb_doublons += 1
        except Exception as e:
            logger.error(f"Erreur save: {e}")
            nb_erreurs += 1

    col_logs().update_one({"_id": log_id}, {"$set": {
        "finished_at":  now_utc(),      
        "status":       "success" if nb_erreurs == 0 else "partial",
        "nb_scraped":   len(offres_brutes),
        "nb_nouvelles": nb_nouvelles,
        "nb_doublons":  nb_doublons,
        "nb_erreurs":   nb_erreurs,
    }})

    logger.success(f" [{source_name}] {nb_nouvelles} nouvelles | {nb_doublons} doublons | {nb_erreurs} erreurs")
    return {
        "source":        source_name,
        "total_scraped": len(offres_brutes),
        "nouvelles":     nb_nouvelles,
        "doublons":      nb_doublons,
        "erreurs":       nb_erreurs,
        "timestamp":     now_utc().isoformat(),
    }


def _save_offre(offre_data: dict) -> str:
    titre      = (offre_data.get("titre") or "").strip()
    entreprise = (offre_data.get("entreprise") or "")
    lien       = (offre_data.get("lien_original") or offre_data.get("lien") or "").strip()

    if not titre or not lien:
        return "invalid"

    is_new, hash_unique = is_new_and_mark(titre, entreprise, lien)
    if not is_new:
        return "duplicate"

    offre_data["hash_unique"] = hash_unique
    doc = make_offre_doc(offre_data)

    try:
        col_offres().insert_one(doc)
        return "new"
    except DuplicateKeyError:
        return "duplicate"
    except Exception as e:
        logger.error(f"Erreur insert: {e}")
        raise


def archive_old_offres(days: int = 60) -> int:
    cutoff = now_utc() - timedelta(days=days)  
    offres = col_offres()
    archives = col_archives()

    old = list(offres.find({"date_scraped": {"$lt": cutoff}, "status": "active"}))
    if not old:
        return 0

    archive_docs = []
    ids_to_update = []

    for o in old:
        duree = (now_utc() - o.get("date_scraped", now_utc())).days
        doc   = {**o}
        doc.pop("_id", None)
        doc["offre_id_original"]  = str(o["_id"])
        doc["date_archivage"]     = now_utc()
        doc["duree_active_jours"] = duree
        doc["nb_vues_total"]      = o.get("nb_vues", 0)
        archive_docs.append(doc)
        ids_to_update.append(o["_id"])

    archives.insert_many(archive_docs, ordered=False)
    offres.update_many({"_id": {"$in": ids_to_update}}, {"$set": {"status": "archivee"}})

    logger.info(f" {len(old)} offres archivées")
    return len(old)


def run_all_scrapers() -> list[dict]:
    return [run_scraper(name) for name in SCRAPERS]
