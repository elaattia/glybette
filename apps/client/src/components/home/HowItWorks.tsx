import "@/styles/home/how-it-works.css";
import {
  User,
  Sparkles,
  Rocket,
  ArrowRight,
} from "lucide-react";

const steps = [
  { num: "01", icon: <User className="w-6 h-6" />, title: "Build Your Profile", desc: "Start with the basics. Create your CV, add your skills, and build a profile that truly reflects who you are." },
  { num: "02", icon: <Sparkles className="w-6 h-6" />, title: "Grow & Prepare", desc: "Level up before you apply. Work on your portfolio, practice interviews, and improve your skills with courses and certifications." },
  { num: "03", icon: <Rocket className="w-6 h-6" />, title: "Discover & Apply", desc: "Find the right opportunities. Explore internships, PFE projects, and jobs tailored to your profile and apply with confidence." },
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
      { threshold: 0.08, rootMargin: "0px 0px -60px 0px" }
    );
    io.observe(el);
  };
}

export default function HowItWorks() {
  const reveal = useReveal();
  return (
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
  );
}
