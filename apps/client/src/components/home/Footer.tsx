import "@/styles/home/footer.css";

const cols = [
  { title: "Platform", links: [{ label: "Features", href: "#features" }, { label: "How it works", href: "#how-it-works" }, { label: "Pricing", href: "#pricing" }, { label: "Blog", href: "/blog" }] },
  { title: "Company", links: [{ label: "About", href: "/about" }, { label: "Careers", href: "/careers" }, { label: "Contact", href: "/contact" }, { label: "Partners", href: "/partners" }] },
  { title: "Legal", links: [{ label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }, { label: "Cookies", href: "/cookies" }] },
];

export default function Footer() {
  return (
    <footer className="gb-footer">
      <div className="gb-footer-inner">
        <div className="gb-footer-top">
          <div>
            <a href="/" className="gb-footer-logo">Glybette</a>
            <p className="gb-footer-tagline">The AI career platform connecting talent with opportunity — built for the next generation of professionals.</p>
          </div>
          {cols.map((col) => (
            <div key={col.title} className="gb-footer-col">
              <h4>{col.title}</h4>
              <ul>
                {col.links.map((l) => (
                  <li key={l.label}><a href={l.href}>{l.label}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="gb-footer-bottom">
          <p className="gb-footer-copy">© 2025 Glybette. All rights reserved.</p>
          <p className="gb-footer-made">Made with ♥ in <span>Tunisia</span></p>
        </div>
      </div>
    </footer>
  );
}
