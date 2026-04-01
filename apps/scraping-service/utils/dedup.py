import hashlib
import os
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
    logger.success("✅ Redis connecté (dedup rapide activé)")
except Exception:
    logger.info("ℹ️  Redis absent — déduplication via index unique MongoDB")


def make_hash(titre: str, entreprise: str, lien: str) -> str:
    raw = f"{titre.lower().strip()}|{(entreprise or '').lower().strip()}|{lien.strip()}"
    return hashlib.sha256(raw.encode()).hexdigest()


def is_new_and_mark(titre: str, entreprise: str, lien: str) -> tuple[bool, str]:
    h = make_hash(titre, entreprise, lien)
    if _redis:
        try:
            key = f"offre:{h}"
            if _redis.exists(key):
                return False, h
            _redis.setex(key, 60 * 60 * 24 * 90, "1")
            return True, h
        except Exception:
            pass
    return True, h
