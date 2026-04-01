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


class WTTJScraper(BaseScraper):
    SOURCE_NAME = "welcometothejungle"
    BASE_URL    = "https://www.welcometothejungle.com"

    BROWSE_QUERIES = [
        {"q": "", "country": "TN", "remote": False, "type": "emploi"},
        {"q": "", "country": "FR", "remote": True,  "type": "emploi"},
        {"q": "stage",    "country": "TN", "remote": False, "type": "stage"},
        {"q": "alternance","country": "TN", "remote": False, "type": "stage"},
        {"q": "stage",    "country": "FR", "remote": True,  "type": "stage"},
    ]

    DOMAIN_QUERIES = [
        # Tech
        {"q": "développeur",            "country": "TN", "remote": False, "type": "emploi"},
        {"q": "software engineer",      "country": "TN", "remote": False, "type": "emploi"},
        {"q": "data scientist",         "country": "TN", "remote": False, "type": "emploi"},
        {"q": "data engineer",          "country": "TN", "remote": False, "type": "emploi"},
        {"q": "devops",                 "country": "TN", "remote": False, "type": "emploi"},
        {"q": "cloud",                  "country": "TN", "remote": False, "type": "emploi"},
        {"q": "cybersecurity",          "country": "TN", "remote": False, "type": "emploi"},
        {"q": "mobile developer",       "country": "TN", "remote": False, "type": "emploi"},
        {"q": "fullstack",              "country": "TN", "remote": False, "type": "emploi"},
        {"q": "machine learning",       "country": "TN", "remote": False, "type": "emploi"},
        {"q": "product manager",        "country": "TN", "remote": False, "type": "emploi"},
        {"q": "scrum master",           "country": "TN", "remote": False, "type": "emploi"},
        {"q": "QA",                     "country": "TN", "remote": False, "type": "emploi"},
        {"q": "embedded",               "country": "TN", "remote": False, "type": "emploi"},
        # Design
        {"q": "designer",               "country": "TN", "remote": False, "type": "emploi"},
        {"q": "UX UI",                  "country": "TN", "remote": False, "type": "emploi"},
        {"q": "graphiste",              "country": "TN", "remote": False, "type": "emploi"},
        # Finance
        {"q": "comptable",              "country": "TN", "remote": False, "type": "emploi"},
        {"q": "finance",                "country": "TN", "remote": False, "type": "emploi"},
        {"q": "auditeur",               "country": "TN", "remote": False, "type": "emploi"},
        # Marketing
        {"q": "marketing",              "country": "TN", "remote": False, "type": "emploi"},
        {"q": "community manager",      "country": "TN", "remote": False, "type": "emploi"},
        {"q": "growth",                 "country": "TN", "remote": False, "type": "emploi"},
        {"q": "SEO",                    "country": "TN", "remote": False, "type": "emploi"},
        # Commercial
        {"q": "commercial",             "country": "TN", "remote": False, "type": "emploi"},
        {"q": "business developer",     "country": "TN", "remote": False, "type": "emploi"},
        {"q": "account manager",        "country": "TN", "remote": False, "type": "emploi"},
        # RH
        {"q": "RH",                     "country": "TN", "remote": False, "type": "emploi"},
        {"q": "recrutement",            "country": "TN", "remote": False, "type": "emploi"},
        # Ingénierie
        {"q": "ingénieur",              "country": "TN", "remote": False, "type": "emploi"},
        {"q": "mécanique",              "country": "TN", "remote": False, "type": "emploi"},
        {"q": "électrique",             "country": "TN", "remote": False, "type": "emploi"},
        {"q": "industriel",             "country": "TN", "remote": False, "type": "emploi"},
        {"q": "télécom",                "country": "TN", "remote": False, "type": "emploi"},
        # Juridique
        {"q": "juriste",                "country": "TN", "remote": False, "type": "emploi"},
        # Santé
        {"q": "santé médical",          "country": "TN", "remote": False, "type": "emploi"},
        # Logistique
        {"q": "logistique supply chain","country": "TN", "remote": False, "type": "emploi"},
        {"q": "achats",                 "country": "TN", "remote": False, "type": "emploi"},

        {"q": "développeur",            "country": "FR", "remote": True,  "type": "emploi"},
        {"q": "software engineer",      "country": "FR", "remote": True,  "type": "emploi"},
        {"q": "data",                   "country": "FR", "remote": True,  "type": "emploi"},
        {"q": "devops cloud",           "country": "FR", "remote": True,  "type": "emploi"},
        {"q": "fullstack",              "country": "FR", "remote": True,  "type": "emploi"},
        {"q": "product manager",        "country": "FR", "remote": True,  "type": "emploi"},
        {"q": "designer",               "country": "FR", "remote": True,  "type": "emploi"},
        {"q": "marketing",              "country": "FR", "remote": True,  "type": "emploi"},
        {"q": "growth",                 "country": "FR", "remote": True,  "type": "emploi"},
        {"q": "business developer",     "country": "FR", "remote": True,  "type": "emploi"},
        {"q": "content manager",        "country": "FR", "remote": True,  "type": "emploi"},
        {"q": "finance",                "country": "FR", "remote": True,  "type": "emploi"},
        {"q": "RH recrutement",         "country": "FR", "remote": True,  "type": "emploi"},
        {"q": "QA",                     "country": "FR", "remote": True,  "type": "emploi"},
        {"q": "customer success",       "country": "FR", "remote": True,  "type": "emploi"},
        {"q": "account manager",        "country": "FR", "remote": True,  "type": "emploi"},
        {"q": "stage",                  "country": "FR", "remote": True,  "type": "stage"},
    ]

    @property
    def ALL_QUERIES(self):
        return self.BROWSE_QUERIES + self.DOMAIN_QUERIES

    def scrape(self) -> list[dict]:
        if not PLAYWRIGHT_OK:
            logger.error("[WTTJ] Playwright non installé")
            return []
        return asyncio.run(self._async_scrape())

    async def _async_scrape(self) -> list[dict]:
        self.log_start()
        results = []
        total_q = len(self.ALL_QUERIES)
        logger.info(f"[WTTJ] {total_q} requêtes planifiées")

        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=True,
                args=["--no-sandbox", "--disable-blink-features=AutomationControlled"],
            )
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.82 Safari/537.36",
                viewport={"width": 1440, "height": 900},
                locale="fr-FR",
            )
            await context.add_init_script(
                "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
            )
            page = await context.new_page()

            # Accepter les cookies une seule fois
            try:
                await page.goto("https://www.welcometothejungle.com/fr", wait_until="domcontentloaded", timeout=30000)
                await asyncio.sleep(2)
                for sel in ["button[data-testid='cookie-accept-button']", "button:has-text('Accepter')", "#onetrust-accept-btn-handler"]:
                    try:
                        btn = await page.query_selector(sel)
                        if btn:
                            await btn.click()
                            await asyncio.sleep(1)
                            break
                    except Exception:
                        pass
            except Exception:
                pass

            for i, query in enumerate(self.ALL_QUERIES):
                try:
                    offres = await self._scrape_query(page, query)
                    results.extend(offres)
                    logger.debug(f"[WTTJ] [{i+1}/{total_q}] '{query['q'] or 'BROWSE'}' {query['country']} remote={query.get('remote')} → {len(offres)}")
                    if (i + 1) % 15 == 0:
                        pause = random.uniform(20, 40)
                        logger.info(f"[WTTJ] Pause {pause:.0f}s après {i+1} requêtes")
                        await asyncio.sleep(pause)
                    else:
                        await asyncio.sleep(random.uniform(4, 8))
                except Exception as e:
                    logger.error(f"[WTTJ] '{query['q']}': {e}")
                    self.stats["erreurs"] += 1

            await browser.close()

        self.log_end()
        return results

    async def _scrape_query(self, page, query: dict) -> list[dict]:
        offres = []
        q       = (query["q"] or "").replace(" ", "%20")
        country = query.get("country", "TN")
        remote  = query.get("remote", False)

        if q:
            url = f"https://www.welcometothejungle.com/fr/jobs?query={q}&country={country}&sortBy=mostRecent"
        else:
            url = f"https://www.welcometothejungle.com/fr/jobs?country={country}&sortBy=mostRecent"
        if remote:
            url += "&remoteOnly=true"

        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=40000)
            await asyncio.sleep(random.uniform(2, 4))

            for _ in range(5):
                await page.evaluate("window.scrollBy(0, 800)")
                await asyncio.sleep(1.2)

            cards = []
            for sel in [
                "li[class*='ais-Hits-item']",
                "article[data-testid*='job']",
                "li[data-testid*='search-results-list-item']",
                "ul[class*='hits'] > li",
                "main li",
            ]:
                cards = await page.query_selector_all(sel)
                if cards:
                    break

            for card in cards[:25]:
                try:
                    o = await self._parse_card(card, query["type"])
                    if o and o.get("titre") and len(o["titre"]) > 3:
                        offres.append(self.normalize(o))
                        self.stats["scraped"] += 1
                except Exception:
                    pass

        except PWTimeout:
            logger.warning(f"[WTTJ] Timeout '{query['q']}'")
        except Exception as e:
            logger.error(f"[WTTJ] {e}")
        return offres

    async def _parse_card(self, card, type_offre: str) -> dict:
        titre = ""
        for sel in ["h4", "h3", "h2", "[class*='JobTitle']", "[data-testid*='title']", "p[class*='title']"]:
            el = await card.query_selector(sel)
            if el:
                t = (await el.inner_text()).strip()
                if t and len(t) > 3:
                    titre = t
                    break

        entreprise = None
        for sel in ["[class*='company']", "[class*='Company']", "[data-testid*='company']", "p[class*='name']"]:
            el = await card.query_selector(sel)
            if el:
                t = (await el.inner_text()).strip()
                if t and t != titre:
                    entreprise = t
                    break

        localisation = None
        for sel in ["[class*='location']", "[data-testid*='location']", "[class*='city']"]:
            el = await card.query_selector(sel)
            if el:
                localisation = (await el.inner_text()).strip()
                break

        type_contrat = None
        for sel in ["[class*='contract']", "[data-testid*='contract']"]:
            el = await card.query_selector(sel)
            if el:
                t = (await el.inner_text()).strip()
                if any(w in t.upper() for w in ["CDI", "CDD", "STAGE", "ALTERNANCE", "FREELANCE", "FULL"]):
                    type_contrat = t
                    break

        lien = ""
        for sel in ["a[href*='/jobs/']", "a[href*='/fr/companies/']", "a[href]"]:
            el = await card.query_selector(sel)
            if el:
                href = await el.get_attribute("href")
                if href:
                    lien = href if href.startswith("http") else f"{self.BASE_URL}{href}"
                    break

        date_pub = None
        for sel in ["time", "[class*='date']", "[datetime]"]:
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
        for sel in ["img[alt*='logo']", "img[class*='logo']", "img[src*='logo']"]:
            el = await card.query_selector(sel)
            if el:
                src = await el.get_attribute("src")
                if src:
                    lien_image = src
                    break

        return {
            "titre": titre, "entreprise": entreprise, "localisation": localisation,
            "lien": lien, "type_contrat": type_contrat, "lien_image": lien_image,
            "type_offre": type_offre, "date_publication": date_pub,
        }
