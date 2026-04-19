import "@/styles/home/logo-strip.css";

const companies = ["Vermeg", "Telnet", "Sofrecom", "EPS", "ISSATSOUSSE"];

export default function LogoStrip() {
  return (
    <div className="gb-strip">
      <p className="gb-strip-label">Trusted by companies across Tunisia</p>
      <div className="gb-strip-row">
        {companies.map((c) => (
          <span key={c} className="gb-chip">{c}</span>
        ))}
      </div>
    </div>
  );
}
