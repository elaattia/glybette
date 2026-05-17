import { useState, useRef, useEffect } from "react";
import { MapPin, ChevronDown, Search } from "lucide-react";
import { inputCss, Input } from "../primitives";

const COUNTRIES_CITIES: Record<string, string[]> = {
    Tunisie: ["Tunis","Sfax","Sousse","Monastir","Bizerte","Gabès","Kairouan","Nabeul","Ariana","Ben Arous","Gafsa","Tozeur","Médenine","Beja","Jendouba","Mahdia","Kasserine","Sidi Bouzid","Tataouine","Kebili","Le Kef","Zaghouan"],
    France: ["Paris","Lyon","Marseille","Toulouse","Nice","Nantes","Strasbourg","Montpellier","Bordeaux","Lille","Rennes","Grenoble","Dijon","Angers","Nîmes","Toulon","Saint-Étienne","Reims","Le Havre","Villeurbanne"],
    Maroc: ["Casablanca","Rabat","Marrakech","Fès","Tanger","Agadir","Meknès","Oujda","Kénitra","Tétouan","Salé","Nador","Béni Mellal"],
    Algérie: ["Alger","Oran","Constantine","Annaba","Blida","Batna","Djelfa","Sétif","Biskra","Tébessa","Sidi Bel Abbès"],
    Belgique: ["Bruxelles","Anvers","Gand","Charleroi","Liège","Bruges","Namur","Leuven","Mons"],
    Suisse: ["Zurich","Genève","Bâle","Berne","Lausanne","Winterthur","Lucerne","Lugano"],
    Canada: ["Montréal","Toronto","Vancouver","Calgary","Ottawa","Québec","Edmonton","Winnipeg"],
    Allemagne: ["Berlin","Munich","Hambourg","Cologne","Francfort","Stuttgart","Düsseldorf","Leipzig"],
    Espagne: ["Madrid","Barcelone","Valence","Séville","Saragosse","Malaga","Bilbao"],
    Italie: ["Rome","Milan","Naples","Turin","Palerme","Gênes","Bologne","Florence"],
    "Royaume-Uni": ["Londres","Manchester","Birmingham","Glasgow","Leeds","Liverpool","Edinburgh"],
    "États-Unis": ["New York","Los Angeles","Chicago","Houston","San Francisco","Seattle","Boston","Miami","Washington DC"],
    "Émirats Arabes Unis": ["Dubaï","Abu Dhabi","Sharjah","Ajman"],
    "Arabie Saoudite": ["Riyad","Djeddah","La Mecque","Médine","Dammam"],
    Qatar: ["Doha","Al Wakrah","Lusail"],
    Égypte: ["Le Caire","Alexandrie","Gizeh","Port-Saïd","Louxor"],
    "Pays-Bas": ["Amsterdam","Rotterdam","La Haye","Utrecht","Eindhoven"],
    Portugal: ["Lisbonne","Porto","Braga","Coimbra","Faro"],
    Suède: ["Stockholm","Göteborg","Malmö","Uppsala"],
    Norvège: ["Oslo","Bergen","Trondheim","Stavanger"],
    Danemark: ["Copenhague","Aarhus","Odense"],
    Finlande: ["Helsinki","Espoo","Tampere"],
    Irlande: ["Dublin","Cork","Galway","Limerick"],
    Australie: ["Sydney","Melbourne","Brisbane","Perth","Adelaide"],
    Singapour: ["Singapour"],
    Japon: ["Tokyo","Osaka","Kyoto","Yokohama","Nagoya"],
};

const ALL_COUNTRIES = Object.keys(COUNTRIES_CITIES).sort();

interface LocationPickerProps {
    value: string;
    onChange: (val: string) => void;
}

