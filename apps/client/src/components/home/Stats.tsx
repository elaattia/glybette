import "@/styles/home/stats.css";

const stats = [
    { val: "500+", label: "Active Opportunities", sub: "Internships, PFE & Jobs" },
    { val: "200+", label: "Partner Companies", sub: "Startups to enterprises" },
    { val: "2,000+", label: "Profiles Created", sub: "Students & professionals" },
    { val: "97%", label: "Match Accuracy", sub: "AI powered precision" },
];

function useReveal() {
    return (el: HTMLElement | null) => {
        if (!el) return;
        el.classList.add("gb-reveal");
        const io = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
                    el.classList.add("visible");
                    io.disconnect();
                }
            },
            { threshold: 0.12 },
        );
        io.observe(el);
    };
}

export default function Stats() {
    const reveal = useReveal();
    return (
        <div className="gb-stats" ref={reveal}>
            <div className="gb-stats-inner">
                {stats.map((s) => (
                    <div key={s.val} className="gb-stat">
                        <div className="gb-stat-val">{s.val}</div>
                        <div className="gb-stat-label">{s.label}</div>
                        <div className="gb-stat-sub">{s.sub}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
