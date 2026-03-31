const styles = `
  .gb-cta-wrap { padding: 80px 40px 120px; max-width: 960px; margin: 0 auto; font-family: 'DM Sans', sans-serif; }
  .gb-cta-box {
    background: var(--gb-ctabox-bg);
    border: 1px solid var(--gb-ctabox-border);
    border-radius: 28px; padding: 88px 64px;
    text-align: center; position: relative; overflow: hidden;
    transition: background 0.35s, border-color 0.35s;
  }
  .gb-cta-box::before {
    content:''; position:absolute; inset:0;
    background: radial-gradient(ellipse 65% 70% at 50% -10%, rgba(22,163,74,0.14), transparent);
    pointer-events: none;
  }
  .gb-cta-deco-1 {
    position:absolute; top:-60px; right:-60px; width:260px; height:260px;
    border-radius:50%; background: rgba(22,163,74,0.05); pointer-events:none;
  }
  .gb-cta-deco-2 {
    position:absolute; bottom:-50px; left:-50px; width:200px; height:200px;
    border-radius:50%; background: rgba(2,132,199,0.05); pointer-events:none;
  }
  .gb-cta-box h2 {
    font-family:'Bricolage Grotesque',sans-serif;
    font-size: clamp(2.2rem,5vw,3.8rem);
    font-weight:800; letter-spacing:-0.04em; line-height:1.03;
    margin-bottom:18px; color:var(--gb-text); position:relative;
  }
  .gb-cta-box > p {
    color: var(--gb-muted); font-size:1.05rem;
    max-width:490px; margin:0 auto 44px;
    font-weight:300; line-height:1.75; position:relative;
  }
  .gb-cta-actions { display:flex; justify-content:center; gap:14px; flex-wrap:wrap; position:relative; }
  .gb-cta-note { font-size:0.78rem; color:var(--gb-muted2); margin-top:22px; font-weight:300; position:relative; }
  .gb-cta-primary {
    display:inline-flex; align-items:center; gap:10px;
    background:linear-gradient(90deg,#16A34A,#0284C7);
    color:#fff; font-weight:600; padding:16px 36px;
    border-radius:11px; font-size:1rem;
    text-decoration:none; font-family:'DM Sans',sans-serif;
    box-shadow:0 0 44px rgba(22,163,74,0.38);
    transition:transform 0.2s, box-shadow 0.2s, opacity 0.2s;
    letter-spacing:0.01em;
  }
  .gb-cta-primary:hover { transform:translateY(-2px); box-shadow:0 10px 52px rgba(22,163,74,0.52); opacity:0.93; }
  .gb-cta-primary:hover .gb-arr { transform:translateX(5px); }
  .gb-cta-secondary {
    display:inline-flex; align-items:center;
    background: transparent;
    color:var(--gb-text-off); border:1px solid var(--gb-border2);
    font-weight:400; padding:16px 32px; border-radius:11px;
    font-size:1rem; text-decoration:none; font-family:'DM Sans',sans-serif;
    transition:background 0.2s, border-color 0.2s, transform 0.2s;
  }
  .gb-cta-secondary:hover { background:var(--gb-surface); border-color:rgba(22,163,74,0.4); transform:translateY(-2px); }
  @media (max-width:700px) {
    .gb-cta-wrap { padding:60px 20px 90px; }
    .gb-cta-box { padding:60px 28px; }
  }
`;

function useReveal() {
  return (el: HTMLElement | null) => {
    if (!el) return;
    el.classList.add("gb-reveal");
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("visible"); io.disconnect(); } },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    io.observe(el);
  };
}

export default function CTA() {
  const reveal = useReveal();
  return (
    <>
      <style>{styles}</style>
      <div className="gb-cta-wrap" ref={reveal}>
        <div className="gb-cta-box">
          <div className="gb-cta-deco-1" />
          <div className="gb-cta-deco-2" />
          <h2>Ready to start<br />your journey?</h2>
          <p>
            Join thousands of students and professionals using Glybette to find
            their next career defining opportunity.
          </p>
          <div className="gb-cta-actions">
            <a href="/onboarding" className="gb-cta-primary">
              Create My Free Profile <span className="gb-arr">→</span>
            </a>
            <a href="#features" className="gb-cta-secondary">See Features</a>
          </div>
          <p className="gb-cta-note">Free to start · No credit card · Takes 2 minutes</p>
        </div>
      </div>
    </>
  );
}