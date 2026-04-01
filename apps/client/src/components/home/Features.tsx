const styles = `
  .gb-features {
    padding: 110px 40px;
    max-width: 1200px;
    margin: 0 auto;
    font-family: 'DM Sans', sans-serif;
  }
  .gb-features-header {
    text-align: center;
    margin-bottom: 64px;
  }
  .gb-features-header h2 {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: clamp(2rem, 4.5vw, 3.6rem);
    font-weight: 800;
    letter-spacing: -0.04em;
    line-height: 1.04;
    margin-bottom: 16px;
    color: var(--gb-text);
  }
  .gb-features-header p {
    color: var(--gb-muted);
    font-size: 1.05rem;
    max-width: 480px;
    margin: 0 auto;
    line-height: 1.7;
    font-weight: 300;
  }

  .gb-feat-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 22px;
    

  }
    
    

  /* ── Hover identique à .gb-step ── */
  .gb-feat {
    background: var(--gb-card-bg);
    border-radius: 16px;
    padding: 48px 34px;
    position: relative;
    overflow: hidden;
    border: 1px solid transparent;
    transition: border-color 0.3s, background 0.3s;
  }
  .gb-feat:hover {
    background: var(--gb-card-hover);
    border-color: rgba(2, 132, 199, 0.28);
  }

  /* Icône — identique à .gb-step-icon */
  .gb-feat-icon {
    width: 64px;
    height: 64px;
    border-radius: 18px;
    background: linear-gradient(135deg, rgba(22,163,74,0.12), rgba(2,132,199,0.12));
    border: 1px solid rgba(22,163,74,0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #16A34A;
    margin-bottom: 26px;
    transition: transform 0.35s, box-shadow 0.35s;
    flex-shrink: 0;
  }
  .gb-feat:hover .gb-feat-icon {
    transform: scale(1.08);
    box-shadow: 0 0 32px rgba(22,163,74,0.2);
  }

  .gb-feat h3 {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 1.05rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--gb-text);
    margin: 0 0 12px 0;
  }
  .gb-feat p {
    font-size: 0.875rem;
    color: var(--gb-muted);
    line-height: 1.75;
    font-weight: 300;
    margin: 0;
  }

  @media (max-width: 1024px) {
    .gb-feat-grid { grid-template-columns: repeat(3, 1fr); }
  }
  @media (max-width: 680px) {
    .gb-features { padding: 80px 20px; }
    .gb-feat-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 420px) {
    .gb-feat-grid { grid-template-columns: 1fr; }
  }
`;

import { Brain, Target, Mic, BarChart3, FolderKanban } from "lucide-react";

const feats = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: "CV Builder",
    desc: "Create a CV that actually gets noticed. Build a clean, professional resume in minutes tailored to your skills, experience, and goals.",
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "Portfolio Builder",
    desc: "Show your work the right way. Create a simple and beautiful portfolio to highlight your projects and stand out to recruiters.",
  },
  {
    icon: <Mic className="w-6 h-6" />,
    title: "Interview Preparation",
    desc: "Keep learning. Keep growing. Access courses and certifications to strengthen your skills and stay competitive in your field.",
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "Courses & Certifications",
    desc: "Explore market trends, salary data, and in-demand skills for your field.",
  },
  {
    icon: <FolderKanban className="w-6 h-6" />,
    title: "Complete Your Studies",
    desc: "Stay on track with your academic journey. Get guidance on your studies, PFE, and next steps — all in one place.",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Career Trends & Insights",
    desc: "Understand where your field is going. Explore in-demand skills, job trends, and opportunities across different industries.",
  },
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

export default function Features() {
  const reveal = useReveal();
  return (
    <>
      <style>{styles}</style>
      <section id="features">
        <div className="gb-features" ref={reveal}>
          <div className="gb-features-header">
            <div className="gb-sec-label">Core Ecosystem</div>
            <h2>
              Everything you need to
              <br />
              launch your career
            </h2>
            <p>Forget scattered tools and endless searching.</p>
            <p>
              Glybette brings everything together into one smart platform built
              for students and professionals.
            </p>
          </div>

          <div className="gb-feat-grid">
            {feats.map((f) => (
              <div key={f.title} className="gb-feat">
                <div className="gb-feat-icon">{f.icon}</div>
                <div>
                  <h3>{f.title}</h3>
                  <p style={{ marginTop: "8px" }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}