export function LocationPicker({ value, onChange }: LocationPickerProps) {
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

    const [country, setCountry] = useState(detectCountry);
    const [city, setCity] = useState(() => detectCity(detectCountry()));
    const [address, setAddress] = useState("");
    const [countryOpen, setCountryOpen] = useState(false);
    const [cityOpen, setCityOpen] = useState(false);
    const [search, setSearch] = useState("");
    const countryRef = useRef<HTMLDivElement>(null);
    const cityRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (countryRef.current && !countryRef.current.contains(e.target as Node)) setCountryOpen(false);
            if (cityRef.current && !cityRef.current.contains(e.target as Node)) setCityOpen(false);
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const buildValue = (c: string, ci: string, addr: string) => {
        const parts = [ci, c, addr].filter(Boolean);
        onChange(parts.join(", "));
    };

    const handleCountrySelect = (c: string) => {
        setCountry(c);
        setCity("");
        setCountryOpen(false);
        setSearch("");
        buildValue(c, "", address);
    };

    const handleCitySelect = (c: string) => {
        setCity(c);
        setCityOpen(false);
        buildValue(country, c, address);
    };

    const filtered = ALL_COUNTRIES.filter((c) => c.toLowerCase().includes(search.toLowerCase()));
    const cities = country ? (COUNTRIES_CITIES[country] ?? []) : [];

    const dropdownStyle: React.CSSProperties = {
        position: "absolute",
        top: "calc(100% + 4px)",
        left: 0,
        right: 0,
        zIndex: 100,
        background: "var(--gb-surface)",
        border: "1px solid var(--gb-border)",
        borderRadius: "12px",
        boxShadow: "0 12px 36px rgba(0,0,0,0.2)",
        maxHeight: "220px",
        display: "flex",
        flexDirection: "column",
    };

    const optionBtn = (selected: boolean): React.CSSProperties => ({
        width: "100%",
        textAlign: "left",
        padding: "7px 10px",
        background: selected ? "rgba(22,163,74,0.1)" : "transparent",
        color: selected ? "#16A34A" : "var(--gb-text)",
        border: "none",
        borderRadius: "7px",
        cursor: "pointer",
        fontSize: "12.5px",
        fontWeight: selected ? 600 : 400,
    });

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div ref={countryRef} style={{ position: "relative" }}>
                <button
                    type="button"
                    onClick={() => { setCountryOpen((o) => !o); setSearch(""); }}
                    style={{ ...inputCss, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left", borderColor: countryOpen ? "#16A34A" : "var(--gb-border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <MapPin style={{ width: 13, height: 13, color: "var(--gb-muted)", flexShrink: 0 }} />
                        <span style={{ color: country ? "var(--gb-text)" : "var(--gb-muted)", fontSize: "13px" }}>
                            {country || "Sélectionner un pays"}
                        </span>
                    </div>
                    <ChevronDown style={{ width: 13, height: 13, color: "var(--gb-muted)", transform: countryOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                </button>
                {countryOpen && (
                    <div style={dropdownStyle}>
                        <div style={{ padding: "8px", borderBottom: "1px solid var(--gb-border)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "7px", background: "var(--gb-app-hover)", borderRadius: "8px", padding: "6px 10px" }}>
                                <Search style={{ width: 12, height: 12, color: "var(--gb-muted)", flexShrink: 0 }} />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Rechercher un pays…"
                                    style={{ background: "none", border: "none", outline: "none", fontSize: "12px", color: "var(--gb-text)", width: "100%" }}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div style={{ overflowY: "auto", padding: "4px" }}>
                            {filtered.map((c) => (
                                <button key={c} type="button" onClick={() => handleCountrySelect(c)} style={optionBtn(country === c)}
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
                    <button
                        type="button"
                        onClick={() => setCityOpen((o) => !o)}
                        style={{ ...inputCss, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left", borderColor: cityOpen ? "#16A34A" : "var(--gb-border)" }}>
                        <span style={{ color: city ? "var(--gb-text)" : "var(--gb-muted)", fontSize: "13px" }}>
                            {city || "Sélectionner une ville"}
                        </span>
                        <ChevronDown style={{ width: 13, height: 13, color: "var(--gb-muted)", transform: cityOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                    </button>
                    {cityOpen && (
                        <div style={{ ...dropdownStyle, maxHeight: "200px", flexDirection: "column" }}>
                            <div style={{ overflowY: "auto", padding: "4px" }}>
                                {cities.map((c) => (
                                    <button key={c} type="button" onClick={() => handleCitySelect(c)} style={optionBtn(city === c)}
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

            <Input
                value={address}
                placeholder="Adresse complète (optionnel)"
                onChange={(e) => {
                    setAddress(e.target.value);
                    buildValue(country, city, e.target.value);
                }}
            />
        </div>
    );
}