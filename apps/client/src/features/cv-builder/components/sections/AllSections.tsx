import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Globe, Award, FolderKanban, ChevronDown, Search, Calendar, MapPin } from "lucide-react";
import { AiEnhanceButton } from "../ai/AiEnhanceButton";
import type {
  PersonalInfoData, ExperienceItem, EducationItem,
  SkillGroup, ProjectItem, LanguageItem, CertificationItem,
} from "../../types/cv.types";


export const inputCss: React.CSSProperties = {
  width: "100%",
  background: "var(--gb-app-hover)",
  border: "1.5px solid var(--gb-border)",
  borderRadius: "10px",
  padding: "9px 12px",
  fontSize: "13px",
  color: "var(--gb-text)",
  outline: "none",
  fontFamily: "inherit",
  transition: "border-color 0.18s",
  boxSizing: "border-box" as const,
};

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{ ...inputCss, ...(props.style ?? {}) }}
      onFocus={(e) => { e.currentTarget.style.borderColor = "#16A34A"; props.onFocus?.(e); }}
      onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--gb-border)"; props.onBlur?.(e); }}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{ ...inputCss, minHeight: "76px", resize: "vertical", ...(props.style ?? {}) }}
      onFocus={(e) => e.currentTarget.style.borderColor = "#16A34A"}
      onBlur={(e)  => e.currentTarget.style.borderColor = "var(--gb-border)"}
    />
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label style={{
      display: "block", fontSize: "11px", fontWeight: 600,
      color: "var(--gb-muted)", textTransform: "uppercase",
      letterSpacing: "0.06em", marginBottom: "5px",
    }}>
      {children}
    </label>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

const grid2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" };
const grid3: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" };

const itemBox: React.CSSProperties = {
  background: "var(--gb-app-hover)",
  border: "1px solid var(--gb-border)",
  borderRadius: "12px",
  padding: "14px",
  marginBottom: "10px",
};

const addBtn: React.CSSProperties = {
  width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
  background: "transparent", border: "1.5px dashed var(--gb-border2)",
  borderRadius: "10px", padding: "9px",
  color: "var(--gb-muted)", fontSize: "13px", fontWeight: 500, cursor: "pointer",
  transition: "border-color 0.15s, color 0.15s",
};

const delBtn: React.CSSProperties = {
  background: "transparent", border: "1px solid rgba(220,38,38,0.2)",
  borderRadius: "7px", padding: "4px 6px",
  color: "#dc2626", cursor: "pointer", display: "flex", flexShrink: 0,
};

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      style={addBtn}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(22,163,74,0.4)"; e.currentTarget.style.color = "#16A34A"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--gb-border2)"; e.currentTarget.style.color = "var(--gb-muted)"; }}
      onClick={onClick}
    >
      <Plus style={{ width: 14, height: 14 }} /> {label}
    </button>
  );
}


const MONTHS_FR = ["Janv.", "Févr.", "Mars", "Avr.", "Mai", "Juin", "Juil.", "Août", "Sept.", "Oct.", "Nov.", "Déc."];
const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface DatePickerProps {
  value:        string;
  onChange:     (val: string) => void;
  placeholder?: string;
  disabled?:    boolean;
  showDay?:     boolean; 
}

