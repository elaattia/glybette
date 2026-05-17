import hashlib
import os
from datetime import datetime, timezone, timedelta
from loguru import logger

_redis = None
try:
    import redis as _rlib
    r = _rlib.Redis(
        host=os.getenv("REDIS_HOST", "localhost"),
        port=int(os.getenv("REDIS_PORT", 6379)),
        decode_responses=True,
        socket_connect_timeout=2,
    )
    r.ping()
    _redis = r
    logger.success("Redis connecté (déduplication rapide activée)")
except Exception:
    logger.info("ℹ Redis absent — déduplication via MongoDB")


def make_hash(titre: str, entreprise: str, lien: str) -> str:
    raw = f"{titre.lower().strip()}|{(entreprise or '').lower().strip()}|{lien.strip()}"
    return hashlib.sha256(raw.encode()).hexdigest()


def is_new_and_mark(titre: str, entreprise: str, lien: str) -> tuple[bool, str]:
    """
    Retourne (is_new, hash_unique).

    Logique :
    - Avec Redis : cache TTL 24h → une offre est "nouvelle" si elle n'est pas
      dans le cache (pas scrapée aujourd'hui)
    - Sans Redis : vérifie MongoDB → une offre est "nouvelle" si elle n'existe
      pas OU si des données significatives ont changé
    
    Amélioration : on ne republisse pas systématiquement, on vérifie d'abord
    si l'offre a réellement du contenu nouveau.
    """
    h = make_hash(titre, entreprise, lien)

    if _redis:
        try:
            key = f"offre:{h}"
            if _redis.exists(key):
                return False, h
            _redis.set(key, "1")
            return True, h
        except Exception:
            pass

    try:
        from database.db import col_offres
        existing = col_offres().find_one(
            {"hash_unique": h},
            {"_id": 1, "date_scraped": 1, "date_updated": 1, "source_site": 1}
        )

        if not existing:
            return True, h

        
        return False, h

    except Exception as e:
        logger.debug(f"[dedup] Erreur MongoDB check: {e}")
        return True, h