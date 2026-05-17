import json
import random
import re
import time
from datetime import datetime, timezone, date as date_type
from loguru import logger

from .base_scraper import BaseScraper

try:
    from jobspy import scrape_jobs as jobspy_scrape
    JOBSPY_OK = True
except ImportError:
    JOBSPY_OK = False
    logger.warning("[Indeed] python-jobspy non installé — pip install python-jobspy")

try:
    from curl_cffi import requests as cffi_requests
    CURL_CFFI_OK = True
except ImportError:
    CURL_CFFI_OK = False


class IndeedScraper(BaseScraper):
    SOURCE_NAME = "indeed"
    BASE_URL    = "https://fr.indeed.com"

    QUERIES = [
        {"q": "",                          "l": "Tunisie",  "type": "emploi"},
        {"q": "",                          "l": "Tunis",    "type": "emploi"},
        {"q": "",                          "l": "Sfax",     "type": "emploi"},
        {"q": "stage",                     "l": "Tunisie",  "type": "stage"},
        {"q": "PFE",                       "l": "Tunisie",  "type": "pfe"},
        {"q": "stage développement",       "l": "Tunisie",  "type": "stage"},
        {"q": "PFE informatique",          "l": "Tunisie",  "type": "pfe"},
        {"q": "développeur",               "l": "Tunisie",  "type": "emploi"},
        {"q": "software engineer",         "l": "Tunisie",  "type": "emploi"},
        {"q": "data scientist",            "l": "Tunisie",  "type": "emploi"},
        {"q": "DevOps",                    "l": "Tunisie",  "type": "emploi"},
        {"q": "cybersécurité",             "l": "Tunisie",  "type": "emploi"},
        {"q": "product manager",           "l": "Tunisie",  "type": "emploi"},
        {"q": "intelligence artificielle", "l": "Tunisie",  "type": "emploi"},
        {"q": "comptable",                 "l": "Tunisie",  "type": "emploi"},
        {"q": "analyste financier",        "l": "Tunisie",  "type": "emploi"},
        {"q": "marketing",                 "l": "Tunisie",  "type": "emploi"},
        {"q": "commercial",                "l": "Tunisie",  "type": "emploi"},
        {"q": "ingénieur mécanique",       "l": "Tunisie",  "type": "emploi"},
        {"q": "ingénieur électrique",      "l": "Tunisie",  "type": "emploi"},
    ]

    CHROME_VERSIONS = ["chrome120", "chrome124", "chrome131", "chrome132"]

    def scrape(self) -> list[dict]:
        self.log_start()
        results = []

        if JOBSPY_OK:
            results = self._scrape_jobspy()
        else:
            logger.warning("[Indeed] jobspy non disponible — passage direct à curl_cffi")

        if not results:
            if CURL_CFFI_OK:
                logger.info("[Indeed] Fallback curl_cffi")
                results = self._scrape_cffi()
            else:
                logger.error("[Indeed] curl_cffi non disponible non plus — pip install curl_cffi")

        if not results:
            logger.warning("[Indeed] Aucun résultat — vérifiez jobspy et curl_cffi")

        self.log_end()
        return results

    def _scrape_jobspy(self) -> list[dict]:
        results = []

        for q in self.QUERIES:
            try:
                jobs = jobspy_scrape(
                    site_name=["indeed"],
                    search_term=q["q"] or "emploi",
                    location=q["l"],
                    results_wanted=15,
                    hours_old=72,
                    country_indeed="worldwide",  
                    verbose=0,
                )

                if jobs is None or jobs.empty:
                    logger.debug(f"[Indeed jobspy] '{q['q']}' @ {q['l']} → 0 résultats")
                    time.sleep(random.uniform(2, 4))
                    continue

                count_before = len(results)
                for _, row in jobs.iterrows():
                    normalized = self._normalize_row(row, q["type"])
                    if normalized:
                        results.append(normalized)
                        self.stats["scraped"] += 1

                added = len(results) - count_before
                logger.info(f"[Indeed jobspy] '{q['q']}' @ {q['l']} → {added}")
                time.sleep(random.uniform(3, 6))

            except Exception as e:
                logger.warning(f"[Indeed jobspy] '{q['q']}': {e}")
                self.stats["erreurs"] += 1
                time.sleep(5)

        return results

    def _normalize_row(self, row, type_offre: str) -> dict | None:
        try:
            titre = _safe_str(row.get("title"))
            lien  = _safe_str(row.get("job_url"))
            if not titre or not lien:
                return None

            date_pub    = _to_datetime(row.get("date_posted"))
            salaire     = _build_salary(row)
            description = _safe_str(row.get("description"))
            competences = _extract_skills(description) if description else []
            niveau      = _extract_experience_level(description) if description else None

            jt = row.get("job_type")
            type_contrat = str(jt).replace("JobType.", "").replace("_", " ").title() if jt else None

            return self.normalize({
                "titre":               titre,
                "entreprise":          _safe_str(row.get("company")),
                "localisation":        _safe_str(row.get("location")) or "Tunisie",
                "lien":                lien,
                "description":         description,
                "type_offre":          type_offre,
                "date_publication":    date_pub,
                "salaire":             salaire,
                "type_contrat":        type_contrat,
                "competences":         competences,
                "niveau_experience":   niveau,
                "lien_image":          _safe_str(row.get("company_logo")),
                "site_web_entreprise": _safe_str(row.get("company_url")),
                "email_contact":       _first_email(row.get("emails")),
            })
        except Exception as e:
            logger.debug(f"[Indeed] _normalize_row: {e}")
            return None

    def _get_valid_impersonate(self) -> str | None:
        """
         FIX : teste chaque version chrome dans l'ordre et retourne la première
        supportée par la version de curl_cffi installée.
        Évite l'erreur "Impersonating chromeXXX is not supported".
        """
        for version in self.CHROME_VERSIONS:
            try:
                test_session = cffi_requests.Session(impersonate=version)
                logger.debug(f"[Indeed cffi] version valide : {version}")
                return version
            except Exception as e:
                logger.debug(f"[Indeed cffi] {version} non supporté : {e}")
                continue
        return None

    def _scrape_cffi(self) -> list[dict]:
        results = []

        valid_version = self._get_valid_impersonate()
        if not valid_version:
            logger.error(
                "[Indeed cffi] Aucune version Chrome supportée par curl_cffi. "
                "Mettez à jour : pip install --upgrade curl_cffi"
            )
            return results

        logger.info(f"[Indeed cffi] Utilisation de {valid_version}")
        session = cffi_requests.Session(impersonate=valid_version)
        session.headers.update({
            "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        })
        try:
            session.get(self.BASE_URL, timeout=20)
            time.sleep(random.uniform(3, 5))
        except Exception as e:
            logger.debug(f"[Indeed cffi] warm-up request échouée : {e}")

        for q in self.QUERIES[:8]:
            try:
                url = (f"{self.BASE_URL}/jobs"
                       f"?q={q['q'].replace(' ', '+')}"
                       f"&l={q['l'].replace(' ', '+')}"
                       f"&sort=date&fromage=3")
                resp = session.get(url, timeout=25)

                if resp.status_code in [403, 429]:
                    logger.warning(f"[Indeed cffi] Bloqué pour '{q['q']}'")
                    time.sleep(random.uniform(20, 40))
                    continue
                if "captcha" in resp.text.lower():
                    logger.warning(f"[Indeed cffi] CAPTCHA pour '{q['q']}'")
                    time.sleep(random.uniform(15, 30))
                    continue

                parsed = self._extract_json(resp.text, q["type"])
                if not parsed:
                    parsed = self._parse_html(resp.text, q["type"])

                results.extend(parsed)
                self.stats["scraped"] += len(parsed)
                logger.info(f"[Indeed cffi] '{q['q']}' → {len(parsed)} offres")
                time.sleep(random.uniform(8, 15))

            except Exception as e:
                logger.error(f"[Indeed cffi] '{q['q']}': {e}")
                self.stats["erreurs"] += 1

        return results

    def _extract_json(self, html: str, type_offre: str) -> list[dict]:
        match = re.search(
            r'window\.mosaic\.providerData\["mosaic-provider-jobcards"\]\s*=\s*(\{.+?\});\s*window',
            html, re.DOTALL
        )
        if not match:
            return []
        try:
            data = json.loads(match.group(1))
            job_list = (
                data.get("metaData", {})
                    .get("mosaicProviderJobCardsModel", {})
                    .get("results", [])
            )
            results = []
            for job in job_list[:20]:
                titre = job.get("title", "").strip()
                if not titre:
                    continue
                job_key  = job.get("jobkey") or job.get("jobKey", "")
                lien     = f"https://fr.indeed.com/viewjob?jk={job_key}" if job_key else ""
                desc_raw = job.get("snippet") or job.get("descriptionFragment") or None
                desc     = re.sub(r"<[^>]+>", "", desc_raw).strip() if desc_raw else None

                salary_info = job.get("extractedSalary") or job.get("salarySnippet") or {}
                salaire = None
                if isinstance(salary_info, dict):
                    min_s = salary_info.get("min")
                    max_s = salary_info.get("max")
                    unit  = salary_info.get("type", "")
                    if min_s and max_s:
                        salaire = f"{min_s}–{max_s} {unit}".strip()

                date_pub = None
                raw_date = job.get("pubDate") or job.get("date")
                if raw_date:
                    if isinstance(raw_date, (int, float)):
                        ts = raw_date / 1000 if raw_date > 1e10 else raw_date
                        date_pub = datetime.fromtimestamp(ts, tz=timezone.utc)
                    else:
                        import dateparser
                        date_pub = dateparser.parse(
                            str(raw_date), languages=["fr", "en"],
                            settings={"RETURN_AS_TIMEZONE_AWARE": True, "TIMEZONE": "UTC"},
                        )

                results.append(self.normalize({
                    "titre":        titre,
                    "entreprise":   job.get("company", "").strip() or None,
                    "localisation": job.get("formattedLocation") or "Tunisie",
                    "lien":         lien,
                    "description":  desc,
                    "salaire":      salaire,
                    "type_offre":   type_offre,
                    "date_publication": date_pub,
                    "lien_image":   job.get("companyBrandingAttributes", {}).get("logoUrl"),
                }))
                self.stats["scraped"] += 1
            return results
        except Exception:
            return []

    def _parse_html(self, html: str, type_offre: str) -> list[dict]:
        from bs4 import BeautifulSoup
        import dateparser
        soup = BeautifulSoup(html, "lxml")
        cards = soup.select("div.job_seen_beacon, li[class*='job_seen'], div[data-jk]")
        results = []
        for card in cards[:15]:
            try:
                title_el = card.select_one("h2 span[id], h2 span[title], h2 a span, h2[class*='jobTitle'] span")
                titre = title_el.get_text(strip=True) if title_el else None
                if not titre or titre.lower() in ["nouveau", "new"]:
                    continue

                company_el  = card.select_one("[data-testid='company-name'], [class*='companyName']")
                location_el = card.select_one("[data-testid='text-location'], [class*='companyLocation']")
                salary_el   = card.select_one("[class*='salary'], [class*='Salary']")
                date_el     = card.select_one("span[class*='date'], [class*='Date'] span")
                link_el     = card.select_one("a[id*='job'], a[href*='jk='], h2 a")

                link = None
                if link_el:
                    href = link_el.get("href", "")
                    link = href if href.startswith("http") else f"{self.BASE_URL}{href}"

                date_pub = None
                if date_el:
                    date_pub = dateparser.parse(
                        date_el.get_text(strip=True),
                        languages=["fr", "en"],
                        settings={"RETURN_AS_TIMEZONE_AWARE": True, "TIMEZONE": "UTC"},
                    )

                results.append(self.normalize({
                    "titre":        titre,
                    "entreprise":   company_el.get_text(strip=True) if company_el else None,
                    "localisation": location_el.get_text(strip=True) if location_el else "Tunisie",
                    "salaire":      salary_el.get_text(strip=True) if salary_el else None,
                    "lien":         link,
                    "type_offre":   type_offre,
                    "date_publication": date_pub,
                }))
                self.stats["scraped"] += 1
            except Exception:
                continue
        return results



def _safe_str(val) -> str | None:
    if val is None:
        return None
    s = str(val).strip()
    return None if s in ("nan", "None", "NaN", "NaT", "") else s


def _to_datetime(val) -> datetime | None:
    if val is None:
        return None
    if isinstance(val, datetime):
        return val.replace(tzinfo=timezone.utc) if val.tzinfo is None else val
    if isinstance(val, date_type):
        return datetime(val.year, val.month, val.day, tzinfo=timezone.utc)
    if isinstance(val, str) and val:
        try:
            import dateparser
            return dateparser.parse(val, settings={"RETURN_AS_TIMEZONE_AWARE": True})
        except Exception:
            pass
    return None


def _build_salary(row) -> str | None:
    min_s    = row.get("min_amount")
    max_s    = row.get("max_amount")
    currency = _safe_str(row.get("currency")) or "TND"
    interval = _safe_str(row.get("interval")) or ""
    if min_s and max_s:
        try:
            return f"{int(min_s):,} – {int(max_s):,} {currency}/{interval}".strip("/ ")
        except Exception:
            pass
    return None


def _first_email(val) -> str | None:
    if val is None:
        return None
    if isinstance(val, list) and val:
        return str(val[0]).strip() or None
    s = str(val).strip()
    return s if "@" in s else None


_SKILL_KEYWORDS = [
    "Python", "Java", "JavaScript", "TypeScript", "React", "Angular", "Vue",
    "Node.js", "Django", "Spring", "Laravel", "PHP", "C++", "C#", ".NET",
    "Go", "Rust", "Kotlin", "Swift", "Flutter", "Docker", "Kubernetes",
    "AWS", "Azure", "GCP", "Linux", "SQL", "MongoDB", "PostgreSQL", "MySQL",
    "Redis", "Elasticsearch", "Git", "CI/CD", "DevOps", "Machine Learning",
    "Deep Learning", "TensorFlow", "PyTorch", "Pandas", "Spark", "Hadoop",
    "Power BI", "Tableau", "SAP", "Salesforce", "Jira", "Agile", "Scrum",
]


def _extract_skills(description: str) -> list[str]:
    if not description:
        return []
    return [s for s in _SKILL_KEYWORDS if s.lower() in description.lower()][:12]


def _extract_experience_level(description: str) -> str | None:
    if not description:
        return None
    d = description.lower()
    for pattern, level in [
        (r'\b(junior|débutant|entry.?level|0[\-–]1\s*an)\b', "Junior"),
        (r'\b(confirmé|intermédiaire|mid.?level|[12]\s*[-–]\s*[34]\s*ans?)\b', "Mid"),
        (r'\b(senior|expérimenté|lead|expert|[3-9]\+?\s*ans?)\b', "Senior"),
    ]:
        if re.search(pattern, d):
            return level
    return None