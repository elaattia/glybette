import os
from datetime import datetime, timezone
from pymongo import MongoClient, DESCENDING, ASCENDING
from pymongo.errors import OperationFailure
from loguru import logger

from utils.repo_env import load_root_env

load_root_env()

_client: MongoClient | None = None
_db = None


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def get_client() -> MongoClient:
    global _client
    if _client is None:
        uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
        _client = MongoClient(
            uri,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            tz_aware=True,
            tzinfo=timezone.utc,
        )
    return _client


def get_db():
    global _db
    if _db is None:
        db_name = os.getenv("SCRAPING_MONGODB_NAME", "glybette")
        _db = get_client()[db_name]
    return _db


def col_offres():     return get_db()["offres"]
def col_archives():   return get_db()["offres_archives"]
def col_logs():       return get_db()["scraping_logs"]


def init_db():
    try:
        db = get_db()
        offres = db["offres"]

        offres.create_index("hash_unique", unique=True)
        offres.create_index([("type_offre",   ASCENDING)])
        offres.create_index([("source_site",  ASCENDING)])
        offres.create_index([("status",       ASCENDING)])
        offres.create_index([("date_scraped", DESCENDING)])
        offres.create_index([("date_publication", DESCENDING)])
        offres.create_index([("localisation", ASCENDING)])
        offres.create_index([("nb_vues",      DESCENDING)])

        offres.create_index([("teletravail",        ASCENDING)])
        offres.create_index([("niveau_experience",  ASCENDING)])

        offres.create_index([
            ("titre",       "text"),
            ("description", "text"),
            ("entreprise",  "text"),
            ("competences", "text"),
        ], name="text_search_index")

        archives = db["offres_archives"]
        archives.create_index([("source_site",    ASCENDING)])
        archives.create_index([("date_archivage", DESCENDING)])
        archives.create_index([("type_offre",     ASCENDING)])

        logger.success("MongoDB initialisée — index créés")

    except OperationFailure as e:
        if "IndexOptionsConflict" in str(e) or "already exists" in str(e):
            logger.warning("Index déjà existant — skip création")
        else:
            raise
    except Exception as e:
        logger.error(f"Erreur init MongoDB: {e}")
        raise


def test_connection() -> bool:
    try:
        get_client().admin.command("ping")
        logger.success("Connexion MongoDB Atlas OK")
        return True
    except Exception as e:
        logger.error(f"MongoDB non connecté: {e}")
        return False


def make_offre_doc(data: dict) -> dict:
    """
    Construit un document MongoDB complet depuis les données normalisées.
    Toutes les dates sont UTC-aware.
    """
    _now = now_utc()
    return {
        "hash_unique": data.get("hash_unique", ""),

        "titre":        data.get("titre", ""),
        "entreprise":   data.get("entreprise"),
        "description":  data.get("description"),
        "competences":  data.get("competences", []),
        "localisation": data.get("localisation"),
        "salaire":      data.get("salaire"),
        "type_contrat": data.get("type_contrat"),

        "lien_original":    data.get("lien_original") or data.get("lien", ""),
        "lien_image":       data.get("lien_image"),

        "type_offre":  data.get("type_offre", "emploi"),
        "domaine":     data.get("domaine"),
        "status":      "active",
        "source_site": data.get("source_site", ""),

        "company_about":       data.get("company_about"),       
        "niveau_experience":   data.get("niveau_experience"),   
        "taille_entreprise":   data.get("taille_entreprise"),   
        "teletravail":         data.get("teletravail"),         
        "nb_candidats":        data.get("nb_candidats"),        
        "site_web_entreprise": data.get("site_web_entreprise"),
        "email_contact":       data.get("email_contact"),

        "categories":  data.get("categories"),
        "nb_sujets":   data.get("nb_sujets"),
        "telephone":   data.get("telephone"),

        "date_publication": data.get("date_publication"),
        "date_scraped":     _now,
        "date_updated":     _now,

        "nb_vues":  0,
        "nb_clics": 0,
    }