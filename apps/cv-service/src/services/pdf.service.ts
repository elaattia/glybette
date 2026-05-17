import os from "os";
import fs from "fs";
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
    sections: Array<{
        type: string;
        order: number;
        data: unknown;
    }>;
}

const PAGE_HEIGHT_PX = 1120;
const HEADER_HEIGHT_PX = 90;
const SECTION_SPACING = 20;

function estimateContentHeight(sections: Array<{ type: string; data: any }>): number {
    let height = HEADER_HEIGHT_PX;

    for (const section of sections) {
        if (section.type === "summary" && section.data?.text) {
            height += Math.ceil(section.data.text.length / 90) * 14 + SECTION_SPACING;
        } else if (section.type === "experience" && Array.isArray(section.data)) {
            height += section.data.length * 65 + SECTION_SPACING;
        } else if (section.type === "education" && Array.isArray(section.data)) {
            height += section.data.length * 50 + SECTION_SPACING;
        } else if (section.type === "skills" && Array.isArray(section.data)) {
            height += section.data.length * 45 + SECTION_SPACING;
        } else if (section.type === "projects" && Array.isArray(section.data)) {
            height += section.data.length * 60 + SECTION_SPACING;
        } else if (section.type === "certifications" && Array.isArray(section.data)) {
            height += section.data.length * 35 + SECTION_SPACING;
        } else if (section.type === "languages" && Array.isArray(section.data)) {
            height += section.data.length * 20 + SECTION_SPACING;
        }
    }
    return height;
}

export class PdfService {
    async generatePdf(cv: CvForPdf): Promise<string> {
        let browser: any;

        try {
            console.log("[PDF] Starting PDF generation...");

            const puppeteerModule = await import("puppeteer");
            const puppeteer = puppeteerModule.default || puppeteerModule;

            const executablePath = this.getBrowserPath();

            console.log(
                "[PDF] Browser path:",
                executablePath || "Using Puppeteer Chromium"
            );

            browser = await puppeteer.launch({
                headless: true,
                executablePath,
                timeout: 60000,
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-gpu",
                    "--disable-extensions",
                ],
            });

            const page = await browser.newPage();

            page.setDefaultNavigationTimeout(60000);
            page.setDefaultTimeout(60000);

            await page.setViewport({
                width: 794,
                height: 1123,
            });

            const html = buildHtml(cv);

            console.log("[PDF] HTML built successfully");

            await page.setContent(html, {
                waitUntil: "domcontentloaded",
                timeout: 60000,
            });

            console.log("[PDF] HTML rendered successfully");

            const buffer = await page.pdf({
                format: "A4",
                printBackground: true,
                preferCSSPageSize: true,
                timeout: 60000,
                margin: {
                    top: "0",
                    right: "0",
                    bottom: "0",
                    left: "0",
                },
            });

            console.log("[PDF] PDF generated successfully");

            const base64 = Buffer.from(buffer).toString("base64");

            return `data:application/pdf;base64,${base64}`;
        } catch (error: any) {
            console.error("[PDF ERROR]:", error.message);
            console.error(error.stack);

            throw new Error(`PDF generation failed: ${error.message}`);
        } finally {
            if (browser) {
                try {
                    await browser.close();
                    console.log("[PDF] Browser closed");
                } catch (err) {
                    console.error("[PDF] Failed to close browser", err);
                }
            }
        }
    }

    private getBrowserPath(): string | undefined {
        if (os.platform() !== "win32") {
            return undefined;
        }

        const possiblePaths = [
            "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
            "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
            "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
        ];

        for (const browserPath of possiblePaths) {
            if (fs.existsSync(browserPath)) {
                return browserPath;
            }
        }

        console.log(
            "[PDF] No local browser found → fallback to Puppeteer Chromium"
        );

        return undefined;
    }
}

const TEMPLATE_STYLES: Record<
    string,
    {
        accent: string;
        header: string;
    }
