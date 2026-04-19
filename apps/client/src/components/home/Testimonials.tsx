import "@/styles/home/testimonials.css";

const testimonials = [
  { initials: "YB", name: "Yasmine Ben Ali", role: "Software Engineering Student · ISSAT", text: "I found my PFE placement in under a week. The AI matched me with a project that perfectly fit my React and Node.js skills. I didn't have to search it came to me." },
  { initials: "MA", name: "Mohamed Ayari", role: "Full-Stack Developer · 3 yrs experience", text: "I was transitioning to DevOps and had no idea how to reposition my profile. Glybette restructured my experience and surfaced targeted roles I never would have found alone." },
  { initials: "IC", name: "Ines Chaabane", role: "Data Science Student · EPS", text: "The AI optimized profile made me stand out. Recruiters started reaching out to me directly. Glybette completely changed how I approach job searching." },
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

export default function Testimonials() {
  const reveal = useReveal();
  return (
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
  );
}
