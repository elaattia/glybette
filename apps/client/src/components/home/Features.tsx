import "@/styles/home/features.css";
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
                <p className="gb-feat-desc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
