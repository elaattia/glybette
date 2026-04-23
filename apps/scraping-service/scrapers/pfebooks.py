import requests
import re
import random
from loguru import logger
from bs4 import BeautifulSoup
import dateparser

from .base_scraper import BaseScraper

CATEGORIES_MAP = {
    "business-startup":             "Business & Entrepreneuriat",
    "design-ux-ui":                 "Design & UX/UI",
    "dev-web-mobile":               "Développement Web & Mobile",
    "durabilite-technologie-verte": "Durabilité & Technologie Verte",
    "industrie-robotique":          "Industrie & Robotique",
    "informatique-ia":              "Informatique & Intelligence Artificielle",
    "marketing-communication":      "Marketing Digital & Communication",
    "rh-management":                "Ressources Humaines & Management",
    "data-analyse":                 "Sciences des Données & Analyse",
    "systemes-reseaux":             "Systèmes & Réseaux",
}


class PFEBooksScraper(BaseScraper):
    SOURCE_NAME = "pfebooks.com"
    BASE_URL    = "https://pfebooks.com"
    CATALOGUE   = "https://pfebooks.com/catalogue"

    def scrape(self) -> list[dict]:
        self.log_start()
        results = []
        max_pages = self._get_max_pages()
        logger.info(f"[pfebooks.com] {max_pages} pages")

        for page_num in range(1, max_pages + 1):
            url = self.CATALOGUE if page_num == 1 else f"{self.CATALOGUE}/page/{page_num}/"
            logger.info(f"[pfebooks.com] Page {page_num}/{max_pages}")
            try:
                entries = self._scrape_catalogue_page(url)
                if not entries:
                    break
                for entry in entries:
                    try:
                        detail = self._scrape_detail(entry["lien_detail"])
                        offre  = {**entry, **detail}
                        results.append(self.normalize(offre))
                        self.stats["scraped"] += 1
                        self.wait(1, 3)
                    except Exception:
                        results.append(self.normalize(entry))
                        self.stats["scraped"] += 1
                self.wait(2, 4)
            except Exception as e:
                logger.error(f"[pfebooks.com] Page {page_num}: {e}")
                self.stats["erreurs"] += 1

        self.log_end()
        return results

    def _get_max_pages(self) -> int:
        try:
            resp = requests.get(self.CATALOGUE, headers=self.get_headers(), timeout=15)
            soup = BeautifulSoup(resp.text, "lxml")
            nums = [int(a.get_text(strip=True)) for a in soup.select("a.page-numbers") if a.get_text(strip=True).isdigit()]
            return max(nums) if nums else 1
        except Exception:
            return 49

    def _scrape_catalogue_page(self, url: str) -> list[dict]:
        resp = requests.get(url, headers=self.get_headers(), timeout=15)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "lxml")
        entries = []

        voir_links = soup.select("a[href*='/catalogue/2026/']")
        seen = set()
        for a in voir_links:
            href = a.get("href", "")
            if "/catalogue/2026/" in href and href not in seen:
                seen.add(href)
                titre = a.get("title") or a.get_text(strip=True) or ""


                lien_image = None
                parent = a.find_parent()
                if parent:
                    img = parent.find("img")
                    if not img:
                        parent2 = parent.find_parent()
                        if parent2:
                            img = parent2.find("img")
                    if img:
                        src = img.get("src", "")
                        lien_image = re.sub(r"-\d+x\d+(\.\w+)$", r"\1", src)



                date_pub = None
                if parent:
                    date_el = parent.find(class_=re.compile(r"date|time", re.I))
                    if not date_el:
                        gp = parent.find_parent()
                        if gp:
                            date_el = gp.find(class_=re.compile(r"date|time", re.I))
                    if date_el:
                        raw = date_el.get("datetime") or date_el.get_text(strip=True)
                        date_pub = dateparser.parse(
                            raw, languages=["fr"],
                            settings={"RETURN_AS_TIMEZONE_AWARE": True, "TIMEZONE": "UTC"}
                        )

                entries.append({
                    "titre": titre, "lien": href, "lien_detail": href,
                    "lien_image": lien_image, "type_offre": "pfe",
                    "date_publication": date_pub, "source_site": self.SOURCE_NAME,
                })
        return entries

    def _scrape_detail(self, url: str) -> dict:
        try:
            resp = requests.get(url, headers=self.get_headers(), timeout=15)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "lxml")

            titre = ""
            h1 = soup.select_one("h1.entry-title, h1")
            if h1:
                titre = h1.get_text(strip=True)

            categories = []
            domaine = None
            for a in soup.select("a[href*='/catalogue/category/']"):
                cat_slug = a.get("href", "").rstrip("/").split("/")[-1]
                cat_nom  = CATEGORIES_MAP.get(cat_slug, a.get_text(strip=True))
                if cat_nom and cat_nom not in categories:
                    categories.append(cat_nom)
            if categories:
                domaine = categories[0]

            description = ""
            for heading in soup.select("h2, h3"):
                if "entreprise" in heading.get_text(strip=True).lower():
                    next_p = heading.find_next_sibling("p")
                    if next_p:
                        description = next_p.get_text(strip=True)
                    break
            if not description:
                first_p = soup.select_one(".entry-content p, article p")
                if first_p:
                    description = first_p.get_text(strip=True)

            sujets = []
            competences = []
            for heading in soup.select("h2, h3"):
                if any(w in heading.get_text(strip=True).lower() for w in ["offres", "stage", "sujet"]):
                    ul = heading.find_next_sibling("ul")
                    if ul:
                        for li in ul.select("li"):
                            sujet_text = li.get_text(strip=True)
                            if sujet_text:
                                sujets.append(sujet_text)
                                for kw in ["Python","Java","React","Angular","Node","Django","Spring",
                                           "Docker","Kubernetes","ML","IA","Data","DevOps","AWS",
                                           "Azure","Flutter","Laravel","Vue","MongoDB","TypeScript"]:
                                    if kw.lower() in sujet_text.lower() and kw not in competences:
                                        competences.append(kw)
                    break

            email = None
            m = re.search(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", soup.get_text())
            if m:
                email = m.group(0)

            telephone = None
            t = re.search(r"(\+216[\s\-]?\d{2}[\s\-]?\d{3}[\s\-]?\d{3})", soup.get_text())
            if t:
                telephone = t.group(0).strip()

            site_web = None
            for a in soup.select("a[href^='http']"):
                href = a.get("href", "")
                if "pfebooks.com" not in href and "facebook" not in href and "linkedin" not in href:
                    site_web = href
                    break

            date_pub = None
            for sel in ["time[datetime]", ".entry-date", "[class*='posted-on'] time"]:
                el = soup.select_one(sel)
                if el:
                    raw = el.get("datetime") or el.get_text(strip=True)
                    date_pub = dateparser.parse(
                        raw, languages=["fr", "en"],
                        settings={"RETURN_AS_TIMEZONE_AWARE": True, "TIMEZONE": "UTC"}
                    )
                    if date_pub:
                        break

            lien_image = None
            for img in soup.select(".entry-content img, article img"):
                src = img.get("src", "")
                if "wp-content/uploads" in src:
                    lien_image = re.sub(r"-\d+x\d+(\.\w+)$", r"\1", src)
                    break

            description_complete = description
            if sujets:
                description_complete += "\n\nSujets de stage :\n" + "\n".join(f"• {s}" for s in sujets)
            if email:
                description_complete += f"\n\nContact : {email}"
            if telephone:
                description_complete += f" | Tél : {telephone}"

            return {
                "titre": titre or None, "description": description_complete or None,
                "competences": competences, "domaine": domaine, "lien_image": lien_image,
                "date_publication": date_pub, "categories": categories,
                "nb_sujets": len(sujets), "email_contact": email,
                "telephone": telephone, "site_web_entreprise": site_web,
            }
        except Exception as e:
            logger.debug(f"[pfebooks.com] Erreur détail {url}: {e}")
            return {}
