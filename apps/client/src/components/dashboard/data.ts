export const profileCompletion = {
    score: 85,
    highlights: [
        { label: "Resume uploaded", state: "done" as const },
        { label: "Skills verified", state: "done" as const },
        { label: "Add portfolio link", state: "todo" as const },
    ],
};

export const recommendedJobs = [
    {
        id: "job-1",
        role: "Senior Product Designer",
        company: "TechFlow Inc.",
        location: "Remote",
        match: 98,
        tags: ["Figma", "React"],
        posted: "Posted 2h ago",
    },
    {
        id: "job-2",
        role: "UX Engineer",
        company: "Global Systems",
        location: "Berlin",
        match: 95,
        tags: ["HTML/CSS", "Design Systems"],
        posted: "Posted 5h ago",
    },
    {
        id: "job-3",
        role: "Frontend Developer",
        company: "AlphaWave",
        location: "London (Hybrid)",
        match: 89,
        tags: ["Vue.js", "Tailwind"],
        posted: "Posted 1d ago",
    },
];

export const resumeHealth = {
    grade: "A",
    summary: "Excellent score",
    details: "Your resume is highly readable by ATS systems.",
    checks: [
        { label: "Keywords", status: "Optimized" },
        { label: "Formatting", status: "Clean" },
        { label: "Action verbs", status: "Needs improvement" },
    ],
};

export const recentActivity = [
    {
        id: "act-1",
        title: "CV tailored for Product Designer role",
        meta: "14 minutes ago",
    },
    {
        id: "act-2",
        title: "New project message from Lena A.",
        meta: "2 hours ago",
    },
    {
        id: "act-3",
        title: "Portfolio section Skills was updated",
        meta: "Yesterday",
    },
    {
        id: "act-4",
        title: "Opportunity status changed to Interviewing",
        meta: "2 days ago",
    },
];
