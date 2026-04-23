import asyncio
import random
from loguru import logger

try:
    from playwright.async_api import async_playwright, TimeoutError as PWTimeout
    PLAYWRIGHT_OK = True
except ImportError:
    PLAYWRIGHT_OK = False

import dateparser
from .base_scraper import BaseScraper


class IndeedScraper(BaseScraper):
    SOURCE_NAME = "indeed"
    BASE_URL    = "https://fr.indeed.com"


    BROWSE_QUERIES = [
        {"q": "",  "l": "Tunis",   "type": "emploi"},
        {"q": "",  "l": "Sfax",    "type": "emploi"},
        {"q": "",  "l": "Sousse",  "type": "emploi"},
        {"q": "",  "l": "Tunisie", "type": "emploi"},
        {"q": "stage",                  "l": "Tunisie", "type": "stage"},
        {"q": "stage",                  "l": "Tunis",   "type": "stage"},
        {"q": "PFE",                    "l": "Tunisie", "type": "pfe"},
        {"q": "stage fin d'études",     "l": "Tunisie", "type": "pfe"},
    ]



    DOMAIN_QUERIES = [
        # Technologie & Informatique
        {"q": "développeur",                    "l": "Tunisie", "type": "emploi"},
        {"q": "développeur web",                "l": "Tunisie", "type": "emploi"},
        {"q": "développeur mobile",             "l": "Tunisie", "type": "emploi"},
        {"q": "développeur React",              "l": "Tunisie", "type": "emploi"},
        {"q": "développeur Angular",            "l": "Tunisie", "type": "emploi"},
        {"q": "développeur Node.js",            "l": "Tunisie", "type": "emploi"},
        {"q": "développeur Python",             "l": "Tunisie", "type": "emploi"},
        {"q": "développeur Java",               "l": "Tunisie", "type": "emploi"},
        {"q": "développeur PHP",                "l": "Tunisie", "type": "emploi"},
        {"q": "fullstack developer",            "l": "Tunisie", "type": "emploi"},
        {"q": "frontend developer",             "l": "Tunisie", "type": "emploi"},
        {"q": "backend developer",              "l": "Tunisie", "type": "emploi"},
        {"q": "ingénieur logiciel",             "l": "Tunisie", "type": "emploi"},
        {"q": "ingénieur informatique",         "l": "Tunisie", "type": "emploi"},
        {"q": "data scientist",                 "l": "Tunisie", "type": "emploi"},
        {"q": "data engineer",                  "l": "Tunisie", "type": "emploi"},
        {"q": "data analyst",                   "l": "Tunisie", "type": "emploi"},
        {"q": "machine learning engineer",      "l": "Tunisie", "type": "emploi"},
        {"q": "intelligence artificielle",      "l": "Tunisie", "type": "emploi"},
        {"q": "DevOps engineer",                "l": "Tunisie", "type": "emploi"},
        {"q": "cloud engineer",                 "l": "Tunisie", "type": "emploi"},
        {"q": "cybersécurité",                  "l": "Tunisie", "type": "emploi"},
        {"q": "analyste cybersécurité",         "l": "Tunisie", "type": "emploi"},
        {"q": "administrateur système Linux",   "l": "Tunisie", "type": "emploi"},
        {"q": "administrateur réseau",          "l": "Tunisie", "type": "emploi"},
        {"q": "ingénieur réseaux télécoms",     "l": "Tunisie", "type": "emploi"},
        {"q": "chef de projet informatique",    "l": "Tunisie", "type": "emploi"},
        {"q": "scrum master",                   "l": "Tunisie", "type": "emploi"},
        {"q": "product manager",                "l": "Tunisie", "type": "emploi"},
        {"q": "QA engineer testeur",            "l": "Tunisie", "type": "emploi"},
        {"q": "ERP consultant",                 "l": "Tunisie", "type": "emploi"},
        {"q": "SAP consultant",                 "l": "Tunisie", "type": "emploi"},
        {"q": "business analyst",               "l": "Tunisie", "type": "emploi"},
        {"q": "architecte solution",            "l": "Tunisie", "type": "emploi"},
        {"q": "embedded software engineer",     "l": "Tunisie", "type": "emploi"},
        {"q": "développeur Flutter",            "l": "Tunisie", "type": "emploi"},
        {"q": "développeur iOS Android",        "l": "Tunisie", "type": "emploi"},

        # Design & Créatif
        {"q": "designer UI UX",                 "l": "Tunisie", "type": "emploi"},
        {"q": "graphiste",                      "l": "Tunisie", "type": "emploi"},
        {"q": "web designer",                   "l": "Tunisie", "type": "emploi"},
        {"q": "motion designer",                "l": "Tunisie", "type": "emploi"},
        {"q": "directeur artistique",           "l": "Tunisie", "type": "emploi"},
        {"q": "infographiste",                  "l": "Tunisie", "type": "emploi"},

        # Finance & Comptabilité
        {"q": "comptable",                      "l": "Tunisie", "type": "emploi"},
        {"q": "expert comptable",               "l": "Tunisie", "type": "emploi"},
        {"q": "contrôleur de gestion",          "l": "Tunisie", "type": "emploi"},
        {"q": "analyste financier",             "l": "Tunisie", "type": "emploi"},
        {"q": "auditeur interne",               "l": "Tunisie", "type": "emploi"},
        {"q": "auditeur externe",               "l": "Tunisie", "type": "emploi"},
        {"q": "trésorier",                      "l": "Tunisie", "type": "emploi"},
        {"q": "directeur financier CFO",        "l": "Tunisie", "type": "emploi"},
        {"q": "responsable comptabilité",       "l": "Tunisie", "type": "emploi"},
        {"q": "fiscaliste",                     "l": "Tunisie", "type": "emploi"},

        # Banque & Assurance
        {"q": "conseiller bancaire",            "l": "Tunisie", "type": "emploi"},
        {"q": "chargé de clientèle banque",     "l": "Tunisie", "type": "emploi"},
        {"q": "analyste crédit risque",         "l": "Tunisie", "type": "emploi"},
        {"q": "gestionnaire sinistres assurance","l": "Tunisie","type": "emploi"},
        {"q": "agent d'assurance",              "l": "Tunisie", "type": "emploi"},
        {"q": "actuaire",                       "l": "Tunisie", "type": "emploi"},
        {"q": "chargé d'affaires corporate",    "l": "Tunisie", "type": "emploi"},

        # Marketing & Communication
        {"q": "responsable marketing",          "l": "Tunisie", "type": "emploi"},
        {"q": "digital marketing manager",      "l": "Tunisie", "type": "emploi"},
        {"q": "community manager",              "l": "Tunisie", "type": "emploi"},
        {"q": "chargé de communication",        "l": "Tunisie", "type": "emploi"},
        {"q": "content manager",                "l": "Tunisie", "type": "emploi"},
        {"q": "SEO SEM specialist",             "l": "Tunisie", "type": "emploi"},
        {"q": "chef de produit marketing",      "l": "Tunisie", "type": "emploi"},
        {"q": "responsable communication",      "l": "Tunisie", "type": "emploi"},
        {"q": "growth hacker",                  "l": "Tunisie", "type": "emploi"},

        # Vente & Commercial
        {"q": "commercial",                     "l": "Tunisie", "type": "emploi"},
        {"q": "ingénieur commercial",           "l": "Tunisie", "type": "emploi"},
        {"q": "responsable commercial",         "l": "Tunisie", "type": "emploi"},
        {"q": "business developer",             "l": "Tunisie", "type": "emploi"},
        {"q": "account manager",                "l": "Tunisie", "type": "emploi"},
        {"q": "directeur commercial",           "l": "Tunisie", "type": "emploi"},
        {"q": "téléconseiller",                 "l": "Tunisie", "type": "emploi"},
        {"q": "conseiller clientèle",           "l": "Tunisie", "type": "emploi"},
        {"q": "représentant commercial",        "l": "Tunisie", "type": "emploi"},

        # Ressources Humaines
        {"q": "responsable RH",                 "l": "Tunisie", "type": "emploi"},
        {"q": "chargé de recrutement",          "l": "Tunisie", "type": "emploi"},
        {"q": "DRH directeur ressources humaines","l": "Tunisie","type": "emploi"},
        {"q": "gestionnaire paie",              "l": "Tunisie", "type": "emploi"},
        {"q": "consultant RH",                  "l": "Tunisie", "type": "emploi"},
        {"q": "chargé de formation",            "l": "Tunisie", "type": "emploi"},
        {"q": "psychologue du travail",         "l": "Tunisie", "type": "emploi"},

        # Juridique & Conformité
        {"q": "juriste",                        "l": "Tunisie", "type": "emploi"},
        {"q": "avocat",                         "l": "Tunisie", "type": "emploi"},
        {"q": "conseiller juridique",           "l": "Tunisie", "type": "emploi"},
        {"q": "compliance officer",             "l": "Tunisie", "type": "emploi"},
        {"q": "responsable juridique",          "l": "Tunisie", "type": "emploi"},
        {"q": "notaire clerc",                  "l": "Tunisie", "type": "emploi"},

        # Ingénierie & Industrie
        {"q": "ingénieur mécanique",            "l": "Tunisie", "type": "emploi"},
        {"q": "ingénieur électrique",           "l": "Tunisie", "type": "emploi"},
        {"q": "ingénieur électronique",         "l": "Tunisie", "type": "emploi"},
        {"q": "ingénieur industriel",           "l": "Tunisie", "type": "emploi"},
        {"q": "ingénieur production",           "l": "Tunisie", "type": "emploi"},
        {"q": "ingénieur qualité",              "l": "Tunisie", "type": "emploi"},
        {"q": "ingénieur process",              "l": "Tunisie", "type": "emploi"},
        {"q": "technicien maintenance",         "l": "Tunisie", "type": "emploi"},
        {"q": "responsable maintenance",        "l": "Tunisie", "type": "emploi"},
        {"q": "responsable production",         "l": "Tunisie", "type": "emploi"},
        {"q": "lean manufacturing",             "l": "Tunisie", "type": "emploi"},
        {"q": "automatisme SCADA PLC",          "l": "Tunisie", "type": "emploi"},
        {"q": "ingénieur automobile",           "l": "Tunisie", "type": "emploi"},
        {"q": "ingénieur aéronautique",         "l": "Tunisie", "type": "emploi"},
        {"q": "ingénieur télécommunications",   "l": "Tunisie", "type": "emploi"},
        {"q": "ingénieur génie civil",          "l": "Tunisie", "type": "emploi"},
        {"q": "ingénieur HSE",                  "l": "Tunisie", "type": "emploi"},
        {"q": "ingénieur R&D",                  "l": "Tunisie", "type": "emploi"},

        # Santé & Médical
        {"q": "médecin",                        "l": "Tunisie", "type": "emploi"},
        {"q": "pharmacien",                     "l": "Tunisie", "type": "emploi"},
        {"q": "infirmier",                      "l": "Tunisie", "type": "emploi"},
        {"q": "biologiste médical",             "l": "Tunisie", "type": "emploi"},
        {"q": "médecin du travail",             "l": "Tunisie", "type": "emploi"},
        {"q": "délégué médical",                "l": "Tunisie", "type": "emploi"},
        {"q": "directeur médical",              "l": "Tunisie", "type": "emploi"},

        # Éducation & Formation
        {"q": "enseignant formateur",           "l": "Tunisie", "type": "emploi"},
        {"q": "formateur IT",                   "l": "Tunisie", "type": "emploi"},
        {"q": "directeur pédagogique",          "l": "Tunisie", "type": "emploi"},
        {"q": "e-learning instructional design","l": "Tunisie", "type": "emploi"},

        # Logistique & Supply Chain
        {"q": "responsable logistique",         "l": "Tunisie", "type": "emploi"},
        {"q": "supply chain manager",           "l": "Tunisie", "type": "emploi"},
        {"q": "responsable achats",             "l": "Tunisie", "type": "emploi"},
        {"q": "gestionnaire de stock",          "l": "Tunisie", "type": "emploi"},
        {"q": "chef de projet logistique",      "l": "Tunisie", "type": "emploi"},
        {"q": "acheteur approvisionnement",     "l": "Tunisie", "type": "emploi"},

        # Hôtellerie, Tourisme & Restauration
        {"q": "directeur hôtel",                "l": "Tunisie", "type": "emploi"},
        {"q": "réceptionniste hôtel",           "l": "Tunisie", "type": "emploi"},
        {"q": "chef cuisinier restauration",    "l": "Tunisie", "type": "emploi"},
        {"q": "responsable restauration",       "l": "Tunisie", "type": "emploi"},

        # Architecture & BTP
        {"q": "architecte",                     "l": "Tunisie", "type": "emploi"},
        {"q": "ingénieur BTP",                  "l": "Tunisie", "type": "emploi"},
        {"q": "conducteur de travaux",          "l": "Tunisie", "type": "emploi"},
        {"q": "dessinateur projeteur BIM",      "l": "Tunisie", "type": "emploi"},

        # Direction & Management
        {"q": "directeur général CEO",          "l": "Tunisie", "type": "emploi"},
        {"q": "directeur des opérations",       "l": "Tunisie", "type": "emploi"},
        {"q": "directeur technique CTO",        "l": "Tunisie", "type": "emploi"},
        {"q": "responsable projet PMO",         "l": "Tunisie", "type": "emploi"},
    ]

    INTERNSHIP_QUERIES = [
        {"q": "stage développement web",           "l": "Tunisie", "type": "stage"},
        {"q": "stage développement mobile",        "l": "Tunisie", "type": "stage"},
        {"q": "stage data science",                "l": "Tunisie", "type": "stage"},
        {"q": "stage DevOps cloud",                "l": "Tunisie", "type": "stage"},
        {"q": "stage marketing digital",           "l": "Tunisie", "type": "stage"},
        {"q": "stage finance comptabilité",        "l": "Tunisie", "type": "stage"},
        {"q": "stage commercial vente",            "l": "Tunisie", "type": "stage"},
        {"q": "stage communication",               "l": "Tunisie", "type": "stage"},
        {"q": "stage ressources humaines",         "l": "Tunisie", "type": "stage"},
        {"q": "stage ingénieur",                   "l": "Tunisie", "type": "stage"},
        {"q": "stage design UI UX",                "l": "Tunisie", "type": "stage"},
        {"q": "stage logistique supply chain",     "l": "Tunisie", "type": "stage"},
        {"q": "PFE développement web",             "l": "Tunisie", "type": "pfe"},
        {"q": "PFE data intelligence artificielle","l": "Tunisie", "type": "pfe"},
        {"q": "PFE cybersécurité",                 "l": "Tunisie", "type": "pfe"},
        {"q": "PFE cloud DevOps",                  "l": "Tunisie", "type": "pfe"},
        {"q": "PFE ingénieur mécanique",           "l": "Tunisie", "type": "pfe"},
        {"q": "PFE ingénieur électrique",          "l": "Tunisie", "type": "pfe"},
        {"q": "PFE finance",                       "l": "Tunisie", "type": "pfe"},
        {"q": "fin d'études informatique",         "l": "Tunisie", "type": "pfe"},
        {"q": "fin d'études ingénieur",            "l": "Tunisie", "type": "pfe"},
        {"q": "fin d'études marketing",            "l": "Tunisie", "type": "pfe"},
    ]

    @property
    def ALL_QUERIES(self):
        return self.BROWSE_QUERIES + self.DOMAIN_QUERIES + self.INTERNSHIP_QUERIES

    def scrape(self) -> list[dict]:
        if not PLAYWRIGHT_OK:
            logger.error("[Indeed] Playwright non installé")
            return []
        return asyncio.run(self._async_scrape())

    async def _async_scrape(self) -> list[dict]:
        self.log_start()
        results = []
        total_q = len(self.ALL_QUERIES)
        logger.info(f"[Indeed] {total_q} requêtes planifiées")

        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=True,
                args=["--no-sandbox", "--disable-blink-features=AutomationControlled",
                      "--disable-dev-shm-usage", "--disable-gpu", "--window-size=1366,768"],
            )
            context = await browser.new_context(
                user_agent=random.choice([
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.82 Safari/537.36",
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.82 Safari/537.36",
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
                ]),
                viewport={"width": 1366, "height": 768},
                locale="fr-FR",
                extra_http_headers={"Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8"},
            )
            await context.add_init_script("""
                Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
                Object.defineProperty(navigator, 'plugins', {get: () => [1,2,3]});
                window.chrome = { runtime: {} };
            """)
            page = await context.new_page()



            try:
                await page.goto("https://fr.indeed.com", wait_until="domcontentloaded", timeout=30000)
                await asyncio.sleep(random.uniform(2, 4))
                for sel in ["#onetrust-accept-btn-handler", "button[id*='accept']"]:
                    try:
                        btn = await page.query_selector(sel)
                        if btn:
                            await btn.click()
                            await asyncio.sleep(1)
                            break
                    except Exception:
                        pass
            except Exception as e:
                logger.warning(f"[Indeed] Homepage: {e}")

            for i, query in enumerate(self.ALL_QUERIES):
                try:
                    offres = await self._scrape_query(page, query)
                    results.extend(offres)
                    logger.debug(f"[Indeed] [{i+1}/{total_q}] '{query['q'] or 'BROWSE'}' → {len(offres)}")
                    # pause toutes les 20 requetes pour eviter les bans
                    if (i + 1) % 20 == 0:
                        pause = random.uniform(30, 60)
                        logger.info(f"[Indeed] Pause anti-ban {pause:.0f}s après {i+1} requêtes")
                        await asyncio.sleep(pause)
                    else:
                        await asyncio.sleep(random.uniform(3, 7))
                except Exception as e:
                    logger.error(f"[Indeed] '{query['q']}': {e}")
                    self.stats["erreurs"] += 1

            await browser.close()

        self.log_end()
        return results

    async def _scrape_query(self, page, query: dict) -> list[dict]:
        offres = []
        q   = query["q"].replace(" ", "+")
        loc = query["l"].replace(" ", "+")
        url = f"https://fr.indeed.com/jobs?l={loc}&sort=date&fromage=1" + (f"&q={q}" if q else "")

        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=30000)
            await asyncio.sleep(random.uniform(2, 4))

            content = await page.content()
            if "captcha" in content.lower() or "robot" in content.lower():
                logger.warning(f"[Indeed] CAPTCHA '{query['q']}' — pause 45s")
                await asyncio.sleep(45)
                return []

            for _ in range(3):
                await page.evaluate("window.scrollBy(0, 600)")
                await asyncio.sleep(0.8)

            cards = []
            for sel in [
                "li.css-5lfssm", "div.job_seen_beacon",
                "li[class*='css-'][class*='eu4oa1w']", "td.resultContent",
                "div[class*='jobsearch-ResultsList'] li",
                "ul[class*='jobsearch-ResultsList'] > li",
            ]:
                cards = await page.query_selector_all(sel)
                if cards:
                    break

            for card in cards[:20]:
                try:
                    o = await self._parse_card(card, query["type"])
                    if o and o.get("titre") and len(o["titre"]) > 3:
                        offres.append(self.normalize(o))
                        self.stats["scraped"] += 1
                except Exception:
                    pass

        except PWTimeout:
            logger.warning(f"[Indeed] Timeout '{query['q']}'")
        except Exception as e:
            logger.error(f"[Indeed] {e}")
        return offres

    async def _parse_card(self, card, type_offre: str) -> dict:
        titre = ""
        for sel in ["h2.jobTitle span[title]", "h2.jobTitle a span",
                    "h2[class*='jobTitle'] span", "span[id*='jobTitle']", "h2 a span"]:
            el = await card.query_selector(sel)
            if el:
                t = (await el.inner_text()).strip()
                if t and t.lower() not in ["nouveau", "new", ""]:
                    titre = t
                    break

        entreprise = None
        for sel in ["[class*='companyName']", "span[class*='company']", "[data-testid='company-name']"]:
            el = await card.query_selector(sel)
            if el:
                entreprise = (await el.inner_text()).strip()
                break

        localisation = "Tunisie"
        for sel in ["[class*='companyLocation']", "[data-testid='text-location']"]:
            el = await card.query_selector(sel)
            if el:
                localisation = (await el.inner_text()).strip()
                break

        lien = ""
        for sel in ["h2.jobTitle a", "a[class*='jcs-JobTitle']", "h2 a"]:
            el = await card.query_selector(sel)
            if el:
                href = await el.get_attribute("href")
                if href:
                    lien = (href if href.startswith("http") else f"https://fr.indeed.com{href}").split("&")[0]
                    break

        date_pub = None
        for sel in ["span[class*='date']", "time", "[class*='Date']"]:
            el = await card.query_selector(sel)
            if el:
                date_pub = dateparser.parse(
                    (await el.inner_text()).strip(),
                    languages=["fr", "en"],
                    settings={"RETURN_AS_TIMEZONE_AWARE": True, "TIMEZONE": "UTC"},
                )
                if date_pub:
                    break

        salaire = None
        for sel in ["[class*='salary']", "[class*='Salary']", "[data-testid='attribute_snippet_testid']"]:
            el = await card.query_selector(sel)
            if el:
                t = (await el.inner_text()).strip()
                if any(c in t for c in ["TND", "DT", "€", "$", "dinars"]):
                    salaire = t
                    break

        desc = None
        for sel in [".job-snippet", "[class*='snippet']"]:
            el = await card.query_selector(sel)
            if el:
                desc = (await el.inner_text()).strip()
                break

        type_contrat = None
        for sel in ["[class*='attribute']", "[data-testid='attribute_snippet_testid']"]:
            el = await card.query_selector(sel)
            if el:
                t = (await el.inner_text()).strip()
                if any(w in t.upper() for w in ["CDI", "CDD", "TEMPS PLEIN", "FREELANCE"]):
                    type_contrat = t
                    break

        return {
            "titre": titre, "entreprise": entreprise, "localisation": localisation,
            "lien": lien, "description": desc, "salaire": salaire,
            "type_contrat": type_contrat, "type_offre": type_offre,
            "date_publication": date_pub,
        }
