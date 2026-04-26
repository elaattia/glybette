import os from "os";
import type {
    PersonalInfoData,
    ExperienceItem,
    EducationItem,
    SkillGroup,
    ProjectItem,
    LanguageItem,
    CertificationItem,
} from "@glybette/types";

interface CvForPdf {
    _id: unknown;
    title: string;
    template: string;
    sections: Array<{ type: string; order: number; data: unknown }>;
}

export class PdfService {
    async generatePdf(cv: CvForPdf): Promise<string> {
        const puppeteer = await import("puppeteer");
        const pptr = puppeteer.default || puppeteer;

        const executablePath =
            os.platform() === "win32" ? "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" : undefined;

        const browser = await pptr.launch({
            headless: true,
            executablePath,
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
        });

        try {
            const page = await browser.newPage();
            await page.setViewport({ width: 794, height: 1123 });
            await page.setContent(buildHtml(cv), { waitUntil: "networkidle0" });
            const buffer = await page.pdf({
                format: "A4",
                printBackground: true,
                margin: { top: "0", right: "0", bottom: "0", left: "0" },
            });

            const base64 = Buffer.from(buffer).toString("base64");
            return `data:application/pdf;base64,${base64}`;
        } finally {
            await browser.close();
        }
    }
}

const TEMPLATE_STYLES: Record<string, { accent: string; header: string }> = {
    "modern-strategy": { accent: "#16A34A", header: "#1a3a5c" },
    academic: { accent: "#8B4513", header: "#3d2b1f" },
    creative: { accent: "#FF6B6B", header: "#c0392b" },
    minimalist: { accent: "#333333", header: "#2d2d2d" },
    tech: { accent: "#38bdf8", header: "#0f172a" },
    international: { accent: "#FF8C42", header: "#c0622e" },
    "design-epure": { accent: "#e94560", header: "#1a1a2e" },
    "classic-reinvented": { accent: "#3498DB", header: "#2C3E50" },
    "skills-focus": { accent: "#C0392B", header: "#8c2b20" },
    startup: { accent: "#FF6B35", header: "#c0501f" },
};

function buildHtml(cv: CvForPdf): string {
    const sorted = [...cv.sections].sort((a, b) => a.order - b.order);
    const get = <T>(type: string): T | undefined => sorted.find((s) => s.type === type)?.data as T | undefined;

    const personal = get<PersonalInfoData>("personal-info");
    const summary = get<{ text: string }>("summary");
    const exp = get<ExperienceItem[]>("experience") ?? [];
    const edu = get<EducationItem[]>("education") ?? [];
    const skills = get<SkillGroup[]>("skills") ?? [];
    const projects =
        get<Array<{ name: string; description: string; technologies: string[]; url: string }>>("projects") ?? [];
    const langs = get<LanguageItem[]>("languages") ?? [];
    const certs = get<CertificationItem[]>("certifications") ?? [];

    const styles = TEMPLATE_STYLES[cv.template] ?? TEMPLATE_STYLES["modern-strategy"];
    const accent = styles.accent;
    const headerBg = styles.header;

    const isSidebar = ["creative", "skills-focus"].includes(cv.template);

    if (isSidebar) {
        return buildSidebarHtml({ personal, summary, exp, edu, skills, projects, langs, certs, accent, headerBg });
    }

    return buildStandardHtml({ personal, summary, exp, edu, skills, projects, langs, certs, accent, headerBg });
}

interface HtmlData {
    personal: PersonalInfoData | undefined;
    summary: { text: string } | undefined;
    exp: ExperienceItem[];
    edu: EducationItem[];
    skills: SkillGroup[];
    projects: Array<{ name: string; description: string; technologies: string[]; url: string }>;
    langs: LanguageItem[];
    certs: CertificationItem[];
    accent: string;
    headerBg: string;
}

