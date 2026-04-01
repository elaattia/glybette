const styles = `
  .gb-footer {
    border-top: 1px solid var(--gb-border);
    padding: 68px 40px 44px;
    background: var(--gb-footer-bg);
    font-family: 'DM Sans', sans-serif;
    transition: background 0.35s, border-color 0.35s;
  }
  .gb-footer-inner { max-width: 1200px; margin: 0 auto; }
  .gb-footer-top { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 44px; margin-bottom: 52px; }
  .gb-footer-logo {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 1.5rem; font-weight: 800; letter-spacing: -0.025em;
    background: linear-gradient(90deg, #16A34A, #0284C7);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text; text-decoration: none;
    display: block; margin-bottom: 14px;
  }
  .gb-footer-tagline { font-size: 0.875rem; color: var(--gb-muted); line-height: 1.7; max-width: 240px; font-weight: 300; }
  .gb-footer-col h4 { font-size: 0.73rem; font-weight: 700; letter-spacing: 0.11em; text-transform: uppercase; color: var(--gb-text); margin-bottom: 20px; }
  .gb-footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 13px; }
  .gb-footer-col ul a { font-size: 0.875rem; color: var(--gb-muted); text-decoration: none; font-weight: 300; transition: color 0.2s; }
  .gb-footer-col ul a:hover { color: var(--gb-text); }
  .gb-footer-bottom {
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 16px;
    padding-top: 34px; border-top: 1px solid var(--gb-border);
  }
  .gb-footer-copy { font-size: 0.8rem; color: var(--gb-muted2); font-weight: 300; }
  .gb-footer-made { font-size: 0.8rem; color: var(--gb-muted2); font-weight: 300; }
  .gb-footer-made span {
    background: linear-gradient(90deg, #16A34A, #0284C7);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text; font-weight: 700;
  }
  @media (max-width: 900px) { .gb-footer { padding: 52px 20px 36px; } .gb-footer-top { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 500px) { .gb-footer-top { grid-template-columns: 1fr; } }
`;

const cols = [
  { title:"Platform", links:[{ label:"Features", href:"#features" },{ label:"How it works", href:"#how-it-works" },{ label:"Pricing", href:"#pricing" },{ label:"Blog", href:"/blog" }] },
  { title:"Company",  links:[{ label:"About", href:"/about" },{ label:"Careers", href:"/careers" },{ label:"Contact", href:"/contact" },{ label:"Partners", href:"/partners" }] },
  { title:"Legal",    links:[{ label:"Privacy", href:"/privacy" },{ label:"Terms", href:"/terms" },{ label:"Cookies", href:"/cookies" }] },
];

export default function Footer() {
  return (
    <>
      <style>{styles}</style>
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
    </>
  );
}