import "@/styles/home/cta.css";

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
            { threshold: 0.1, rootMargin: "0px 0px -60px 0px" },
        );
        io.observe(el);
    };
}

export default function CTA() {
    const reveal = useReveal();
    return (
        <div className="gb-cta-wrap" ref={reveal}>
            <div className="gb-cta-box">
                <div className="gb-cta-deco-1" />
                <div className="gb-cta-deco-2" />
                <h2>
                    Ready to start
                    <br />
                    your journey?
                </h2>
                <p>
                    Join thousands of students and professionals using Glybette to find their next career defining
                    opportunity.
                </p>
                <div className="gb-cta-actions">
                    <a href="/onboarding" className="gb-cta-primary">
                        Create My Free Profile <span className="gb-arr">→</span>
                    </a>
                    <a href="#features" className="gb-cta-secondary">
                        See Features
                    </a>
                </div>
                <p className="gb-cta-note">Free to start · No credit card · Takes 2 minutes</p>
            </div>
        </div>
    );
}