function buildStandardHtml(d: HtmlData): string {
    const { personal, summary, exp, edu, skills, projects, langs, certs, accent, headerBg } = d;

    return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',Arial,sans-serif;font-size:9.5pt;color:#1a1a1a;line-height:1.5}
.header{background:${headerBg};color:#fff;padding:22px 26px}
.header h1{font-size:20pt;font-weight:700;color:#fff;letter-spacing:-0.3px}
.role{color:${accent};font-size:10.5pt;font-weight:500;margin:4px 0 10px}
.contacts{display:flex;flex-wrap:wrap;gap:12px;font-size:7.5pt;opacity:.85}
.body{padding:18px 26px}
.section{margin-bottom:15px}
.section-title{font-size:9pt;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:${accent};border-bottom:1.5px solid ${accent};padding-bottom:3px;margin-bottom:8px}
.exp-item{margin-bottom:10px}
.exp-head{display:flex;justify-content:space-between;align-items:baseline}
.exp-title{font-weight:600;font-size:10pt}
.exp-date{font-size:8pt;color:#666}
.exp-co{font-size:9pt;color:${accent};font-weight:500}
.exp-desc{font-size:8.5pt;color:#444;margin-top:3px;line-height:1.55}
.skill-tag{background:${accent}18;color:#333;padding:1px 7px;border-radius:99px;font-size:7.5pt;display:inline-block;margin:2px}
.edu-item{margin-bottom:8px}
.project-item{margin-bottom:8px}
</style></head><body>
<div class="header">
  <h1>${personal?.firstName ?? ""} ${personal?.lastName ?? ""}</h1>
  ${personal?.roleTitle ? `<div class="role">${personal.roleTitle}</div>` : ""}
  <div class="contacts">
    ${personal?.email ? `<span>✉ ${personal.email}</span>` : ""}
    ${personal?.phone ? `<span>📱 ${personal.phone}</span>` : ""}
    ${personal?.location ? `<span>📍 ${personal.location}</span>` : ""}
    ${personal?.linkedin ? `<span>in ${personal.linkedin}</span>` : ""}
    ${personal?.github ? `<span>⌥ ${personal.github}</span>` : ""}
    ${personal?.portfolio ? `<span>🌐 ${personal.portfolio}</span>` : ""}
  </div>
</div>
<div class="body">
${summary?.text ? `<div class="section"><div class="section-title">Profil</div><p style="font-size:9pt;color:#333;line-height:1.6">${summary.text}</p></div>` : ""}

${
    exp.length
        ? `
<div class="section"><div class="section-title">Expérience</div>
${exp
    .map(
        (e) => `
<div class="exp-item">
  <div class="exp-head">
    <span class="exp-title">${e.position ?? ""}</span>
    <span class="exp-date">${e.startDate ?? ""}${e.startDate ? " – " : ""}${e.current ? "Présent" : (e.endDate ?? "")}</span>
  </div>
  <div class="exp-co">${e.company ?? ""}${e.location ? ` · ${e.location}` : ""}</div>
  ${e.description ? `<div class="exp-desc">${e.description}</div>` : ""}
</div>`,
    )
    .join("")}
</div>`
        : ""
}

${
    edu.length
        ? `
<div class="section"><div class="section-title">Formation</div>
${edu
    .map(
        (e) => `
<div class="edu-item">
  <div class="exp-head">
    <span style="font-weight:600;font-size:9.5pt">${e.degree ?? ""}${e.field ? ` – ${e.field}` : ""}</span>
    <span class="exp-date">${e.endDate ?? ""}</span>
  </div>
  <div class="exp-co">${e.institution ?? ""}</div>
  ${e.gpa ? `<div style="font-size:8pt;color:#666">${e.gpa}</div>` : ""}
</div>`,
    )
    .join("")}
</div>`
        : ""
}

${
    projects.length
        ? `
<div class="section"><div class="section-title">Projets</div>
${projects
    .map(
        (p) => `
<div class="project-item">
  <strong style="font-size:9.5pt">${p.name}</strong>
  ${p.description ? `<p style="font-size:8.5pt;color:#444;margin:2px 0">${p.description}</p>` : ""}
  ${p.technologies?.length ? `<div>${p.technologies.map((t) => `<span class="skill-tag">${t}</span>`).join("")}</div>` : ""}
</div>`,
    )
    .join("")}
</div>`
        : ""
}

${
    skills.length
        ? `
<div class="section"><div class="section-title">Compétences</div>
${skills
    .map(
        (g) => `
<div style="margin-bottom:6px">
  ${g.category ? `<strong style="font-size:8.5pt">${g.category}: </strong>` : ""}
  ${(g.skills ?? []).map((s) => `<span class="skill-tag">${s}</span>`).join("")}
</div>`,
    )
    .join("")}
</div>`
        : ""
}

${langs.length ? `<div class="section"><div class="section-title">Langues</div><p style="font-size:9pt">${langs.map((l) => `<strong>${l.language}</strong> (${l.level})`).join(" · ")}</p></div>` : ""}

${
    certs.length
        ? `
<div class="section"><div class="section-title">Certifications</div>
${certs.map((c) => `<div style="font-size:9pt;margin-bottom:4px"><strong>${c.name}</strong> · <span style="color:#555">${c.issuer}</span> · <span style="color:#888;font-size:8pt">${c.date}</span></div>`).join("")}
</div>`
        : ""
}
</div></body></html>`;
}

function buildSidebarHtml(d: HtmlData): string {
    const { personal, summary, exp, edu, skills, projects, langs, certs, accent, headerBg } = d;

    return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',Arial,sans-serif;font-size:9.5pt;color:#1a1a1a;line-height:1.5;display:flex;min-height:100vh}
.sidebar{width:38%;background:${headerBg};color:#fff;padding:24px 18px;flex-shrink:0}
.main{flex:1;padding:24px 20px;background:#fff}
.sidebar h1{font-size:15pt;font-weight:700;color:#fff;line-height:1.2;margin-bottom:4px}
.sidebar .role{font-size:8.5pt;color:rgba(255,255,255,0.75);font-style:italic;margin-bottom:18px}
.s-section-title{font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,0.55);margin-bottom:8px}
.s-contact-item{font-size:8pt;color:rgba(255,255,255,0.85);margin-bottom:4px;word-break:break-all}
.skill-pill{background:rgba(255,255,255,0.18);color:#fff;padding:2px 7px;border-radius:99px;font-size:7.5pt;display:inline-block;margin:2px}
.m-section-title{font-size:9pt;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:${accent};border-bottom:1.5px solid ${accent};padding-bottom:3px;margin-bottom:8px;margin-top:14px}
.m-section-title:first-child{margin-top:0}
.exp-item{margin-bottom:10px;padding-left:10px;border-left:2px solid #f0f0f0}
.exp-head{display:flex;justify-content:space-between}
</style></head><body>
<div class="sidebar">
  <h1>${personal?.firstName ?? ""}<br/>${personal?.lastName ?? ""}</h1>
  ${personal?.roleTitle ? `<div class="role">${personal.roleTitle}</div>` : ""}
  <div class="s-section-title">Contact</div>
  ${[personal?.email, personal?.phone, personal?.location, personal?.linkedin, personal?.github]
      .filter(Boolean)
      .map((v) => `<div class="s-contact-item">${v}</div>`)
      .join("")}
  ${
      skills.length
          ? `
  <div style="margin-top:18px">
    <div class="s-section-title">Compétences</div>
    ${skills
        .map(
            (g) => `
    <div style="margin-bottom:8px">
      ${g.category ? `<div style="font-size:8pt;font-weight:600;color:rgba(255,255,255,0.8);margin-bottom:4px">${g.category}</div>` : ""}
      ${(g.skills ?? []).map((s) => `<span class="skill-pill">${s}</span>`).join("")}
    </div>`,
        )
        .join("")}
  </div>`
          : ""
  }
  ${
      langs.length
          ? `
  <div style="margin-top:18px">
    <div class="s-section-title">Langues</div>
    ${langs.map((l) => `<div style="font-size:8pt;color:rgba(255,255,255,0.85);margin-bottom:4px"><strong>${l.language}</strong> — ${l.level}</div>`).join("")}
  </div>`
          : ""
  }
</div>
<div class="main">
  ${summary?.text ? `<div style="margin-bottom:16px;padding:10px 12px;background:${accent}0d;border-left:3px solid ${accent};border-radius:0 5px 5px 0"><p style="font-size:9pt;color:#333;font-style:italic;margin:0">${summary.text}</p></div>` : ""}
  ${
      exp.length
          ? `
  <div class="m-section-title">Expérience</div>
  ${exp
      .map(
          (e) => `
  <div class="exp-item">
    <div class="exp-head">
      <strong style="font-size:9.5pt">${e.position ?? ""}</strong>
      <span style="font-size:8pt;color:#888">${e.startDate ?? ""} – ${e.current ? "Présent" : (e.endDate ?? "")}</span>
    </div>
    <div style="font-size:8.5pt;color:${accent};font-weight:600;margin-bottom:3px">${e.company ?? ""}</div>
    ${e.description ? `<p style="font-size:8pt;color:#555;margin:0">${e.description}</p>` : ""}
  </div>`,
      )
      .join("")}`
          : ""
  }
  ${
      edu.length
          ? `
  <div class="m-section-title">Formation</div>
  ${edu
      .map(
          (e) => `
  <div style="margin-bottom:8px">
    <strong style="font-size:9.5pt">${e.degree ?? ""}${e.field ? ` – ${e.field}` : ""}</strong>
    <div style="font-size:8.5pt;color:${accent}">${e.institution ?? ""}</div>
    <div style="font-size:8pt;color:#888">${e.endDate ?? ""}</div>
  </div>`,
      )
      .join("")}`
          : ""
  }
  ${
      projects.length
          ? `
  <div class="m-section-title">Projets</div>
  ${projects
      .map(
          (p) => `
  <div style="margin-bottom:8px">
    <strong style="font-size:9.5pt">${p.name}</strong>
    ${p.description ? `<p style="font-size:8pt;color:#555;margin:2px 0">${p.description}</p>` : ""}
  </div>`,
      )
      .join("")}`
          : ""
  }
  ${
      certs.length
          ? `
  <div class="m-section-title">Certifications</div>
  ${certs.map((c) => `<div style="font-size:9pt;margin-bottom:4px"><strong>${c.name}</strong> · ${c.issuer} · <span style="color:#888;font-size:8pt">${c.date}</span></div>`).join("")}`
          : ""
  }
</div>
</body></html>`;
}
