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


class LinkedInScraper(BaseScraper):
    SOURCE_NAME = "linkedin"
    BASE_URL    = "https://www.linkedin.com"

    BROWSE_QUERIES = [
        {"q": "",           "location": "Tunis, Tunisie",  "type": "emploi"},
        {"q": "",           "location": "Sfax, Tunisie",   "type": "emploi"},
        {"q": "",           "location": "Sousse, Tunisie", "type": "emploi"},
        {"q": "",           "location": "Tunisie",         "type": "emploi"},
        {"q": "stage",      "location": "Tunisie",         "type": "stage"},
        {"q": "PFE",        "location": "Tunisie",         "type": "pfe"},
        {"q": "internship", "location": "Tunisie",         "type": "stage"},
        {"q": "",           "location": "France",  "remote": True, "type": "emploi"},
        {"q": "remote",     "location": "Tunisia", "type": "emploi"},
    ]

    DOMAIN_QUERIES = [
        # Technologie & Informatique
        {"q": "Software Developer",         "location": "Tunisie", "type": "emploi"},
        {"q": "Software Engineer",          "location": "Tunisie", "type": "emploi"},
        {"q": "Développeur web",            "location": "Tunisie", "type": "emploi"},
        {"q": "Développeur mobile",         "location": "Tunisie", "type": "emploi"},
        {"q": "Fullstack Developer",        "location": "Tunisie", "type": "emploi"},
        {"q": "Frontend Developer React",   "location": "Tunisie", "type": "emploi"},
        {"q": "Backend Developer Node",     "location": "Tunisie", "type": "emploi"},
        {"q": "Data Scientist",             "location": "Tunisie", "type": "emploi"},
        {"q": "Data Engineer",              "location": "Tunisie", "type": "emploi"},
        {"q": "Data Analyst",               "location": "Tunisie", "type": "emploi"},
        {"q": "Machine Learning Engineer",  "location": "Tunisie", "type": "emploi"},
        {"q": "Artificial Intelligence",    "location": "Tunisie", "type": "emploi"},
        {"q": "DevOps Engineer",            "location": "Tunisie", "type": "emploi"},
        {"q": "Cloud Engineer AWS Azure",   "location": "Tunisie", "type": "emploi"},
        {"q": "Cybersecurity Engineer",     "location": "Tunisie", "type": "emploi"},
        {"q": "Network Administrator",      "location": "Tunisie", "type": "emploi"},
        {"q": "System Administrator Linux", "location": "Tunisie", "type": "emploi"},
        {"q": "Product Manager",            "location": "Tunisie", "type": "emploi"},
        {"q": "Scrum Master",               "location": "Tunisie", "type": "emploi"},
        {"q": "QA Engineer Test",           "location": "Tunisie", "type": "emploi"},
        {"q": "Business Analyst",           "location": "Tunisie", "type": "emploi"},
        {"q": "Solution Architect",         "location": "Tunisie", "type": "emploi"},
        {"q": "ERP SAP Consultant",         "location": "Tunisie", "type": "emploi"},
        {"q": "Embedded Software Engineer", "location": "Tunisie", "type": "emploi"},
        {"q": "Flutter Developer",          "location": "Tunisie", "type": "emploi"},
        {"q": "Blockchain Developer",       "location": "Tunisie", "type": "emploi"},

        # Design & Créatif
        {"q": "UI UX Designer",             "location": "Tunisie", "type": "emploi"},
        {"q": "Graphic Designer",           "location": "Tunisie", "type": "emploi"},
        {"q": "Motion Designer",            "location": "Tunisie", "type": "emploi"},
        {"q": "Product Designer",           "location": "Tunisie", "type": "emploi"},

        # Finance & Comptabilité
        {"q": "Comptable",                  "location": "Tunisie", "type": "emploi"},
        {"q": "Expert Comptable",           "location": "Tunisie", "type": "emploi"},
        {"q": "Contrôleur de Gestion",      "location": "Tunisie", "type": "emploi"},
        {"q": "Analyste Financier",         "location": "Tunisie", "type": "emploi"},
        {"q": "Auditeur",                   "location": "Tunisie", "type": "emploi"},
        {"q": "Directeur Financier CFO",    "location": "Tunisie", "type": "emploi"},
        {"q": "Trésorier Finance",          "location": "Tunisie", "type": "emploi"},
        {"q": "Fiscaliste",                 "location": "Tunisie", "type": "emploi"},

        # Banque & Assurance
        {"q": "Conseiller Bancaire",        "location": "Tunisie", "type": "emploi"},
        {"q": "Analyste Crédit Risque",     "location": "Tunisie", "type": "emploi"},
        {"q": "Chargé d'affaires Banque",   "location": "Tunisie", "type": "emploi"},
        {"q": "Gestionnaire Assurance",     "location": "Tunisie", "type": "emploi"},
        {"q": "Actuaire",                   "location": "Tunisie", "type": "emploi"},

        # Marketing & Communication
        {"q": "Marketing Manager",          "location": "Tunisie", "type": "emploi"},
        {"q": "Digital Marketing",          "location": "Tunisie", "type": "emploi"},
        {"q": "Community Manager",          "location": "Tunisie", "type": "emploi"},
        {"q": "Content Manager",            "location": "Tunisie", "type": "emploi"},
        {"q": "SEO SEM",                    "location": "Tunisie", "type": "emploi"},
        {"q": "Growth Hacker",              "location": "Tunisie", "type": "emploi"},
        {"q": "Brand Manager",              "location": "Tunisie", "type": "emploi"},

        # Vente & Commercial
        {"q": "Commercial Ingénieur Vente", "location": "Tunisie", "type": "emploi"},
        {"q": "Business Developer",         "location": "Tunisie", "type": "emploi"},
        {"q": "Account Manager",            "location": "Tunisie", "type": "emploi"},
        {"q": "Sales Manager",              "location": "Tunisie", "type": "emploi"},
        {"q": "Customer Success",           "location": "Tunisie", "type": "emploi"},
        {"q": "Téléconseiller Call Center", "location": "Tunisie", "type": "emploi"},

        # Ressources Humaines
        {"q": "HR Manager Responsable RH",  "location": "Tunisie", "type": "emploi"},
        {"q": "Chargé de Recrutement",      "location": "Tunisie", "type": "emploi"},
        {"q": "Talent Acquisition",         "location": "Tunisie", "type": "emploi"},
        {"q": "Gestionnaire Paie",          "location": "Tunisie", "type": "emploi"},

        # Juridique
        {"q": "Juriste Conseiller Juridique","location": "Tunisie", "type": "emploi"},
        {"q": "Compliance Officer",         "location": "Tunisie", "type": "emploi"},

        # Ingénierie & Industrie
        {"q": "Ingénieur Mécanique",        "location": "Tunisie", "type": "emploi"},
        {"q": "Ingénieur Électrique",       "location": "Tunisie", "type": "emploi"},
        {"q": "Ingénieur Industriel",       "location": "Tunisie", "type": "emploi"},
        {"q": "Ingénieur Production",       "location": "Tunisie", "type": "emploi"},
        {"q": "Ingénieur Qualité HSE",      "location": "Tunisie", "type": "emploi"},
        {"q": "Technicien Maintenance",     "location": "Tunisie", "type": "emploi"},
        {"q": "Ingénieur Télécoms",         "location": "Tunisie", "type": "emploi"},
        {"q": "Ingénieur Génie Civil",      "location": "Tunisie", "type": "emploi"},
        {"q": "Lean Manufacturing",         "location": "Tunisie", "type": "emploi"},
        {"q": "Automatisme Robotique",      "location": "Tunisie", "type": "emploi"},
        {"q": "Ingénieur Aéronautique",     "location": "Tunisie", "type": "emploi"},
        {"q": "Ingénieur Automobile",       "location": "Tunisie", "type": "emploi"},

        # Santé
        {"q": "Médecin",                    "location": "Tunisie", "type": "emploi"},
        {"q": "Pharmacien",                 "location": "Tunisie", "type": "emploi"},
        {"q": "Délégué Médical",            "location": "Tunisie", "type": "emploi"},
        {"q": "Infirmier",                  "location": "Tunisie", "type": "emploi"},

        # Éducation
        {"q": "Formateur Enseignant",       "location": "Tunisie", "type": "emploi"},
        {"q": "E-learning",                 "location": "Tunisie", "type": "emploi"},

        # Logistique
        {"q": "Supply Chain Manager",       "location": "Tunisie", "type": "emploi"},
        {"q": "Responsable Achats",         "location": "Tunisie", "type": "emploi"},
        {"q": "Responsable Logistique",     "location": "Tunisie", "type": "emploi"},

        # Direction
        {"q": "Directeur Général CEO",      "location": "Tunisie", "type": "emploi"},
        {"q": "CTO Directeur Technique",    "location": "Tunisie", "type": "emploi"},
        {"q": "COO Directeur Opérations",   "location": "Tunisie", "type": "emploi"},

        # France remote — offres accessibles à distance
        {"q": "Développeur",      "location": "France", "remote": True, "type": "emploi"},
        {"q": "Data",             "location": "France", "remote": True, "type": "emploi"},
        {"q": "DevOps",           "location": "France", "remote": True, "type": "emploi"},
        {"q": "Product Manager",  "location": "France", "remote": True, "type": "emploi"},
        {"q": "Designer",         "location": "France", "remote": True, "type": "emploi"},
        {"q": "Marketing",        "location": "France", "remote": True, "type": "emploi"},
        {"q": "Customer Success", "location": "France", "remote": True, "type": "emploi"},
        {"q": "Account Manager",  "location": "France", "remote": True, "type": "emploi"},
        {"q": "Finance",          "location": "France", "remote": True, "type": "emploi"},
    ]

    INTERNSHIP_QUERIES = [
        {"q": "Stage développement",          "location": "Tunisie", "type": "stage"},
        {"q": "Stage data science",           "location": "Tunisie", "type": "stage"},
        {"q": "Stage marketing",              "location": "Tunisie", "type": "stage"},
        {"q": "Stage finance",                "location": "Tunisie", "type": "stage"},
        {"q": "Stage ingénieur",              "location": "Tunisie", "type": "stage"},
        {"q": "Stage commercial",             "location": "Tunisie", "type": "stage"},
        {"q": "Stage RH",                     "location": "Tunisie", "type": "stage"},
        {"q": "Stage design",                 "location": "Tunisie", "type": "stage"},
        {"q": "PFE développement web",        "location": "Tunisie", "type": "pfe"},
        {"q": "PFE data intelligence",        "location": "Tunisie", "type": "pfe"},
        {"q": "PFE cybersécurité",            "location": "Tunisie", "type": "pfe"},
        {"q": "PFE ingénieur",                "location": "Tunisie", "type": "pfe"},
        {"q": "PFE finance",                  "location": "Tunisie", "type": "pfe"},
        {"q": "Stage développement remote",   "location": "France", "remote": True, "type": "stage"},
        {"q": "Stage marketing remote",       "location": "France", "remote": True, "type": "stage"},
    ]

    @property
    def ALL_QUERIES(self):
        return self.BROWSE_QUERIES + self.DOMAIN_QUERIES + self.INTERNSHIP_QUERIES

    def scrape(self) -> list[dict]:
        if not PLAYWRIGHT_OK:
            logger.error("[LinkedIn] Playwright non installé")
            return []
        return asyncio.run(self._async_scrape())

    async def _async_scrape(self) -> list[dict]:
        self.log_start()
        results = []
        total_q = len(self.ALL_QUERIES)
        logger.info(f"[LinkedIn] {total_q} requêtes planifiées")

        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=True,
                args=["--no-sandbox", "--disable-blink-features=AutomationControlled"],
            )
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.82 Safari/537.36",
                viewport={"width": 1366, "height": 768},
                locale="fr-FR",
            )
            await context.add_init_script(
                "Object.defineProperty(navigator, 'webdriver', {get: () => undefined});"
            )
            page = await context.new_page()

            for i, query in enumerate(self.ALL_QUERIES):
                try:
                    offres = await self._scrape_query(page, query)
                    results.extend(offres)
                    logger.debug(f"[LinkedIn] [{i+1}/{total_q}] '{query['q'] or 'BROWSE'}' → {len(offres)}")
                    if (i + 1) % 15 == 0:
                        pause = random.uniform(45, 90)
                        logger.info(f"[LinkedIn] Pause anti-ban {pause:.0f}s")
                        await asyncio.sleep(pause)
                    else:
                        await asyncio.sleep(random.uniform(5, 10))
                except Exception as e:
                    logger.error(f"[LinkedIn] '{query['q']}': {e}")
                    self.stats["erreurs"] += 1

            await browser.close()

        self.log_end()
        return results

    async def _scrape_query(self, page, query: dict) -> list[dict]:
        offres = []
        q        = (query["q"] or "").replace(" ", "%20")
        location = query["location"].replace(" ", "%20")
        remote   = query.get("remote", False)

        base = f"https://www.linkedin.com/jobs/search?location={location}&f_TPR=r86400&sortBy=DD"
        if q:
            base += f"&keywords={q}"
        if remote:
            base += "&f_WT=2"  

        for page_start in [0, 25, 50]:
            url = f"{base}&start={page_start}"
            try:
                await page.goto(url, wait_until="domcontentloaded", timeout=35000)
                await asyncio.sleep(random.uniform(3, 5))

                for _ in range(4):
                    await page.evaluate("window.scrollBy(0, 700)")
                    await asyncio.sleep(1.5)

                cards = []
                for sel in [
                    "ul.jobs-search__results-list > li",
                    "div.base-search-card",
                    ".job-search-card",
                    "li[class*='result-card']",
                ]:
                    cards = await page.query_selector_all(sel)
                    if cards:
                        break

                if not cards:
                    break  

                page_offres = 0
                for card in cards:
                    try:
                        o = await self._parse_card(card, query["type"])
                        if o and o.get("titre") and len(o["titre"]) > 3:
                            offres.append(self.normalize(o))
                            self.stats["scraped"] += 1
                            page_offres += 1
                    except Exception:
                        pass

                if page_offres < 5:
                    break  

                await asyncio.sleep(random.uniform(3, 6))

            except PWTimeout:
                logger.warning(f"[LinkedIn] Timeout page {page_start} '{query['q']}'")
                break
            except Exception as e:
                logger.error(f"[LinkedIn] page {page_start}: {e}")
                break

        return offres

    async def _parse_card(self, card, type_offre: str) -> dict:
        titre = ""
        for sel in ["h3.base-search-card__title", ".base-search-card__title",
                    "h3[class*='title']", "h3", "h2"]:
            el = await card.query_selector(sel)
            if el:
                t = (await el.inner_text()).strip()
                if t and len(t) > 3:
                    titre = t
                    break

        entreprise = None
        for sel in ["h4.base-search-card__subtitle", ".base-search-card__subtitle",
                    "a[class*='company']"]:
            el = await card.query_selector(sel)
            if el:
                t = (await el.inner_text()).strip()
                if t and t != titre:
                    entreprise = t
                    break

        localisation = None
        for sel in [".job-search-card__location", "span.job-search-card__location",
                    "[class*='location']"]:
            el = await card.query_selector(sel)
            if el:
                t = (await el.inner_text()).strip()
                if t:
                    localisation = t
                    break

        lien = ""
        for sel in ["a.base-card__full-link", "a[href*='/jobs/view/']"]:
            el = await card.query_selector(sel)
            if el:
                href = await el.get_attribute("href")
                if href:
                    lien = href.split("?")[0]
                    if not lien.startswith("http"):
                        lien = f"https://www.linkedin.com{lien}"
                    break

        date_pub = None
        for sel in ["time", "[class*='listdate']", "[datetime]"]:
            el = await card.query_selector(sel)
            if el:
                dt_attr = await el.get_attribute("datetime")
                dt_text = (await el.inner_text()).strip()
                date_pub = dateparser.parse(
                    dt_attr or dt_text, languages=["fr", "en"],
                    settings={"RETURN_AS_TIMEZONE_AWARE": True, "TIMEZONE": "UTC"},
                )
                if date_pub:
                    break

        lien_image = None
        for sel in ["img[class*='logo']", ".artdeco-entity-image"]:
            el = await card.query_selector(sel)
            if el:
                lien_image = await el.get_attribute("src") or await el.get_attribute("data-delayed-url")
                if lien_image:
                    break

        return {
            "titre": titre, "entreprise": entreprise, "localisation": localisation,
            "lien": lien, "lien_image": lien_image, "type_offre": type_offre,
            "date_publication": date_pub,
        }