function DatePicker({ value, onChange, placeholder = "Mois AAAA", disabled, showDay = false }: DatePickerProps) {
  const [open,        setOpen]        = useState(false);
  const [displayYear, setDisplayYear] = useState(() => {
    if (!value) return new Date().getFullYear();
    const parts = value.split(" ");
    const y = parseInt(parts[parts.length - 1]);
    return isNaN(y) ? new Date().getFullYear() : y;
  });
  const [selectedDay, setSelectedDay] = useState<number | null>(() => {
    if (!value || !showDay) return null;
    const d = parseInt(value.split("/")[0]);
    return isNaN(d) ? null : d;
  });
  const ref = useRef<HTMLDivElement>(null);

  const currentMonthIdx = (() => {
    if (!value) return -1;
    for (let i = 0; i < MONTHS_FR.length; i++) {
      if (value.toLowerCase().includes(MONTHS_FR[i].toLowerCase().slice(0, 3))) return i;
      if (value.toLowerCase().includes(MONTHS_EN[i].toLowerCase())) return i;
    }
    return -1;
  })();
  const currentYear = (() => {
    const parts = value?.split(" ") ?? [];
    const y = parseInt(parts[parts.length - 1]);
    return isNaN(y) ? null : y;
  })();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (monthIdx: number) => {
    if (showDay && selectedDay) {
      onChange(`${String(selectedDay).padStart(2, "0")}/${String(monthIdx + 1).padStart(2, "0")}/${displayYear}`);
    } else {
      onChange(`${MONTHS_FR[monthIdx]} ${displayYear}`);
    }
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSelectedDay(null);
  };

  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        style={{
          ...inputCss,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          borderColor: open ? "#16A34A" : "var(--gb-border)",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Calendar style={{ width: 13, height: 13, color: "var(--gb-muted)", flexShrink: 0 }} />
          <span style={{ color: value ? "var(--gb-text)" : "var(--gb-muted)", fontSize: "13px" }}>
            {value || placeholder}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {value && (
            <span onClick={handleClear} style={{ fontSize: "15px", color: "var(--gb-muted)", cursor: "pointer", lineHeight: 1, padding: "0 2px" }}>×</span>
          )}
          <ChevronDown style={{ width: 13, height: 13, color: "var(--gb-muted)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
        </div>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 100,
          background: "var(--gb-surface)", border: "1px solid var(--gb-border)",
          borderRadius: "14px", boxShadow: "0 12px 36px rgba(0,0,0,0.22)",
          padding: "14px", minWidth: "240px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <button type="button" onClick={() => setDisplayYear(y => y - 1)} style={{ background: "var(--gb-app-hover)", border: "none", borderRadius: "8px", padding: "5px 10px", cursor: "pointer", color: "var(--gb-text)", fontSize: "14px", fontWeight: 600 }}>←</button>
            <span style={{ fontWeight: 700, fontSize: "15px", color: "var(--gb-text)" }}>{displayYear}</span>
            <button type="button" onClick={() => setDisplayYear(y => y + 1)} style={{ background: "var(--gb-app-hover)", border: "none", borderRadius: "8px", padding: "5px 10px", cursor: "pointer", color: "var(--gb-text)", fontSize: "14px", fontWeight: 600 }}>→</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "4px" }}>
            {MONTHS_FR.map((m, idx) => {
              const isSelected = idx === currentMonthIdx && displayYear === currentYear;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleSelect(idx)}
                  style={{
                    background:  isSelected ? "#16A34A" : "var(--gb-app-hover)",
                    color:       isSelected ? "#fff" : "var(--gb-text)",
                    border:      "none", borderRadius: "8px",
                    padding:     "7px 4px", fontSize: "11.5px",
                    fontWeight:  isSelected ? 700 : 400,
                    cursor:      "pointer", transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "rgba(22,163,74,0.12)"; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "var(--gb-app-hover)"; }}
                >
                  {m}
                </button>
              );
            })}
          </div>

          {showDay && currentMonthIdx >= 0 && (
            <div style={{ marginTop: "10px", borderTop: "1px solid var(--gb-border)", paddingTop: "10px" }}>
              <p style={{ fontSize: "10px", color: "var(--gb-muted)", margin: "0 0 6px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Jour</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
                {Array.from({ length: daysInMonth(currentMonthIdx, displayYear) }, (_, i) => i + 1).map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      setSelectedDay(day);
                      onChange(`${String(day).padStart(2, "0")}/${String(currentMonthIdx + 1).padStart(2, "0")}/${displayYear}`);
                      setOpen(false);
                    }}
                    style={{
                      background: selectedDay === day ? "#16A34A" : "var(--gb-app-hover)",
                      color:      selectedDay === day ? "#fff" : "var(--gb-text)",
                      border:     "none", borderRadius: "5px",
                      padding:    "4px 2px", fontSize: "10px",
                      cursor:     "pointer",
                    }}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


const COUNTRIES_CITIES: Record<string, string[]> = {
  "Tunisie":              ["Tunis", "Sfax", "Sousse", "Monastir", "Bizerte", "Gabès", "Kairouan", "Nabeul", "Ariana", "Ben Arous", "Gafsa", "Tozeur", "Médenine", "Beja", "Jendouba", "Mahdia", "Kasserine", "Sidi Bouzid", "Tataouine", "Kebili", "Le Kef", "Zaghouan"],
  "France":               ["Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille", "Rennes", "Grenoble", "Dijon", "Angers", "Nîmes", "Toulon", "Saint-Étienne", "Reims", "Le Havre", "Villeurbanne"],
  "Maroc":                ["Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir", "Meknès", "Oujda", "Kénitra", "Tétouan", "Salé", "Nador", "Béni Mellal"],
  "Algérie":              ["Alger", "Oran", "Constantine", "Annaba", "Blida", "Batna", "Djelfa", "Sétif", "Biskra", "Tébessa", "Sidi Bel Abbès"],
  "Belgique":             ["Bruxelles", "Anvers", "Gand", "Charleroi", "Liège", "Bruges", "Namur", "Leuven", "Mons"],
  "Suisse":               ["Zurich", "Genève", "Bâle", "Berne", "Lausanne", "Winterthur", "Lucerne", "Lugano"],
  "Canada":               ["Montréal", "Toronto", "Vancouver", "Calgary", "Ottawa", "Québec", "Edmonton", "Winnipeg"],
  "Allemagne":            ["Berlin", "Munich", "Hambourg", "Cologne", "Francfort", "Stuttgart", "Düsseldorf", "Leipzig"],
  "Espagne":              ["Madrid", "Barcelone", "Valence", "Séville", "Saragosse", "Malaga", "Bilbao"],
  "Italie":               ["Rome", "Milan", "Naples", "Turin", "Palerme", "Gênes", "Bologne", "Florence"],
  "Royaume-Uni":          ["Londres", "Manchester", "Birmingham", "Glasgow", "Leeds", "Liverpool", "Edinburgh"],
  "États-Unis":           ["New York", "Los Angeles", "Chicago", "Houston", "San Francisco", "Seattle", "Boston", "Miami", "Washington DC"],
  "Émirats Arabes Unis":  ["Dubaï", "Abu Dhabi", "Sharjah", "Ajman"],
  "Arabie Saoudite":      ["Riyad", "Djeddah", "La Mecque", "Médine", "Dammam"],
  "Qatar":                ["Doha", "Al Wakrah", "Lusail"],
  "Égypte":               ["Le Caire", "Alexandrie", "Gizeh", "Port-Saïd", "Louxor"],
  "Pays-Bas":             ["Amsterdam", "Rotterdam", "La Haye", "Utrecht", "Eindhoven"],
  "Portugal":             ["Lisbonne", "Porto", "Braga", "Coimbra", "Faro"],
  "Suède":                ["Stockholm", "Göteborg", "Malmö", "Uppsala"],
  "Norvège":              ["Oslo", "Bergen", "Trondheim", "Stavanger"],
  "Danemark":             ["Copenhague", "Aarhus", "Odense"],
  "Finlande":             ["Helsinki", "Espoo", "Tampere"],
  "Irlande":              ["Dublin", "Cork", "Galway", "Limerick"],
  "Australie":            ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"],
  "Singapour":            ["Singapour"],
  "Japon":                ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Nagoya"],
};

const ALL_COUNTRIES = Object.keys(COUNTRIES_CITIES).sort();

interface LocationPickerProps {
  value:    string;
  onChange: (val: string) => void;
}

function LocationPicker({ value, onChange }: LocationPickerProps) {
  const detectCountry = () => {
    for (const c of ALL_COUNTRIES) {
      if (value && value.includes(c)) return c;
    }
    return "";
  };
  const detectCity = (country: string) => {
    if (!country || !value) return "";
    const cities = COUNTRIES_CITIES[country] ?? [];
    return cities.find((c) => value.includes(c)) ?? "";
  };

  const [country, setCountry]           = useState(detectCountry);
  const [city,    setCity]              = useState(() => detectCity(detectCountry()));
  const [address, setAddress]           = useState("");
  const [countryOpen, setCountryOpen]   = useState(false);
  const [cityOpen,    setCityOpen]      = useState(false);
  const [search,      setSearch]        = useState("");
  const countryRef = useRef<HTMLDivElement>(null);
  const cityRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) setCountryOpen(false);
      if (cityRef.current    && !cityRef.current.contains(e.target as Node))    setCityOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const buildValue = (c: string, ci: string, addr: string) => {
    const parts = [ci, c, addr].filter(Boolean);
    onChange(parts.join(", "));
  };

  const handleCountrySelect = (c: string) => {
    setCountry(c); setCity(""); setCountryOpen(false); setSearch("");
    buildValue(c, "", address);
  };

  const handleCitySelect = (c: string) => {
    setCity(c); setCityOpen(false);
    buildValue(country, c, address);
  };

  const filtered = ALL_COUNTRIES.filter((c) => c.toLowerCase().includes(search.toLowerCase()));
  const cities   = country ? COUNTRIES_CITIES[country] ?? [] : [];

  const dropdownStyle: React.CSSProperties = {
    position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 100,
    background: "var(--gb-surface)", border: "1px solid var(--gb-border)",
    borderRadius: "12px", boxShadow: "0 12px 36px rgba(0,0,0,0.2)",
    maxHeight: "220px", display: "flex", flexDirection: "column",
  };

  const optionBtn = (selected: boolean): React.CSSProperties => ({
    width: "100%", textAlign: "left", padding: "7px 10px",
    background: selected ? "rgba(22,163,74,0.1)" : "transparent",
    color: selected ? "#16A34A" : "var(--gb-text)",
    border: "none", borderRadius: "7px", cursor: "pointer",
    fontSize: "12.5px", fontWeight: selected ? 600 : 400,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div ref={countryRef} style={{ position: "relative" }}>
        <button type="button" onClick={() => { setCountryOpen(o => !o); setSearch(""); }}
          style={{ ...inputCss, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left", borderColor: countryOpen ? "#16A34A" : "var(--gb-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <MapPin style={{ width: 13, height: 13, color: "var(--gb-muted)", flexShrink: 0 }} />
            <span style={{ color: country ? "var(--gb-text)" : "var(--gb-muted)", fontSize: "13px" }}>{country || "Sélectionner un pays"}</span>
          </div>
          <ChevronDown style={{ width: 13, height: 13, color: "var(--gb-muted)", transform: countryOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
        </button>
        {countryOpen && (
          <div style={dropdownStyle}>
            <div style={{ padding: "8px", borderBottom: "1px solid var(--gb-border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "7px", background: "var(--gb-app-hover)", borderRadius: "8px", padding: "6px 10px" }}>
                <Search style={{ width: 12, height: 12, color: "var(--gb-muted)", flexShrink: 0 }} />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un pays…"
                  style={{ background: "none", border: "none", outline: "none", fontSize: "12px", color: "var(--gb-text)", width: "100%" }} autoFocus />
              </div>
            </div>
            <div style={{ overflowY: "auto", padding: "4px" }}>
              {filtered.map((c) => (
                <button key={c} type="button" onClick={() => handleCountrySelect(c)}
                  style={optionBtn(country === c)}
                  onMouseEnter={(e) => { if (country !== c) e.currentTarget.style.background = "var(--gb-app-hover)"; }}
                  onMouseLeave={(e) => { if (country !== c) e.currentTarget.style.background = "transparent"; }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {country && cities.length > 0 && (
        <div ref={cityRef} style={{ position: "relative" }}>
          <button type="button" onClick={() => setCityOpen(o => !o)}
            style={{ ...inputCss, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left", borderColor: cityOpen ? "#16A34A" : "var(--gb-border)" }}>
            <span style={{ color: city ? "var(--gb-text)" : "var(--gb-muted)", fontSize: "13px" }}>{city || "Sélectionner une ville"}</span>
            <ChevronDown style={{ width: 13, height: 13, color: "var(--gb-muted)", transform: cityOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </button>
          {cityOpen && (
            <div style={{ ...dropdownStyle, maxHeight: "200px", flexDirection: "column" }}>
              <div style={{ overflowY: "auto", padding: "4px" }}>
                {cities.map((c) => (
                  <button key={c} type="button" onClick={() => handleCitySelect(c)}
                    style={optionBtn(city === c)}
                    onMouseEnter={(e) => { if (city !== c) e.currentTarget.style.background = "var(--gb-app-hover)"; }}
                    onMouseLeave={(e) => { if (city !== c) e.currentTarget.style.background = "transparent"; }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Input value={address} placeholder="Adresse complète (optionnel)"
        onChange={(e) => { setAddress(e.target.value); buildValue(country, city, e.target.value); }} />
    </div>
  );
}


const LANGUAGES_LIST = [
  "Arabe", "Français", "Anglais", "Allemand", "Espagnol", "Italien",
  "Portugais", "Chinois (Mandarin)", "Japonais", "Coréen", "Russe",
  "Turc", "Persan", "Hindi", "Bengali", "Néerlandais", "Polonais",
  "Suédois", "Norvégien", "Danois", "Finnois", "Grec", "Tchèque",
  "Hongrois", "Roumain", "Ukrainien", "Hébreu", "Thaï", "Vietnamien",
  "Indonésien", "Malaisien", "Swahili",
];

function LanguagePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState("");
  const ref                 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = LANGUAGES_LIST.filter((l) => l.toLowerCase().includes(search.toLowerCase()));

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button type="button" onClick={() => { setOpen(o => !o); setSearch(""); }}
        style={{ ...inputCss, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left", borderColor: open ? "#16A34A" : "var(--gb-border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Globe style={{ width: 13, height: 13, color: "var(--gb-muted)", flexShrink: 0 }} />
          <span style={{ color: value ? "var(--gb-text)" : "var(--gb-muted)", fontSize: "13px" }}>{value || "Sélectionner une langue"}</span>
        </div>
        <ChevronDown style={{ width: 13, height: 13, color: "var(--gb-muted)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 100, background: "var(--gb-surface)", border: "1px solid var(--gb-border)", borderRadius: "12px", boxShadow: "0 12px 36px rgba(0,0,0,0.2)", maxHeight: "240px", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "8px", borderBottom: "1px solid var(--gb-border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", background: "var(--gb-app-hover)", borderRadius: "8px", padding: "6px 10px" }}>
              <Search style={{ width: 12, height: 12, color: "var(--gb-muted)", flexShrink: 0 }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher une langue…"
                style={{ background: "none", border: "none", outline: "none", fontSize: "12px", color: "var(--gb-text)", width: "100%" }} autoFocus />
            </div>
          </div>
          <div style={{ overflowY: "auto", padding: "4px" }}>
            {filtered.map((l) => (
              <button key={l} type="button" onClick={() => { onChange(l); setOpen(false); }}
                style={{ width: "100%", textAlign: "left", padding: "7px 10px", background: value === l ? "rgba(22,163,74,0.1)" : "transparent", color: value === l ? "#16A34A" : "var(--gb-text)", border: "none", borderRadius: "7px", cursor: "pointer", fontSize: "12.5px", fontWeight: value === l ? 600 : 400 }}
                onMouseEnter={(e) => { if (value !== l) e.currentTarget.style.background = "var(--gb-app-hover)"; }}
                onMouseLeave={(e) => { if (value !== l) e.currentTarget.style.background = "transparent"; }}>
                {l}
              </button>
            ))}
            {search && !LANGUAGES_LIST.includes(search) && (
              <button type="button" onClick={() => { onChange(search); setOpen(false); }}
                style={{ width: "100%", textAlign: "left", padding: "7px 10px", background: "rgba(22,163,74,0.06)", color: "#16A34A", border: "none", borderRadius: "7px", cursor: "pointer", fontSize: "12.5px", fontWeight: 500 }}>
                + Ajouter "{search}"
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


interface PersonalInfoProps {
  data:     PersonalInfoData;
  onChange: (d: PersonalInfoData) => void;
}

export function PersonalInfoSection({ data, onChange }: PersonalInfoProps) {
  const set = (k: keyof PersonalInfoData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...data, [k]: e.target.value });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
      <div style={grid2}>
        <Field label="Prénom"><Input placeholder="Alex" value={data.firstName} onChange={set("firstName")} /></Field>
        <Field label="Nom"><Input placeholder="Johnson" value={data.lastName} onChange={set("lastName")} /></Field>
      </div>
      <Field label="Titre / Poste visé">
        <Input placeholder="Product Designer" value={data.roleTitle} onChange={set("roleTitle")} />
      </Field>
      <div style={grid2}>
        <Field label="Email"><Input type="email" placeholder="alex@example.com" value={data.email} onChange={set("email")} /></Field>
        <Field label="Téléphone"><Input placeholder="+216 XX XXX XXX" value={data.phone} onChange={set("phone")} /></Field>
      </div>
      <Field label="Localisation">
        <LocationPicker value={data.location} onChange={(val) => onChange({ ...data, location: val })} />
      </Field>
      <div style={grid2}>
        <Field label="LinkedIn"><Input placeholder="linkedin.com/in/alex" value={data.linkedin} onChange={set("linkedin")} /></Field>
        <Field label="GitHub"><Input placeholder="github.com/alex" value={data.github} onChange={set("github")} /></Field>
      </div>
      <Field label="Site web / Portfolio">
        <Input placeholder="alexjohnson.dev" value={data.portfolio} onChange={set("portfolio")} />
      </Field>
    </div>
  );
}


interface SummaryProps {
  data:         { text: string };
  onChange:     (d: { text: string }) => void;
  onAiEnhance?: () => void;
  isEnhancing?: boolean;
}

export function SummarySection({ data, onChange, onAiEnhance, isEnhancing }: SummaryProps) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "7px" }}>
        <Label>Résumé professionnel</Label>
        {onAiEnhance && <AiEnhanceButton onClick={onAiEnhance} isLoading={isEnhancing} disabled={!data.text.trim()} />}
      </div>
      <Textarea rows={4} placeholder="Résultats-orienté avec 5+ ans d'expérience en..."
        value={data.text} onChange={(e) => onChange({ text: e.target.value })} />
    </div>
  );
}


interface ExperienceProps {
  data:          ExperienceItem[];
  onChange:      (d: ExperienceItem[]) => void;
  enhancingKey?: string | null;
  onAiEnhance?:  (itemId: string, currentText: string) => void;
}

export function ExperienceSection({ data, onChange, enhancingKey, onAiEnhance }: ExperienceProps) {
  const add = () => onChange([...data, { id: crypto.randomUUID(), company: "", position: "", startDate: "", endDate: "", current: false, location: "", description: "", highlights: [] }]);
  const upd = (id: string, k: keyof ExperienceItem, v: unknown) => onChange(data.map((i) => i.id === id ? { ...i, [k]: v } : i));
  const del = (id: string) => onChange(data.filter((i) => i.id !== id));

  return (
    <div>
      {data.map((item, idx) => (
        <div key={item.id} style={itemBox}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "11px" }}>
            <span style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--gb-muted)" }}>Position {idx + 1}</span>
            <button style={delBtn} onClick={() => del(item.id)}><Trash2 style={{ width: 13, height: 13 }} /></button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
            <div style={grid2}>
              <Field label="Poste"><Input value={item.position} placeholder="Senior Developer" onChange={(e) => upd(item.id, "position", e.target.value)} /></Field>
              <Field label="Entreprise"><Input value={item.company} placeholder="TechCorp" onChange={(e) => upd(item.id, "company", e.target.value)} /></Field>
            </div>
            <div style={grid3}>
              <Field label="Début">
                <DatePicker value={item.startDate} onChange={(v) => upd(item.id, "startDate", v)} placeholder="Mois Année" />
              </Field>
              <Field label="Fin">
                <DatePicker value={item.endDate} onChange={(v) => upd(item.id, "endDate", v)} placeholder="Mois Année" disabled={item.current} />
              </Field>
              <Field label="En poste">
                <div style={{ display: "flex", alignItems: "center", height: "38px", gap: "7px" }}>
                  <input type="checkbox" checked={item.current} onChange={(e) => upd(item.id, "current", e.target.checked)} style={{ accentColor: "#16A34A", width: 16, height: 16, cursor: "pointer" }} />
                  <span style={{ fontSize: "12px", color: "var(--gb-text-off)" }}>Actuel</span>
                </div>
              </Field>
            </div>
            <Field label="Localisation">
              <LocationPicker value={item.location} onChange={(v) => upd(item.id, "location", v)} />
            </Field>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                <Label>Description</Label>
                {onAiEnhance && (
                  <AiEnhanceButton onClick={() => onAiEnhance(item.id, item.description)} isLoading={enhancingKey === `exp-${item.id}`} disabled={!item.description.trim()} label="Améliorer" />
                )}
              </div>
              <Textarea value={item.description} placeholder="Décrivez vos responsabilités et résultats avec des métriques..." onChange={(e) => upd(item.id, "description", e.target.value)} />
            </div>
          </div>
        </div>
      ))}
      <AddButton label="Ajouter une position" onClick={add} />
    </div>
  );
}


export function EducationSection({ data, onChange }: { data: EducationItem[]; onChange: (d: EducationItem[]) => void }) {
  const add = () => onChange([...data, { id: crypto.randomUUID(), institution: "", degree: "", field: "", startDate: "", endDate: "", current: false, gpa: "", description: "" }]);
  const upd = (id: string, k: keyof EducationItem, v: unknown) => onChange(data.map((i) => i.id === id ? { ...i, [k]: v } : i));
  const del = (id: string) => onChange(data.filter((i) => i.id !== id));

  return (
    <div>
      {data.map((item, idx) => (
        <div key={item.id} style={itemBox}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "11px" }}>
            <span style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--gb-muted)" }}>Formation {idx + 1}</span>
            <button style={delBtn} onClick={() => del(item.id)}><Trash2 style={{ width: 13, height: 13 }} /></button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
            <Field label="Établissement"><Input value={item.institution} placeholder="Université de Tunis" onChange={(e) => upd(item.id, "institution", e.target.value)} /></Field>
            <div style={grid2}>
              <Field label="Diplôme"><Input value={item.degree} placeholder="Master / Licence" onChange={(e) => upd(item.id, "degree", e.target.value)} /></Field>
              <Field label="Spécialité"><Input value={item.field} placeholder="Informatique" onChange={(e) => upd(item.id, "field", e.target.value)} /></Field>
            </div>
            <div style={grid2}>
              <Field label="Début"><DatePicker value={item.startDate} onChange={(v) => upd(item.id, "startDate", v)} /></Field>
              <Field label="Obtention"><DatePicker value={item.endDate} onChange={(v) => upd(item.id, "endDate", v)} /></Field>
            </div>
            <Field label="Mention / GPA (optionnel)"><Input value={item.gpa} placeholder="Très bien / 16.5/20" onChange={(e) => upd(item.id, "gpa", e.target.value)} /></Field>
          </div>
        </div>
      ))}
      <AddButton label="Ajouter une formation" onClick={add} />
    </div>
  );
}


export function SkillsSection({ data, onChange }: { data: SkillGroup[]; onChange: (d: SkillGroup[]) => void }) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const addGroup    = () => onChange([...data, { id: crypto.randomUUID(), category: "", skills: [] }]);
  const updCategory = (id: string, v: string) => onChange(data.map((g) => g.id === id ? { ...g, category: v } : g));
  const addSkill    = (groupId: string) => {
    const skill = inputs[groupId]?.trim();
    if (!skill) return;
    onChange(data.map((g) => g.id === groupId ? { ...g, skills: [...g.skills, skill] } : g));
    setInputs((p) => ({ ...p, [groupId]: "" }));
  };
  const removeSkill = (groupId: string, skill: string) => onChange(data.map((g) => g.id === groupId ? { ...g, skills: g.skills.filter((s) => s !== skill) } : g));
  const removeGroup = (id: string) => onChange(data.filter((g) => g.id !== id));

  return (
    <div>
      {data.map((group) => (
        <div key={group.id} style={itemBox}>
          <div style={{ display: "flex", gap: "7px", alignItems: "center", marginBottom: "9px" }}>
            <Input value={group.category} placeholder="Catégorie (ex: Frontend, DevOps…)" onChange={(e) => updCategory(group.id, e.target.value)} style={{ flex: 1 }} />
            <button style={delBtn} onClick={() => removeGroup(group.id)}><Trash2 style={{ width: 13, height: 13 }} /></button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "7px" }}>
            {group.skills.map((skill) => (
              <span key={skill} style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "var(--gb-surface)", border: "1px solid var(--gb-border)", borderRadius: "99px", padding: "3px 9px", fontSize: "12px", color: "var(--gb-text-off)" }}>
                {skill}
                <button onClick={() => removeSkill(group.id, skill)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gb-muted)", padding: 0, lineHeight: 1, fontSize: "14px", display: "flex", alignItems: "center" }}>×</button>
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <Input value={inputs[group.id] ?? ""} placeholder="Ajouter… (Entrée pour valider)" onChange={(e) => setInputs((p) => ({ ...p, [group.id]: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(group.id); } }} style={{ flex: 1, fontSize: "12px" }} />
            <button onClick={() => addSkill(group.id)} style={{ background: "var(--gb-surface)", border: "1px solid var(--gb-border)", borderRadius: "9px", padding: "0 12px", cursor: "pointer", color: "var(--gb-text-off)", fontSize: "12px", flexShrink: 0 }}>+ Add</button>
          </div>
        </div>
      ))}
      <AddButton label="Ajouter une catégorie" onClick={addGroup} />
    </div>
  );
}


export function ProjectsSection({ data, onChange }: { data: ProjectItem[]; onChange: (d: ProjectItem[]) => void }) {
  const [techInputs, setTechInputs] = useState<Record<string, string>>({});
  const add = () => onChange([...data, { id: crypto.randomUUID(), name: "", description: "", technologies: [], url: "", github: "" }]);
  const upd = (id: string, k: keyof ProjectItem, v: unknown) => onChange(data.map((i) => i.id === id ? { ...i, [k]: v } : i));
  const del = (id: string) => onChange(data.filter((i) => i.id !== id));
  const addTech = (id: string) => {
    const tech = techInputs[id]?.trim();
    if (!tech) return;
    const item = data.find((i) => i.id === id);
    if (!item) return;
    upd(id, "technologies", [...item.technologies, tech]);
    setTechInputs((p) => ({ ...p, [id]: "" }));
  };
  const removeTech = (id: string, tech: string) => {
    const item = data.find((i) => i.id === id);
    if (!item) return;
    upd(id, "technologies", item.technologies.filter((t) => t !== tech));
  };

  return (
    <div>
      {data.map((item, idx) => (
        <div key={item.id} style={itemBox}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "11px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <FolderKanban style={{ width: 13, height: 13, color: "#16A34A" }} />
              <span style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--gb-muted)" }}>Projet {idx + 1}</span>
            </div>
            <button style={delBtn} onClick={() => del(item.id)}><Trash2 style={{ width: 13, height: 13 }} /></button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
            <Field label="Nom du projet"><Input value={item.name} placeholder="Nom du projet" onChange={(e) => upd(item.id, "name", e.target.value)} /></Field>
            <Field label="Description"><Textarea value={item.description} placeholder="Décrivez le projet, son impact et vos contributions…" onChange={(e) => upd(item.id, "description", e.target.value)} /></Field>
            <div style={grid2}>
              <Field label="URL"><Input value={item.url} placeholder="https://example.com" onChange={(e) => upd(item.id, "url", e.target.value)} /></Field>
              <Field label="GitHub"><Input value={item.github} placeholder="github.com/user/repo" onChange={(e) => upd(item.id, "github", e.target.value)} /></Field>
            </div>
            <div>
              <Label>Technologies</Label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "7px" }}>
                {item.technologies.map((tech) => (
                  <span key={tech} style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "rgba(2,132,199,0.1)", border: "1px solid rgba(2,132,199,0.25)", borderRadius: "99px", padding: "3px 9px", fontSize: "11px", color: "#0284C7" }}>
                    {tech}
                    <button onClick={() => removeTech(item.id, tech)} style={{ background: "none", border: "none", cursor: "pointer", color: "#0284C7", padding: 0, lineHeight: 1, fontSize: "13px" }}>×</button>
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <Input value={techInputs[item.id] ?? ""} placeholder="React, TypeScript… (Entrée)" onChange={(e) => setTechInputs((p) => ({ ...p, [item.id]: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTech(item.id); } }} style={{ flex: 1, fontSize: "12px" }} />
                <button onClick={() => addTech(item.id)} style={{ background: "var(--gb-surface)", border: "1px solid var(--gb-border)", borderRadius: "9px", padding: "0 12px", cursor: "pointer", color: "var(--gb-text-off)", fontSize: "12px", flexShrink: 0 }}>+ Add</button>
              </div>
            </div>
          </div>
        </div>
      ))}
      <AddButton label="Ajouter un projet" onClick={add} />
    </div>
  );
}


const LEVELS: LanguageItem["level"][] = ["A1", "A2", "B1", "B2", "C1", "C2", "Native"];
const levelLabel: Record<LanguageItem["level"], string> = {
  A1: "A1 – Débutant", A2: "A2 – Élémentaire",
  B1: "B1 – Intermédiaire", B2: "B2 – Avancé",
  C1: "C1 – Courant", C2: "C2 – Maîtrise",
  Native: "Langue maternelle",
};

export function LanguagesSection({ data, onChange }: { data: LanguageItem[]; onChange: (d: LanguageItem[]) => void }) {
  const add = () => onChange([...data, { id: crypto.randomUUID(), language: "", level: "B2" }]);
  const upd = (id: string, k: keyof LanguageItem, v: unknown) => onChange(data.map((i) => i.id === id ? { ...i, [k]: v } : i));
  const del = (id: string) => onChange(data.filter((i) => i.id !== id));

  return (
    <div>
      {data.map((item) => (
        <div key={item.id} style={{ ...itemBox, display: "flex", flexDirection: "column", gap: "9px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "9px" }}>
            <div style={{ flex: 1 }}>
              <Label>Langue</Label>
              <LanguagePicker value={item.language} onChange={(v) => upd(item.id, "language", v)} />
            </div>
            <button style={{ ...delBtn, marginTop: "24px" }} onClick={() => del(item.id)}><Trash2 style={{ width: 13, height: 13 }} /></button>
          </div>
          <div>
            <Label>Niveau</Label>
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
              {LEVELS.map((l) => (
                <button key={l} type="button" onClick={() => upd(item.id, "level", l)}
                  style={{ padding: "5px 10px", borderRadius: "7px", border: item.level === l ? "1.5px solid #16A34A" : "1.5px solid var(--gb-border)", background: item.level === l ? "rgba(22,163,74,0.1)" : "transparent", color: item.level === l ? "#16A34A" : "var(--gb-text-off)", fontSize: "11px", fontWeight: item.level === l ? 700 : 400, cursor: "pointer", transition: "all 0.15s" }}>
                  {l}
                </button>
              ))}
            </div>
            {item.level && <p style={{ fontSize: "10.5px", color: "var(--gb-muted)", margin: "4px 0 0" }}>{levelLabel[item.level]}</p>}
          </div>
        </div>
      ))}
      <AddButton label="Ajouter une langue" onClick={add} />
    </div>
  );
}


export function CertificationsSection({ data, onChange }: { data: CertificationItem[]; onChange: (d: CertificationItem[]) => void }) {
  const add = () => onChange([...data, { id: crypto.randomUUID(), name: "", issuer: "", date: "", url: "" }]);
  const upd = (id: string, k: keyof CertificationItem, v: unknown) => onChange(data.map((i) => i.id === id ? { ...i, [k]: v } : i));
  const del = (id: string) => onChange(data.filter((i) => i.id !== id));

  return (
    <div>
      {data.map((item, idx) => (
        <div key={item.id} style={itemBox}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "11px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <Award style={{ width: 13, height: 13, color: "#16A34A" }} />
              <span style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--gb-muted)" }}>Certification {idx + 1}</span>
            </div>
            <button style={delBtn} onClick={() => del(item.id)}><Trash2 style={{ width: 13, height: 13 }} /></button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
            <Field label="Nom de la certification"><Input value={item.name} placeholder="AWS Solutions Architect" onChange={(e) => upd(item.id, "name", e.target.value)} /></Field>
            <div style={grid2}>
              <Field label="Organisme"><Input value={item.issuer} placeholder="Amazon / Coursera…" onChange={(e) => upd(item.id, "issuer", e.target.value)} /></Field>
              <Field label="Date"><DatePicker value={item.date} onChange={(v) => upd(item.id, "date", v)} /></Field>
            </div>
            <Field label="URL (optionnel)"><Input value={item.url} placeholder="https://credly.com/…" onChange={(e) => upd(item.id, "url", e.target.value)} /></Field>
          </div>
        </div>
      ))}
      <AddButton label="Ajouter une certification" onClick={add} />
    </div>
  );
}


export type CustomFieldType = "text" | "textarea" | "date" | "location" | "list" | "link";

export interface CustomField {
  id:    string;
  type:  CustomFieldType;
  label: string;
  value: string;
}

export interface CustomSectionDataV2 {
  title:  string;
  fields: CustomField[];
}

const FIELD_TYPES: { type: CustomFieldType; label: string; icon: string; desc: string }[] = [
  { type: "text",     label: "Texte court",  icon: "T",  desc: "Une ligne de texte" },
  { type: "textarea", label: "Texte long",   icon: "¶",  desc: "Paragraphe/description" },
  { type: "date",     label: "Date",         icon: "📅", desc: "Mois et année" },
  { type: "location", label: "Lieu",         icon: "📍", desc: "Ville, pays" },
  { type: "list",     label: "Liste",        icon: "•",  desc: "Éléments séparés" },
  { type: "link",     label: "Lien URL",     icon: "🔗", desc: "Site web, profil…" },
];

interface CustomSectionEditorProps {
  data:     CustomSectionDataV2;
  onChange: (d: CustomSectionDataV2) => void;
}

export function CustomSectionEditor({ data, onChange }: CustomSectionEditorProps) {
  const [addingType, setAddingType] = useState(false);
  const [listInputs, setListInputs] = useState<Record<string, string>>({});

  const addField = (type: CustomFieldType) => {
    const typeInfo = FIELD_TYPES.find((t) => t.type === type)!;
    onChange({ ...data, fields: [...data.fields, { id: crypto.randomUUID(), type, label: typeInfo.label, value: "" }] });
    setAddingType(false);
  };

  const updField = (id: string, key: keyof CustomField, val: string) =>
    onChange({ ...data, fields: data.fields.map((f) => f.id === id ? { ...f, [key]: val } : f) });

  const delField = (id: string) =>
    onChange({ ...data, fields: data.fields.filter((f) => f.id !== id) });

  const addListItem = (fieldId: string) => {
    const item  = listInputs[fieldId]?.trim();
    if (!item) return;
    const field = data.fields.find((f) => f.id === fieldId);
    if (!field) return;
    const items = field.value ? field.value.split("\n") : [];
    updField(fieldId, "value", [...items, item].join("\n"));
    setListInputs((p) => ({ ...p, [fieldId]: "" }));
  };

  const removeListItem = (fieldId: string, item: string) => {
    const field = data.fields.find((f) => f.id === fieldId);
    if (!field) return;
    updField(fieldId, "value", field.value.split("\n").filter((i) => i !== item).join("\n"));
  };

  return (
    <div>
      <div style={{ marginBottom: "14px" }}>
        <Label>Titre de la section</Label>
        <Input value={data.title} placeholder="Ex: Bénévolat, Publications, Réalisations…" onChange={(e) => onChange({ ...data, title: e.target.value })} />
      </div>

      {data.fields.map((field) => (
        <div key={field.id} style={{ ...itemBox, marginBottom: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "8px" }}>
            <span style={{ background: "rgba(22,163,74,0.1)", color: "#16A34A", borderRadius: "6px", padding: "2px 7px", fontSize: "10.5px", fontWeight: 700, flexShrink: 0 }}>
              {FIELD_TYPES.find((t) => t.type === field.type)?.icon} {FIELD_TYPES.find((t) => t.type === field.type)?.label}
            </span>
            <input value={field.label} onChange={(e) => updField(field.id, "label", e.target.value)} placeholder="Nom du champ"
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "12px", fontWeight: 600, color: "var(--gb-text)", fontFamily: "inherit" }} />
            <button style={delBtn} onClick={() => delField(field.id)}><Trash2 style={{ width: 12, height: 12 }} /></button>
          </div>

          {field.type === "text"     && <Input value={field.value} placeholder="Valeur…" onChange={(e) => updField(field.id, "value", e.target.value)} />}
          {field.type === "textarea" && <Textarea value={field.value} rows={3} placeholder="Description…" onChange={(e) => updField(field.id, "value", e.target.value)} />}
          {field.type === "date"     && <DatePicker value={field.value} onChange={(v) => updField(field.id, "value", v)} />}
          {field.type === "location" && <LocationPicker value={field.value} onChange={(v) => updField(field.id, "value", v)} />}
          {field.type === "link"     && <Input value={field.value} placeholder="https://…" onChange={(e) => updField(field.id, "value", e.target.value)} />}
          {field.type === "list" && (
            <div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "7px" }}>
                {field.value.split("\n").filter(Boolean).map((item) => (
                  <span key={item} style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "var(--gb-surface)", border: "1px solid var(--gb-border)", borderRadius: "99px", padding: "3px 9px", fontSize: "12px", color: "var(--gb-text-off)" }}>
                    {item}
                    <button onClick={() => removeListItem(field.id, item)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gb-muted)", padding: 0, lineHeight: 1, fontSize: "13px" }}>×</button>
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <Input value={listInputs[field.id] ?? ""} placeholder="Ajouter un élément…" onChange={(e) => setListInputs((p) => ({ ...p, [field.id]: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addListItem(field.id); } }} style={{ flex: 1, fontSize: "12px" }} />
                <button onClick={() => addListItem(field.id)} style={{ background: "var(--gb-surface)", border: "1px solid var(--gb-border)", borderRadius: "9px", padding: "0 12px", cursor: "pointer", color: "var(--gb-text-off)", fontSize: "12px", flexShrink: 0 }}>+</button>
              </div>
            </div>
          )}
        </div>
      ))}

      {!addingType ? (
        <button onClick={() => setAddingType(true)} style={{ ...addBtn }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(22,163,74,0.4)"; e.currentTarget.style.color = "#16A34A"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--gb-border2)"; e.currentTarget.style.color = "var(--gb-muted)"; }}>
          <Plus style={{ width: 13, height: 13 }} /> Ajouter un champ
        </button>
      ) : (
        <div style={{ background: "var(--gb-app-hover)", border: "1px solid var(--gb-border)", borderRadius: "12px", padding: "12px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--gb-muted)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 10px" }}>Type de champ</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
            {FIELD_TYPES.map((ft) => (
              <button key={ft.type} onClick={() => addField(ft.type)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", background: "var(--gb-surface)", border: "1px solid var(--gb-border)", borderRadius: "10px", padding: "10px 8px", cursor: "pointer", textAlign: "center" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(22,163,74,0.4)"; e.currentTarget.style.background = "rgba(22,163,74,0.05)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--gb-border)"; e.currentTarget.style.background = "var(--gb-surface)"; }}>
                <span style={{ fontSize: "16px" }}>{ft.icon}</span>
                <span style={{ fontSize: "10.5px", fontWeight: 600, color: "var(--gb-text)" }}>{ft.label}</span>
                <span style={{ fontSize: "9px", color: "var(--gb-muted)" }}>{ft.desc}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setAddingType(false)} style={{ marginTop: "8px", width: "100%", background: "transparent", border: "none", fontSize: "12px", color: "var(--gb-muted)", cursor: "pointer", padding: "4px" }}>Annuler</button>
        </div>
      )}
    </div>
  );
}