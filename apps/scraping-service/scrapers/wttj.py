import asyncio
import random
import re
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
        {"q": "stage",     "country": "TN", "remote": False, "type": "stage"},
        {"q": "alternance","country": "TN", "remote": False, "type": "stage"},
        {"q": "stage",     "country": "FR", "remote": True,  "type": "stage"},
    ]

    DOMAIN_QUERIES = [
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
        {"q": "designer",               "country": "TN", "remote": False, "type": "emploi"},
        {"q": "UX UI",                  "country": "TN", "remote": False, "type": "emploi"},
        {"q": "graphiste",              "country": "TN", "remote": False, "type": "emploi"},
        {"q": "comptable",              "country": "TN", "remote": False, "type": "emploi"},
        {"q": "finance",                "country": "TN", "remote": False, "type": "emploi"},
        {"q": "auditeur",               "country": "TN", "remote": False, "type": "emploi"},
        {"q": "marketing",              "country": "TN", "remote": False, "type": "emploi"},
        {"q": "community manager",      "country": "TN", "remote": False, "type": "emploi"},
        {"q": "growth",                 "country": "TN", "remote": False, "type": "emploi"},
        {"q": "SEO",                    "country": "TN", "remote": False, "type": "emploi"},
        {"q": "commercial",             "country": "TN", "remote": False, "type": "emploi"},
        {"q": "business developer",     "country": "TN", "remote": False, "type": "emploi"},
        {"q": "account manager",        "country": "TN", "remote": False, "type": "emploi"},
        {"q": "RH",                     "country": "TN", "remote": False, "type": "emploi"},
        {"q": "recrutement",            "country": "TN", "remote": False, "type": "emploi"},
        {"q": "ingénieur",              "country": "TN", "remote": False, "type": "emploi"},
        {"q": "mécanique",              "country": "TN", "remote": False, "type": "emploi"},
        {"q": "électrique",             "country": "TN", "remote": False, "type": "emploi"},
        {"q": "industriel",             "country": "TN", "remote": False, "type": "emploi"},
        {"q": "télécom",                "country": "TN", "remote": False, "type": "emploi"},
        {"q": "juriste",                "country": "TN", "remote": False, "type": "emploi"},
        {"q": "santé médical",          "country": "TN", "remote": False, "type": "emploi"},
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

            try:
                await page.goto(
                    "https://www.welcometothejungle.com/fr",
                    wait_until="domcontentloaded",
                    timeout=30000,
                )
                await asyncio.sleep(2)
                for sel in [
                    "button[data-testid='cookie-accept-button']",
                    "button:has-text('Accepter tout')",
                    "button:has-text('Accepter')",
                    "#onetrust-accept-btn-handler",
                ]:
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
                    logger.debug(
                        f"[WTTJ] [{i+1}/{total_q}] '{query['q'] or 'BROWSE'}' "
                        f"{query['country']} remote={query.get('remote')} → {len(offres)}"
                    )
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

        url = f"https://www.welcometothejungle.com/fr/jobs?country={country}&sortBy=mostRecent"
        if q:
            url = f"https://www.welcometothejungle.com/fr/jobs?query={q}&country={country}&sortBy=mostRecent"
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
                        if o.get("lien"):
                            try:
                                detail = await self._scrape_detail(page, o["lien"])
                                o.update(detail)
                                await asyncio.sleep(random.uniform(2, 4))
                            except Exception as e:
                                logger.debug(f"[WTTJ] détail impossible: {e}")
                        offres.append(self.normalize(o))
                        self.stats["scraped"] += 1
                except Exception:
                    pass

        except PWTimeout:
            logger.warning(f"[WTTJ] Timeout '{query['q']}'")
        except Exception as e:
            logger.error(f"[WTTJ] {e}")

        return offres

    async def _scrape_detail(self, page, url: str) -> dict:
        """
        Scrape la page détail WTTJ.

        WTTJ génère des classes CSS hashées → on utilise UNIQUEMENT :
          - data-testid (stables)
          - balises sémantiques HTML (h2, h3, li, time, ul)
          - patterns textuels (regex sur le texte extrait)

        Champs extraits :
          type_contrat, localisation, teletravail, salaire,
          niveau_experience, education, date_publication,
          description (avec sections), company_about,
          competences, taille_entreprise, email_contact, site_web_entreprise
        """
        result = {}
        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=35000)
            await asyncio.sleep(random.uniform(2, 3))

            for _ in range(3):
                await page.evaluate("window.scrollBy(0, 600)")
                await asyncio.sleep(0.8)

            page_text = await page.inner_text("body")

            contract_match = re.search(
                r"\b(CDI|CDD|Stage|Alternance|Freelance|VIE|Intérim|Temps\s+plein|Temps\s+partiel)\b",
                page_text,
                re.IGNORECASE,
            )
            if contract_match:
                result["type_contrat"] = contract_match.group(0).strip()

            remote_match = re.search(
                r"Télétravail[^\n.]{0,60}",
                page_text,
                re.IGNORECASE,
            )
            if remote_match:
                result["teletravail"] = remote_match.group(0).strip()

            salary_match = re.search(
                r"Salaire\s*[:\-]?\s*([^\n]{3,60})",
                page_text,
                re.IGNORECASE,
            )
            if salary_match:
                result["salaire"] = salary_match.group(1).strip()
            else:
                direct_salary = re.search(
                    r"\d{2,4}\s*[Kk]?\s*[€$]\s*(\/\s*(mois|an|année|month|year))?",
                    page_text,
                )
                if direct_salary:
                    result["salaire"] = direct_salary.group(0).strip()

            exp_match = re.search(
                r"Expérience\s*[:\-]?\s*([^\n]{2,50})",
                page_text,
                re.IGNORECASE,
            )
            if exp_match:
                result["niveau_experience"] = exp_match.group(1).strip()
            else:
                exp_direct = re.search(
                    r"(<\s*\d+\s*mois|\d+[-–]\d+\s*ans?|\d+\s*ans?\s*(minimum|d'expérience|requis)?)",
                    page_text,
                    re.IGNORECASE,
                )
                if exp_direct:
                    result["niveau_experience"] = exp_direct.group(0).strip()

            edu_match = re.search(
                r"Éducation\s*[:\-]?\s*([^\n]{2,50})",
                page_text,
                re.IGNORECASE,
            )
            if edu_match:
                result["education"] = edu_match.group(1).strip()
            else:
                edu_direct = re.search(
                    r"(Bac\s*[+\d]+|Master\s*\d*|Licence\s*\d*|Ingénieur|Doctorat|BTS|DUT)",
                    page_text,
                    re.IGNORECASE,
                )
                if edu_direct:
                    result["education"] = edu_direct.group(0).strip()

            for sel in ["header time[datetime]", "time[datetime]", "[data-testid*='date'] time"]:
                el = await page.query_selector(sel)
                if el:
                    dt_attr = await el.get_attribute("datetime")
                    dt_text = (await el.inner_text()).strip()
                    parsed = dateparser.parse(
                        dt_attr or dt_text,
                        languages=["fr", "en"],
                        settings={"RETURN_AS_TIMEZONE_AWARE": True, "TIMEZONE": "UTC"},
                    )
                    if parsed:
                        result["date_publication"] = parsed
                        break

            loc_match = re.search(
                r"(?:📍|🏢|•)?\s*([A-ZÀ-Ÿa-zà-ÿ\-\s]+(?:,\s*[A-ZÀ-Ÿa-zà-ÿ\-\s]+)?)"
                r"\s*(?:\||\n|·|–)",
                page_text[:500],
            )
            if loc_match:
                loc = loc_match.group(1).strip()
                if 2 < len(loc) < 60 and not any(
                    w in loc.lower() for w in ["bienvenue", "welcome", "postuler", "sauvegarder"]
                ):
                    result["localisation"] = loc

            description_parts = []

            all_headings = await page.query_selector_all("article h2, article h3, main h2, main h3")

            for heading in all_headings:
                try:
                    h_text = (await heading.inner_text()).strip()

                    relevant_keywords = [
                        "poste", "mission", "profil", "recherché", "compétence",
                        "responsabilité", "description", "attendu", "requis",
                        "vous serez", "vous aurez", "votre rôle", "contexte",
                        "pourquoi", "avantage", "bénéfice", "offrons",
                    ]
                    if not any(kw in h_text.lower() for kw in relevant_keywords):
                        continue

                    content = await page.evaluate("""(heading) => {
                        let text = '';
                        let el = heading.nextElementSibling;
                        let count = 0;
                        while (el && count < 10) {
                            const tag = el.tagName.toLowerCase();
                            if (['h1','h2','h3'].includes(tag)) break;
                            text += el.innerText + '\\n';
                            el = el.nextElementSibling;
                            count++;
                        }
                        return text.trim();
                    }""", heading)

                    if content and len(content) > 30:
                        description_parts.append(f"## {h_text}\n{content}")
                except Exception:
                    pass

            if not description_parts:
                markers = ["VOS MISSIONS", "LE POSTE", "DESCRIPTIF DU POSTE", "À PROPOS DU POSTE", "DESCRIPTION DU POSTE"]
                for marker in markers:
                    idx = page_text.upper().find(marker)
                    if idx != -1:
                        end_markers = ["À PROPOS DE L'ENTREPRISE", "ABOUT THE COMPANY", "L'ENTREPRISE"]
                        end_idx = len(page_text)
                        for em in end_markers:
                            em_idx = page_text.upper().find(em, idx + 100)
                            if em_idx != -1 and em_idx < end_idx:
                                end_idx = em_idx
                        chunk = page_text[idx:end_idx].strip()
                        if len(chunk) > 100:
                            description_parts.append(chunk)
                            break

                if not description_parts:
                    for sel in ["article", "main article", "[data-testid='job-description']"]:
                        el = await page.query_selector(sel)
                        if el:
                            txt = (await el.inner_text()).strip()
                            if len(txt) > 200:
                                cut_markers = ["Le poste", "LE POSTE", "Descriptif", "VOS MISSIONS"]
                                for cm in cut_markers:
                                    idx = txt.find(cm)
                                    if idx != -1:
                                        txt = txt[idx:]
                                        break
                                description_parts.append(txt[:3000])
                                break

            if description_parts:
                result["description"] = "\n\n".join(description_parts)

            company_about = None

            about_markers = [
                "À PROPOS DE L'ENTREPRISE",
                "À PROPOS DU GROUPE",
                "QUI SOMMES-NOUS",
                "ABOUT THE COMPANY",
                "ABOUT US",
                "L'ENTREPRISE EN BREF",
                "PRÉSENTATION DE L'ENTREPRISE",
            ]
            for marker in about_markers:
                idx = page_text.upper().find(marker)
                if idx != -1:
                    chunk = page_text[idx + len(marker):idx + len(marker) + 800].strip()
                    if len(chunk) > 50:
                        company_about = chunk
                        break

            if not company_about:
                all_sections = await page.query_selector_all("section, article > div > div")
                for section in all_sections:
                    try:
                        heading = await section.query_selector("h2, h3")
                        if heading:
                            h_text = (await heading.inner_text()).strip().lower()
                            if any(w in h_text for w in ["propos", "company", "entreprise", "about", "qui sommes"]):
                                section_text = (await section.inner_text()).strip()
                                body = section_text[len(h_text):].strip()
                                if body and len(body) > 50:
                                    company_about = body[:1000]
                                    break
                    except Exception:
                        pass

            if company_about:
                result["company_about"] = company_about

            competences = []

            for sel in [
                "[data-testid='tag']",
                "[data-testid*='skill']",
                "[data-testid*='technology']",
            ]:
                tags = await page.query_selector_all(sel)
                for tag in tags:
                    txt = (await tag.inner_text()).strip()
                    if txt and 2 < len(txt) < 40:
                        competences.append(txt)
                if competences:
                    break

            if not competences:
                tag_lists = await page.query_selector_all("ul[aria-label], footer ul")
                for ul in tag_lists:
                    items = await ul.query_selector_all("li")
                    for item in items:
                        txt = (await item.inner_text()).strip()
                        if txt and 2 < len(txt) < 40 and not any(
                            c in txt for c in ["€", "@", "©", "http", "Postuler", "Sauvegarder"]
                        ):
                            competences.append(txt)
                    if competences:
                        break

            if competences:
                result["competences"] = list(dict.fromkeys(competences))[:15]

            size_match = re.search(
                r"(\d+\s*[-–]\s*\d+|\d+\+?)\s*(salariés?|employés?|personnes?|collaborateurs?|people|employees)",
                page_text,
                re.IGNORECASE,
            )
            if size_match:
                result["taille_entreprise"] = size_match.group(0).strip()

            email_match = re.search(
                r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}",
                page_text,
            )
            if email_match:
                email = email_match.group(0)
                blocked = ["welcometothejungle", "wttj", "example", "noreply", "privacy", "support"]
                if not any(d in email.lower() for d in blocked):
                    result["email_contact"] = email

            all_links = await page.query_selector_all("a[href^='http']")
            blocked_domains = [
                "welcometothejungle", "linkedin", "twitter", "instagram",
                "facebook", "glassdoor", "google", "apple", "noreply",
            ]
            for link in all_links:
                href = await link.get_attribute("href")
                if href and not any(d in href for d in blocked_domains):
                    result["site_web_entreprise"] = href
                    break

            logger.debug(
                f"[WTTJ] détail OK — champs: {list(result.keys())} depuis {url[:70]}"
            )

        except PWTimeout:
            logger.warning(f"[WTTJ] Timeout détail {url[:70]}")
        except Exception as e:
            logger.debug(f"[WTTJ] Erreur détail {url[:70]}: {e}")

        return result

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

        salaire = None
        for sel in ["[class*='salary']", "[class*='wage']", "[data-testid*='salary']"]:
            el = await card.query_selector(sel)
            if el:
                t = (await el.inner_text()).strip()
                if t and any(c in t for c in ["€", "K", "$", "TND", "Non spécifié"]):
                    salaire = t
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
            "titre": titre,
            "entreprise": entreprise,
            "localisation": localisation,
            "lien": lien,
            "type_contrat": type_contrat,
            "salaire": salaire,
            "lien_image": lien_image,
            "type_offre": type_offre,
            "date_publication": date_pub,
        }