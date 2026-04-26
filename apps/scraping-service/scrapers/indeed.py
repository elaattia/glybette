
import asyncio
import json
import random
import re
import time
from datetime import datetime, timezone, timedelta
from loguru import logger

import requests
import dateparser
from .base_scraper import BaseScraper


class IndeedScraper(BaseScraper):
    SOURCE_NAME = "indeed"
    BASE_URL    = "https://fr.indeed.com"

    
    QUERIES = [
        {"q": "",                    "l": "Tunisie",  "type": "emploi"},
        {"q": "",                    "l": "Tunis",    "type": "emploi"},
        {"q": "",                    "l": "Sfax",     "type": "emploi"},
        {"q": "stage",               "l": "Tunisie",  "type": "stage"},
        {"q": "PFE",                 "l": "Tunisie",  "type": "pfe"},

        {"q": "développeur",         "l": "Tunisie",  "type": "emploi"},
        {"q": "software engineer",   "l": "Tunisie",  "type": "emploi"},
        {"q": "data scientist",      "l": "Tunisie",  "type": "emploi"},
        {"q": "DevOps",              "l": "Tunisie",  "type": "emploi"},
        {"q": "cybersécurité",       "l": "Tunisie",  "type": "emploi"},
        {"q": "product manager",     "l": "Tunisie",  "type": "emploi"},
        {"q": "intelligence artificielle", "l": "Tunisie", "type": "emploi"},

        {"q": "comptable",           "l": "Tunisie",  "type": "emploi"},
        {"q": "analyste financier",  "l": "Tunisie",  "type": "emploi"},
        {"q": "contrôleur de gestion", "l": "Tunisie","type": "emploi"},

        {"q": "marketing",           "l": "Tunisie",  "type": "emploi"},
        {"q": "community manager",   "l": "Tunisie",  "type": "emploi"},

        {"q": "commercial",          "l": "Tunisie",  "type": "emploi"},
        {"q": "business developer",  "l": "Tunisie",  "type": "emploi"},

        {"q": "responsable RH",      "l": "Tunisie",  "type": "emploi"},

        {"q": "ingénieur mécanique", "l": "Tunisie",  "type": "emploi"},
        {"q": "ingénieur électrique","l": "Tunisie",  "type": "emploi"},
        {"q": "ingénieur industriel","l": "Tunisie",  "type": "emploi"},
        {"q": "ingénieur génie civil","l": "Tunisie", "type": "emploi"},

        {"q": "médecin",             "l": "Tunisie",  "type": "emploi"},
        {"q": "pharmacien",          "l": "Tunisie",  "type": "emploi"},

        {"q": "supply chain",        "l": "Tunisie",  "type": "emploi"},

        {"q": "stage développement web",  "l": "Tunisie", "type": "stage"},
        {"q": "stage data",               "l": "Tunisie", "type": "stage"},
        {"q": "stage marketing",          "l": "Tunisie", "type": "stage"},
        {"q": "stage ingénieur",          "l": "Tunisie", "type": "stage"},
        {"q": "PFE développement",        "l": "Tunisie", "type": "pfe"},
        {"q": "PFE data",                 "l": "Tunisie", "type": "pfe"},
        {"q": "fin d'études informatique","l": "Tunisie", "type": "pfe"},
    ]

    def scrape(self) -> list[dict]:
        self.log_start()
        results = []
        total = len(self.QUERIES)

        session = requests.Session()
        session.headers.update(self.get_headers({
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
        }))

        for i, query in enumerate(self.QUERIES):
            try:
                offres = self._scrape_query_requests(session, query)
                results.extend(offres)
                logger.debug(f"[Indeed] [{i+1}/{total}] '{query['q'] or 'BROWSE'}' → {len(offres)}")

                if (i + 1) % 10 == 0:
                    pause = random.uniform(25, 45)
                    logger.info(f"[Indeed] Pause {pause:.0f}s après {i+1} requêtes")
                    time.sleep(pause)
                else:
                    time.sleep(random.uniform(4, 9))

            except Exception as e:
                logger.error(f"[Indeed] '{query['q']}': {e}")
                self.stats["erreurs"] += 1

        self.log_end()
        return results

    def _scrape_query_requests(self, session: requests.Session, query: dict) -> list[dict]:
        """
        Utilise requests (synchrone, léger) avec l'URL standard Indeed.
        Indeed renvoie du HTML mais avec des données JSON encodées dans la page
        (balise <script id="mosaic-data"> ou window._initialData).
        On parse ce JSON directement → pas de sélecteurs CSS fragiles.
        """
        offres = []
        q   = query["q"].replace(" ", "+")
        loc = query["l"].replace(" ", "+")
        url = f"https://fr.indeed.com/jobs?l={loc}&sort=date&fromage=1"
        if q:
            url += f"&q={q}"

        try:
            resp = session.get(url, timeout=20)
            if resp.status_code == 403 or "captcha" in resp.text.lower():
                logger.warning(f"[Indeed] Bloqué/CAPTCHA pour '{query['q']}' — skip")
                time.sleep(random.uniform(15, 30))
                return []

            json_match = re.search(
                r'window\.mosaic\.providerData\["mosaic-provider-jobcards"\]\s*=\s*(\{.*?\});',
                resp.text,
                re.DOTALL,
            )
            if json_match:
                try:
                    data = json.loads(json_match.group(1))
                    job_list = (
                        data.get("metaData", {})
                            .get("mosaicProviderJobCardsModel", {})
                            .get("results", [])
                    )
                    for job in job_list[:20]:
                        o = self._parse_json_job(job, query["type"])
                        if o:
                            offres.append(self.normalize(o))
                            self.stats["scraped"] += 1
                    if offres:
                        return offres
                except (json.JSONDecodeError, KeyError):
                    pass

            json_match2 = re.search(
                r'"jobKeysWithDescriptions"\s*:\s*(\{[^}]{10,}\})',
                resp.text,
            )
            if json_match2:
                try:
                    job_data = json.loads(json_match2.group(1))
                    for jk, jv in list(job_data.items())[:20]:
                        o = self._parse_json_v2(jk, jv, query["type"])
                        if o:
                            offres.append(self.normalize(o))
                            self.stats["scraped"] += 1
                    if offres:
                        return offres
                except Exception:
                    pass

            offres = self._parse_html_fallback(resp.text, query["type"])

        except requests.Timeout:
            logger.warning(f"[Indeed] Timeout '{query['q']}'")
        except Exception as e:
            logger.error(f"[Indeed] Erreur réseau '{query['q']}': {e}")

        return offres

    def _parse_json_job(self, job: dict, type_offre: str) -> dict | None:
        """Parse un job depuis le JSON mosaic d'Indeed."""
        titre = job.get("title", "").strip()
        if not titre or len(titre) < 3:
            return None

        entreprise = job.get("company", "").strip() or None
        localisation = job.get("formattedLocation", "") or job.get("jobLocationCity", "") or "Tunisie"

        job_key = job.get("jobkey", "") or job.get("jobKey", "")
        lien = f"https://fr.indeed.com/viewjob?jk={job_key}" if job_key else ""

        salaire = None
        salary_info = job.get("extractedSalary") or job.get("salarySnippet") or {}
        if salary_info:
            min_s = salary_info.get("min")
            max_s = salary_info.get("max")
            unit  = salary_info.get("type", "")
            if min_s and max_s:
                salaire = f"{min_s}–{max_s} {unit}".strip()
            elif salary_info.get("text"):
                salaire = salary_info["text"]

        date_pub = None
        pub_date_raw = job.get("pubDate") or job.get("date") or job.get("formattedRelativeTime")
        if pub_date_raw:
            if isinstance(pub_date_raw, (int, float)):
                ts = pub_date_raw / 1000 if pub_date_raw > 1e10 else pub_date_raw
                date_pub = datetime.fromtimestamp(ts, tz=timezone.utc)
            else:
                date_pub = dateparser.parse(
                    str(pub_date_raw),
                    languages=["fr", "en"],
                    settings={"RETURN_AS_TIMEZONE_AWARE": True, "TIMEZONE": "UTC"},
                )

        type_contrat = None
        job_types = job.get("jobTypes", []) or []
        if job_types:
            type_contrat = job_types[0]
        else:
            for attr in job.get("taxonomyAttributes", []):
                if attr.get("categoryLabel", "").lower() in ["type de poste", "job type", "emploi"]:
                    vals = attr.get("attributes", [])
                    if vals:
                        type_contrat = vals[0].get("label", "")
                        break

        description = job.get("snippet") or job.get("descriptionFragment") or None
        if description:
            description = re.sub(r"<[^>]+>", "", description).strip()

        lien_image = job.get("companyBrandingAttributes", {}).get("logoUrl") or None

        return {
            "titre":        titre,
            "entreprise":   entreprise,
            "localisation": localisation,
            "lien":         lien,
            "salaire":      salaire,
            "type_contrat": type_contrat,
            "description":  description,
            "lien_image":   lien_image,
            "type_offre":   type_offre,
            "date_publication": date_pub,
        }

    def _parse_json_v2(self, job_key: str, job_data: dict, type_offre: str) -> dict | None:
        """Parse format alternatif JSON d'Indeed."""
        titre = job_data.get("jobTitle", "").strip()
        if not titre:
            return None
        return {
            "titre":        titre,
            "entreprise":   job_data.get("company", "").strip() or None,
            "localisation": job_data.get("locationName") or "Tunisie",
            "lien":         f"https://fr.indeed.com/viewjob?jk={job_key}",
            "description":  re.sub(r"<[^>]+>", "", job_data.get("snippet", "")).strip() or None,
            "type_offre":   type_offre,
            "date_publication": None,
        }

    def _parse_html_fallback(self, html: str, type_offre: str) -> list[dict]:
        """
        Fallback HTML minimaliste — extrait les données sans Playwright.
        Utilise regex sur le HTML brut pour éviter les dépendances BS4 lourdes.
        """
        offres = []
        try:
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(html, "lxml")

            job_cards = soup.select("div[data-jk], li[data-jk]")

            for card in job_cards[:20]:
                try:
                    jk = card.get("data-jk", "")

                    titre_el = card.select_one("h2[class*='jobTitle'] span, h2 a span")
                    titre = titre_el.get_text(strip=True) if titre_el else ""
                    if not titre or titre.lower() in ["nouveau", "new"]:
                        continue

                    co_el = card.select_one("[data-testid='company-name'], [class*='companyName']")
                    entreprise = co_el.get_text(strip=True) if co_el else None

                    loc_el = card.select_one("[data-testid='text-location'], [class*='companyLocation']")
                    localisation = loc_el.get_text(strip=True) if loc_el else "Tunisie"

                    sal_el = card.select_one("[class*='salary'], [class*='Salary']")
                    salaire = sal_el.get_text(strip=True) if sal_el else None

                    date_el = card.select_one("span[class*='date'], [class*='Date'] span")
                    date_pub = None
                    if date_el:
                        date_pub = dateparser.parse(
                            date_el.get_text(strip=True),
                            languages=["fr", "en"],
                            settings={"RETURN_AS_TIMEZONE_AWARE": True, "TIMEZONE": "UTC"},
                        )

                    lien = f"https://fr.indeed.com/viewjob?jk={jk}" if jk else ""

                    offres.append(self.normalize({
                        "titre": titre,
                        "entreprise": entreprise,
                        "localisation": localisation,
                        "lien": lien,
                        "salaire": salaire,
                        "type_offre": type_offre,
                        "date_publication": date_pub,
                    }))
                    self.stats["scraped"] += 1
                except Exception:
                    pass
        except Exception as e:
            logger.debug(f"[Indeed] HTML fallback erreur: {e}")

        return offres