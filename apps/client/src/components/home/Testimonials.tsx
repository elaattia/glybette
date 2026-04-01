const styles = `
  .gb-testimonials { padding: 110px 40px; max-width: 1200px; margin: 0 auto; font-family: 'DM Sans', sans-serif; }
  .gb-test-header { text-align: center; margin-bottom: 64px; }
  .gb-test-header h2 {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: clamp(2rem, 4.5vw, 3.4rem);
    font-weight: 800; letter-spacing: -0.04em; line-height: 1.05;
    margin-bottom: 14px; color: var(--gb-text);
  }
  .gb-test-header p { color: var(--gb-muted); font-size: 1rem; font-weight: 300; max-width: 420px; margin: 0 auto; }
  .gb-test-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 18px; }
  .gb-tcard {
    background: var(--gb-card-bg);
    border: 1px solid var(--gb-border);
    border-radius: 20px; padding: 30px;
    position: relative; overflow: hidden;
    transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s, background 0.3s;
  }
  .gb-tcard:hover {
    transform: translateY(-7px);
    border-color: rgba(22,163,74,0.32);
    background: var(--gb-card-hover);
    box-shadow: var(--gb-shadow);
  }
  .gb-tcard::before {
    content:'"'; position:absolute; top:-14px; right:18px;
    font-family:'Bricolage Grotesque',sans-serif;
    font-size:9rem; font-weight:800; line-height:1;
    background: linear-gradient(90deg, #16A34A, #0284C7);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    background-clip:text; opacity:0.07; pointer-events:none;
  }
  .gb-stars { display:flex; gap:4px; margin-bottom:16px; }
  .gb-star {
    width:14px; height:14px;
    background: linear-gradient(135deg,#fbbf24,#f59e0b);
    clip-path: polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);
  }
  .gb-tcard-text { font-size:0.9rem; color:var(--gb-text-off); line-height:1.8; font-weight:300; margin-bottom:22px; font-style:italic; position:relative; z-index:1; }
  .gb-tcard-author { display:flex; align-items:center; gap:13px; }
  .gb-tcard-avatar {
    width:42px; height:42px; border-radius:50%; flex-shrink:0;
    background: linear-gradient(135deg,#16A34A,#0284C7);
    display:flex; align-items:center; justify-content:center;
    font-weight:700; font-size:0.85rem; color:#fff;
    font-family:'Bricolage Grotesque',sans-serif;
  }
  .gb-tcard-name { font-weight:600; font-size:0.9rem; color:var(--gb-text); font-family:'Bricolage Grotesque',sans-serif; letter-spacing:-0.01em; }
  .gb-tcard-role { font-size:0.75rem; color:var(--gb-muted); margin-top:3px; font-weight:300; }
  @media (max-width:900px) {
    .gb-testimonials { padding:80px 20px; }
    .gb-test-grid { grid-template-columns:1fr; gap:14px; }
  }
  @media (min-width:600px) and (max-width:900px) { .gb-test-grid { grid-template-columns:1fr 1fr; } }
`;

const testimonials = [
  { initials:"YB", name:"Yasmine Ben Ali",  role:"Software Engineering Student · ISSAT",  text:"I found my PFE placement in under a week. The AI matched me with a project that perfectly fit my React and Node.js skills. I didn't have to search it came to me." },
  { initials:"MA", name:"Mohamed Ayari",    role:"Full-Stack Developer · 3 yrs experience", text:"I was transitioning to DevOps and had no idea how to reposition my profile. Glybette restructured my experience and surfaced targeted roles I never would have found alone." },
  { initials:"IC", name:"Ines Chaabane",    role:"Data Science Student · EPS",          text:"The AI optimized profile made me stand out. Recruiters started reaching out to me directly. Glybette completely changed how I approach job searching." },
];

function useReveal() {
  return (el: HTMLElement | null) => {
    if (!el) return;
    el.classList.add("gb-reveal");
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("visible"); io.disconnect(); } },
      { threshold: 0.08, rootMargin: "0px 0px -60px 0px" }
    );
    io.observe(el);
  };
}

export default function Testimonials() {
  const reveal = useReveal();
  return (
    <>
      <style>{styles}</style>
      <section id="testimonials">
        <div className="gb-testimonials" ref={reveal}>
          <div className="gb-test-header">
            <div className="gb-sec-label">Testimonials</div>
            <h2>Loved by students<br />and professionals</h2>
            <p>Real stories from people who found their next opportunity with Glybette.</p>
          </div>
          <div className="gb-test-grid">
            {testimonials.map((t) => (
              <div key={t.initials} className="gb-tcard">
                <div className="gb-stars">
                  {[...Array(5)].map((_, i) => <div key={i} className="gb-star" />)}
                </div>
                <p className="gb-tcard-text">"{t.text}"</p>
                <div className="gb-tcard-author">
                  <div className="gb-tcard-avatar">{t.initials}</div>
                  <div>
                    <div className="gb-tcard-name">{t.name}</div>
                    <div className="gb-tcard-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}