> = {
    "modern-strategy": {
        accent: "#16A34A",
        header: "#1a3a5c",
    },
    academic: {
        accent: "#8B4513",
        header: "#3d2b1f",
    },
    creative: {
        accent: "#FF6B6B",
        header: "#c0392b",
    },
    minimalist: {
        accent: "#333333",
        header: "#2d2d2d",
    },
    tech: {
        accent: "#38bdf8",
        header: "#0f172a",
    },
    international: {
        accent: "#FF8C42",
        header: "#c0622e",
    },
    "design-epure": {
        accent: "#e94560",
        header: "#1a1a2e",
    },
    "classic-reinvented": {
        accent: "#3498DB",
        header: "#2C3E50",
    },
    "skills-focus": {
        accent: "#C0392B",
        header: "#8c2b20",
    },
    startup: {
        accent: "#FF6B35",
        header: "#c0501f",
    },
};

function buildHtml(cv: CvForPdf): string {
    const sorted = [...cv.sections].sort((a, b) => a.order - b.order);

    const get = <T>(type: string): T | undefined =>
        sorted.find((s) => s.type === type)?.data as T | undefined;

    const personal = get<PersonalInfoData>("personal-info");
    const summary = get<{ text: string }>("summary");
    const exp = get<ExperienceItem[]>("experience") ?? [];
    const edu = get<EducationItem[]>("education") ?? [];
    const skills = get<SkillGroup[]>("skills") ?? [];
    const projects = get<ProjectItem[]>("projects") ?? [];
    const langs = get<LanguageItem[]>("languages") ?? [];
    const certs = get<CertificationItem[]>("certifications") ?? [];

    const styles =
        TEMPLATE_STYLES[cv.template] ??
        TEMPLATE_STYLES["modern-strategy"];

    const isSidebar = ["creative", "skills-focus"].includes(
        cv.template
    );

    if (isSidebar) {
        return buildSidebarHtml({
            personal,
            summary,
            exp,
            edu,
            skills,
            projects,
            langs,
            certs,
            accent: styles.accent,
            headerBg: styles.header,
        });
    }

    return buildStandardHtml({
        personal,
        summary,
        exp,
        edu,
        skills,
        projects,
        langs,
        certs,
        accent: styles.accent,
        headerBg: styles.header,
    });
}

interface HtmlData {
    personal?: PersonalInfoData;
    summary?: { text: string };
    exp: ExperienceItem[];
    edu: EducationItem[];
    skills: SkillGroup[];
    projects: ProjectItem[];
    langs: LanguageItem[];
    certs: CertificationItem[];
    accent: string;
    headerBg: string;
}


