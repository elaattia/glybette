import "@/styles/home/pricing.css";

const freeFeats = [
  "Build your CV & profile",
  "Access curated opportunities",
  "Create a simple portfolio",
  "Track your applications",
  "Basic career insights",
  "Community access",
];
const proFeats = [
  "Advanced CV & profile optimization",
  "Unlimited opportunities access",
  "Smart recommendations dashboard",
  "Priority visibility to recruiters",
  "Unlimited interview practice",
  "Courses & certifications access",
  "Advanced portfolio customization",
  "Full application tracking",
];

function Check() {
  return (
    <div className="gb-check">
      <svg viewBox="0 0 12 10"><polyline points="1,5 4,8 11,1" /></svg>
    </div>
  );
}

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
      { threshold: 0.06, rootMargin: "0px 0px -60px 0px" }
    );
    io.observe(el);
  };
}

export default function Pricing() {
  const reveal = useReveal();
  return (
    <section id="pricing">
      <div className="gb-pricing" ref={reveal}>
        <div className="gb-pricing-header">
          <div className="gb-sec-label">Pricing</div>
          <h2>Choose your path</h2>
          <p>Start free and unlock the full power of Glybette Pro when you're ready.</p>
        </div>
        <div className="gb-pricing-grid">
          <div className="gb-pcard">
            <div className="gb-plan-name">Essential</div>
            <div className="gb-plan-price">
              <span className="amt">0</span><span className="cur">DT</span>
              <span className="per"> / forever</span>
            </div>
            <p className="gb-plan-desc">Everything to get started and land your first opportunity.</p>
            <ul className="gb-plan-feats">
              {freeFeats.map((f) => <li key={f}><Check />{f}</li>)}
            </ul>
            <a href="/onboarding" className="gb-btn-plan outline">Get Started Free</a>
          </div>
          <div className="gb-pcard featured">
            <div className="gb-popular-badge">Most Popular</div>
            <div className="gb-plan-name">Professional</div>
            <div className="gb-plan-price">
              <span className="amt">30</span><span className="cur">DT</span>
              <span className="per"> / month</span>
            </div>
            <p className="gb-plan-desc">Advanced tools to accelerate your career and stand out.</p>
            <ul className="gb-plan-feats">
              {proFeats.map((f) => <li key={f}><Check />{f}</li>)}
            </ul>
            <a href="/onboarding?plan=pro" className="gb-btn-plan filled">Upgrade to Pro →</a>
          </div>
        </div>
      </div>
    </section>
  );
}
