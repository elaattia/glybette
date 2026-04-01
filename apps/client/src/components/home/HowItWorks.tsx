const styles = `
  .gb-hiw { padding: 110px 40px; max-width: 1200px; margin: 0 auto; font-family: 'DM Sans', sans-serif; }
  .gb-hiw-header { text-align: center; margin-bottom: 72px; }
  .gb-hiw-header h2 {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: clamp(2rem, 4.5vw, 3.6rem);
    font-weight: 800; letter-spacing: -0.04em; line-height: 1.05;
    margin-bottom: 16px; color: var(--gb-text);
  }
  .gb-hiw-header p { color: var(--gb-muted); font-size: 1.05rem; max-width: 460px; margin: 0 auto; line-height: 1.7; font-weight: 300; }
  .gb-steps { display: grid; grid-template-columns: repeat(3,1fr); gap: 2px; position: relative; }
  .gb-steps::before {
    content:''; position:absolute; top:64px; left:33.3%; width:33.3%;
    height:1px; border-top:1px dashed var(--gb-border2); pointer-events:none;
  }
  .gb-step {
    background: var(--gb-card-bg); padding: 48px 34px;
    position: relative; overflow: hidden;
    border: 1px solid transparent;
    transition: border-color 0.3s, background 0.3s;
  }
  .gb-step:hover { background: var(--gb-card-hover); border-color: rgba(2,132,199,0.28); }
  .gb-step-bg-num {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 6rem; font-weight: 800; letter-spacing: -0.04em;
    background: linear-gradient(90deg, #16A34A, #0284C7);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text; opacity: 0.07; line-height: 1;
    position: absolute; top: 14px; right: 18px;
  }
  .gb-step-icon {
    width: 64px; height: 64px; border-radius: 18px;
    background: linear-gradient(135deg, rgba(22,163,74,0.12), rgba(2,132,199,0.12));
    border: 1px solid rgba(22,163,74,0.25);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.7rem; margin-bottom: 26px;
    transition: transform 0.35s, box-shadow 0.35s;
  }
  .gb-step:hover .gb-step-icon { transform: scale(1.08); box-shadow: 0 0 32px rgba(22,163,74,0.2); }
  .gb-step-n { font-size: 0.7rem; font-weight: 700; color: #16A34A; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 12px; }
  .gb-step h3 { font-family: 'Bricolage Grotesque', sans-serif; font-size: 1.22rem; font-weight: 700; margin-bottom: 13px; letter-spacing: -0.025em; color: var(--gb-text); }
  .gb-step p { font-size: 0.875rem; color: var(--gb-muted); line-height: 1.75; font-weight: 300; }
  .gb-hiw-cta { text-align: center; margin-top: 56px; }
  .gb-btn-primary-sm {
    display: inline-flex; align-items: center; gap: 10px;
    background: linear-gradient(90deg, #16A34A, #0284C7);
    color: #fff; font-weight: 600; padding: 14px 32px;
    border-radius: 10px; font-size: 0.95rem;
    text-decoration: none; font-family: 'DM Sans', sans-serif;
    box-shadow: 0 0 36px rgba(22,163,74,0.3);
    transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
    letter-spacing: 0.01em;
  }
  .gb-btn-primary-sm:hover { transform: translateY(-2px); box-shadow: 0 8px 44px rgba(22,163,74,0.48); opacity: 0.93; }
  .gb-btn-primary-sm:hover .gb-arr { transform: translateX(5px); }
  @media (max-width: 860px) {
    .gb-hiw { padding: 80px 20px; }
    .gb-steps { grid-template-columns: 1fr; }
    .gb-steps::before { display: none; }
  }
`;

import {
  User,
  Sparkles,
  Rocket,
  ArrowRight,
} from "lucide-react";

const steps = [
  { num:"01", icon:<User className="w-6 h-6" />, title:"Build Your Profile",       desc:"Start with the basics. Create your CV, add your skills, and build a profile that truly reflects who you are." },
  { num:"02", icon:<Sparkles className="w-6 h-6" />, title:"Grow & Prepare",   desc:"Level up before you apply. Work on your portfolio, practice interviews, and improve your skills with courses and certifications." },
  { num:"03", icon:<Rocket className="w-6 h-6" />, title:"Discover & Apply",        desc:"Find the right opportunities. Explore internships, PFE projects, and jobs tailored to your profile and apply with confidence." },
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

export default function HowItWorks() {
  const reveal = useReveal();
  return (
    <>
      <style>{styles}</style>
      <section id="how-it-works">
        <div className="gb-hiw" ref={reveal}>
          <div className="gb-hiw-header">
            <div className="gb-sec-label">How it works</div>
            <h2>From getting started<br />to getting hired</h2>
            <p>Glybette is designed to get you from zero to opportunity as fast as possible.</p>
          </div>
          <div className="gb-steps">
            {steps.map((s) => (
              <div key={s.num} className="gb-step">
                <div className="gb-step-bg-num">{s.num}</div>
                <div className="gb-step-icon">{s.icon}</div>
                <div className="gb-step-n">Step {s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="gb-hiw-cta">
            <a href="/onboarding" className="gb-btn-primary-sm">
              Start Now <ArrowRight className="w-4 h-4 inline ml-1" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}