function buildStandardHtml(d: HtmlData): string {
    const {
        personal,
        summary,
        exp,
        edu,
        skills,
        projects,
        langs,
        certs,
        accent,
        headerBg,
    } = d;

    const sections = [
        { type: "summary", data: summary },
        { type: "experience", data: exp },
        { type: "education", data: edu },
        { type: "skills", data: skills },
        { type: "projects", data: projects },
        { type: "languages", data: langs },
        { type: "certifications", data: certs },
    ];
    const needsTwoPages = estimateContentHeight(sections) > PAGE_HEIGHT_PX;

    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
*{
    box-sizing:border-box;
    margin:0;
    padding:0;
}

@page{
    size:A4;
    margin:0;
}

body{
    font-family:Arial,sans-serif;
    color:#1a1a1a;
    width:210mm;
}

.section,
.exp-item,
.edu-item,
.project-item{
    break-inside: avoid;
    page-break-inside: avoid;
}

.page-break{
    page-break-after: always;
    break-after: always;
}

.header{
    background:${headerBg};
    color:white;
    padding:25px;
}

.body{
    padding:25px;
}

.section{
    margin-bottom:20px;
}

.section-title{
    color:${accent};
    font-weight:bold;
    margin-bottom:10px;
    border-bottom:1px solid ${accent};
    padding-bottom:5px;
}

.skill-tag{
    display:inline-block;
    background:${accent}20;
    padding:4px 8px;
    margin:2px;
    border-radius:20px;
    font-size:12px;
}
</style>
</head>
<body>

<div class="header">
    <h1>${personal?.firstName ?? ""} ${personal?.lastName ?? ""}</h1>
    <p>${personal?.roleTitle ?? ""}</p>
</div>

<div class="body">

${
    summary?.text
        ? `
<div class="section">
    <div class="section-title">Profil</div>
    <p>${summary.text}</p>
</div>`
        : ""
}

${
    exp.length
        ? `
<div class="section">
    <div class="section-title">Expérience</div>
    ${exp
        .map(
            (e) => `
        <div class="exp-item">
            <strong>${e.position}</strong>
            <div>${e.company}</div>
            <div>${e.description ?? ""}</div>
        </div>
    `
        )
        .join("")}
</div>`
        : ""
}

${
    edu.length
        ? `
<div class="section">
    <div class="section-title">Formation</div>
    ${edu
        .map(
            (e) => `
        <div class="edu-item">
            <strong>${e.degree}</strong>
            <div>${e.institution}</div>
        </div>
    `
        )
        .join("")}
</div>`
        : ""
}

${
    projects.length
        ? `
<div class="section">
    <div class="section-title">Projects</div>
    ${projects
        .map(
            (p) => `
        <div class="project-item">
            <strong>${p.name}</strong>
            <div>${p.description ?? ""}</div>
        </div>
    `
        )
        .join("")}
</div>`
        : ""
}

${
    skills.length
        ? `
<div class="section">
    <div class="section-title">Skills</div>
    ${skills
        .map((g) =>
            (g.skills ?? [])
                .map(
                    (s) => `
            <span class="skill-tag">${s}</span>
        `
                )
                .join("")
        )
        .join("")}
</div>`
        : ""
}

</div>
</body>
</html>
`;
}


function buildSidebarHtml(d: HtmlData): string {
    const {
        personal,
        summary,
        exp,
        edu,
        skills,
        projects,
        langs,
        certs,
        accent,
        headerBg,
    } = d;

    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
*{
    box-sizing:border-box;
    margin:0;
    padding:0;
}

@page{
    size:A4;
    margin:0;
}

body{
    font-family:Arial,sans-serif;
}

.cv-container{
    display:flex;
    width:100%;
}

.sidebar{
    width:35%;
    background:${headerBg};
    color:white;
    padding:25px;
}

.main{
    width:65%;
    padding:25px;
}

.exp-item,
.project-item,
.edu-item{
    break-inside: avoid;
    page-break-inside: avoid;
}

.section-title{
    color:${accent};
    font-weight:bold;
    margin-bottom:10px;
    border-bottom:1px solid ${accent};
}
</style>
</head>
<body>

<div class="cv-container">

<div class="sidebar">
    <h1>${personal?.firstName ?? ""}</h1>
    <h1>${personal?.lastName ?? ""}</h1>

    <p>${personal?.email ?? ""}</p>
    <p>${personal?.phone ?? ""}</p>
    <p>${personal?.location ?? ""}</p>

    ${
        skills.length
            ? `
        <br>
        <h3>Skills</h3>
        ${skills
            .map((g) =>
                (g.skills ?? [])
                    .map((s) => `<div>${s}</div>`)
                    .join("")
            )
            .join("")}
    `
            : ""
    }

    ${
        langs.length
            ? `
        <br>
        <h3>Languages</h3>
        ${langs
            .map(
                (l) => `
            <div>${l.language} - ${l.level}</div>
        `
            )
            .join("")}
    `
            : ""
    }
</div>

<div class="main">

${
    summary?.text
        ? `
<div class="section">
    <div class="section-title">Profile</div>
    <p>${summary.text}</p>
</div>
`
        : ""
}

${
    exp.length
        ? `
<div class="section">
    <div class="section-title">Experience</div>
    ${exp
        .map(
            (e) => `
        <div class="exp-item">
            <strong>${e.position}</strong>
            <div>${e.company}</div>
            <div>${e.description ?? ""}</div>
        </div>
    `
        )
        .join("")}
</div>
`
        : ""
}

${
    edu.length
        ? `
<div class="section">
    <div class="section-title">Education</div>
    ${edu
        .map(
            (e) => `
        <div class="edu-item">
            <strong>${e.degree}</strong>
            <div>${e.institution}</div>
        </div>
    `
        )
        .join("")}
</div>
`
        : ""
}

${
    projects.length
        ? `
<div class="section">
    <div class="section-title">Projects</div>
    ${projects
        .map(
            (p) => `
        <div class="project-item">
            <strong>${p.name}</strong>
            <div>${p.description ?? ""}</div>
        </div>
    `
        )
        .join("")}
</div>
`
        : ""
}

${
    certs.length
        ? `
<div class="section">
    <div class="section-title">Certifications</div>
    ${certs
        .map(
            (c) => `
        <div>
            ${c.name} - ${c.issuer}
        </div>
    `
        )
        .join("")}
</div>
`
        : ""
}

</div>
</div>

</body>
</html>
`;
}