import random
import time
import os
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from loguru import logger
from dotenv import load_dotenv

load_dotenv()

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.82 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.86 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.82 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.82 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.4; rv:125.0) Gecko/20100101 Firefox/125.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0",
]

BASE_HEADERS = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
    "Accept-Encoding": "gzip, deflate",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Cache-Control": "max-age=0",
}


class BaseScraper(ABC):
    SOURCE_NAME = "base"
    BASE_URL    = ""

    def __init__(self):
        self.delay_min = float(os.getenv("SCRAPE_DELAY_MIN", 3))
        self.delay_max = float(os.getenv("SCRAPE_DELAY_MAX", 7))
        self.stats = {
            "scraped":    0,
            "nouvelles":  0,
            "doublons":   0,
            "erreurs":    0,
            "started_at": datetime.now(timezone.utc), 
        }

    def get_headers(self, extra: dict = None) -> dict:
        h = BASE_HEADERS.copy()
        h["User-Agent"] = random.choice(USER_AGENTS)
        if extra:
            h.update(extra)
        return h

    def wait(self, min_s=None, max_s=None):
        d = random.uniform(min_s or self.delay_min, max_s or self.delay_max)
        logger.debug(f"[{self.SOURCE_NAME}] attente {d:.1f}s")
        time.sleep(d)

    def log_start(self):
        logger.info(f"[{self.SOURCE_NAME}] Démarrage...")

    def log_end(self):
        s = self.stats
        dur = (datetime.now(timezone.utc) - s["started_at"]).seconds  
        logger.success(
            f"[{self.SOURCE_NAME}] {dur}s | "
            f"Scrapées:{s['scraped']} | Nouvelles:{s['nouvelles']} | "
            f"Doublons:{s['doublons']} | Erreurs:{s['erreurs']}"
        )

    def normalize(self, raw: dict) -> dict:
        return {
            "titre":            (raw.get("titre") or "").strip(),
            "entreprise":       (raw.get("entreprise") or "").strip() or None,
            "description":      (raw.get("description") or "").strip() or None,
            "competences":      raw.get("competences") or [],
            "localisation":     (raw.get("localisation") or "").strip() or None,
            "salaire":          raw.get("salaire"),
            "type_contrat":     raw.get("type_contrat"),
            "lien_original":    (raw.get("lien") or "").strip(),
            "lien_image":       raw.get("lien_image"),
            "type_offre":       raw.get("type_offre", "emploi"),
            "domaine":          raw.get("domaine"),
            "source_site":      self.SOURCE_NAME,
            "date_publication": self._ensure_utc(raw.get("date_publication")),
            #lil pfebooks
            "categories":           raw.get("categories"),
            "nb_sujets":            raw.get("nb_sujets"),
            "email_contact":        raw.get("email_contact"),
            "telephone":            raw.get("telephone"),
            "site_web_entreprise":  raw.get("site_web_entreprise"),
        }

    @staticmethod
    def _ensure_utc(dt) -> datetime | None:
        """
        Convertit n'importe quel datetime en UTC-aware.
        dateparser retourne souvent des datetime naïfs (sans timezone),
        ce qui cause les décalages de +1h/+2h.
        """
        if dt is None:
            return None
        if isinstance(dt, datetime):
            if dt.tzinfo is None:
                from datetime import timedelta
                return dt.replace(tzinfo=timezone.utc) - timedelta(hours=0) #ken time bil local tn badel 0 bi 1
            return dt.astimezone(timezone.utc)
        return None

    @abstractmethod
    def scrape(self) -> list[dict]:
        pass
