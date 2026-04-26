import "@/styles/home/hero.css";
import {
  Sparkles,
  Target,
  Briefcase,
  Zap,
  ArrowRight,
  ArrowDown,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="gb-hero">
      <div className="gb-orb gb-orb-1" />
      <div className="gb-orb gb-orb-2" />
      <div className="gb-orb gb-orb-3" />
      <div className="gb-hero-grid" />
      <div className="gb-hero-inner">
        <div className="gb-hero-badge">
          <div className="gb-badge-dot">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          Smart Career Platform · Tunisia &amp; Beyond
        </div>
        <h1>
          Your Career,<br />
          <span className="grad">finally moving</span><br />
          <span className="text-stroke">forward.</span>
        </h1>
        <h3>Stop guessing. Start matching.</h3>
        <p className="gb-hero-sub">
          Glybette A smart ecosystem designed to unite talent, opportunity, and innovation
          helping you grow, build, and succeed.
        </p>
        <div className="gb-hero-cta">
          <a href="/onboarding" className="gb-btn-primary">
            Build My Profile <ArrowRight className="w-4 h-4 inline ml-1" />
          </a>
          <a href="#features" className="gb-btn-secondary">
            Explore Features <ArrowDown className="w-4 h-4 inline ml-1" />
          </a>
        </div>
        <div className="gb-hero-cards">
          <div className="gb-hcard">
            <div className="gb-hcard-icon green">
              <Target className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <div className="gb-hcard-label">97% Accuracy</div>
              <div className="gb-hcard-value">Real matches</div>
            </div>
          </div>
          <div className="gb-hcard">
            <div className="gb-hcard-icon blue">
              <Briefcase className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="gb-hcard-label">500+ Opportunities</div>
              <div className="gb-hcard-value">Updated daily</div>
            </div>
          </div>
          <div className="gb-hcard">
            <div className="gb-hcard-icon purp">
              <Zap className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <div className="gb-hcard-label">Fast Matching</div>
              <div className="gb-hcard-value">Tailored to you</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
