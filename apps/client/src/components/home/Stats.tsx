const styles = `
  .gb-stats {
    padding: 84px 40px;
    background: var(--gb-stats-bg);
    border-top: 1px solid var(--gb-border);
    border-bottom: 1px solid var(--gb-border);
    font-family: 'DM Sans', sans-serif;
    transition: background 0.35s, border-color 0.35s;
  }
  .gb-stats-inner {
    max-width: 1100px; margin: 0 auto;
    display: grid; grid-template-columns: repeat(4,1fr); gap: 2px;
  }
  .gb-stat { padding: 44px 32px; text-align: center; position: relative; }
  .gb-stat::after {
    content:''; position:absolute; right:0; top:22%; bottom:22%;
    width:1px; background: var(--gb-border);
  }
  .gb-stat:last-child::after { display:none; }
  .gb-stat-val {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: clamp(2.6rem, 5vw, 3.8rem);
    font-weight: 800; letter-spacing: -0.04em; line-height: 1; margin-bottom: 10px;
    background: linear-gradient(90deg, #16A34A, #0284C7);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .gb-stat-label { font-size: 0.92rem; color: var(--gb-text-off); font-weight: 500; margin-bottom: 5px; }
  .gb-stat-sub   { font-size: 0.76rem; color: var(--gb-muted2); font-weight: 300; }
  @media (max-width: 860px) {
    .gb-stats { padding: 60px 20px; }
    .gb-stats-inner { grid-template-columns: 1fr 1fr; }
    .gb-stat::after { display:none; }
    .gb-stat { padding: 32px 20px; }
  }
`;

const stats = [
  { val:"500+",   label:"Active Opportunities",  sub:"Internships, PFE & Jobs" },
  { val:"200+",   label:"Partner Companies",      sub:"Startups to enterprises" },
  { val:"2,000+", label:"Profiles Created",       sub:"Students & professionals" },
  { val:"97%",    label:"Match Accuracy",         sub:"AI powered precision" },
];

function useReveal() {
  return (el: HTMLElement | null) => {
    if (!el) return;
    el.classList.add("gb-reveal");
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("visible"); io.disconnect(); } },
      { threshold: 0.12 }
    );
    io.observe(el);
  };
}

export default function Stats() {
  const reveal = useReveal();
  return (
    <>
      <style>{styles}</style>
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
    </>
  );
}