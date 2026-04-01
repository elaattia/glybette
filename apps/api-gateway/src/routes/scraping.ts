import { Hono } from "hono";
import type {
  OffresResponse,
  Offre,
  ScrapingStats,
  ScrapingSource,
  OffresFilters,
} from "@glybette/types";

const SCRAPING_SERVICE_URL =
  process.env.SCRAPING_SERVICE_URL ?? "http://localhost:3002";

const scraping = new Hono();



async function proxyTo<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${SCRAPING_SERVICE_URL}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new Error(
      `Scraping service error: ${res.status} ${res.statusText} — ${url}`
    );
  }
  return res.json() as Promise<T>;
}


scraping.get("/offres", async (c) => {
  const params = new URLSearchParams();
  const filters: OffresFilters = {
    type_offre: c.req.query("type_offre") as OffresFilters["type_offre"],
    source:     c.req.query("source") as OffresFilters["source"],
    localisation: c.req.query("localisation"),
    search:     c.req.query("search"),
    page:       c.req.query("page") ? Number(c.req.query("page")) : undefined,
    limit:      c.req.query("limit") ? Number(c.req.query("limit")) : undefined,
    tri:        c.req.query("tri") as OffresFilters["tri"],
  };

  for (const [key, val] of Object.entries(filters)) {
    if (val !== undefined && val !== null && val !== "") {
      params.set(key, String(val));
    }
  }

  try {
    const data = await proxyTo<OffresResponse>(`/offres?${params.toString()}`);
    return c.json(data);
  } catch (err) {
    console.error("[scraping-gateway]", err);
    return c.json({ error: "Scraping service unavailable" }, 503);
  }
});



scraping.get("/offres/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const data = await proxyTo<Offre>(`/offres/${id}`);
    return c.json(data);
  } catch (err: any) {
    if (err.message?.includes("404")) return c.json({ error: "Not found" }, 404);
    return c.json({ error: "Scraping service unavailable" }, 503);
  }
});



scraping.get("/stats", async (c) => {
  try {
    const data = await proxyTo<ScrapingStats>("/stats");
    return c.json(data);
  } catch (err) {
    return c.json({ error: "Scraping service unavailable" }, 503);
  }
});



scraping.get("/sources", async (c) => {
  try {
    const data = await proxyTo<{ sources: ScrapingSource[] }>("/sources");
    return c.json(data);
  } catch (err) {
    return c.json({ error: "Scraping service unavailable" }, 503);
  }
});




scraping.post("/trigger", async (c) => {
  const body = await c.req.json<{ source: string }>();
  const source = body?.source ?? "all";
  try {
    const data = await proxyTo<{ message: string; timestamp: string }>(
      `/scrape/now?source=${source}`,
      { method: "POST" }
    );
    return c.json(data);
  } catch (err) {
    return c.json({ error: "Scraping service unavailable" }, 503);
  }
});



scraping.get("/health", async (c) => {
  try {
    const data = await proxyTo<{ status: string; timestamp: string }>("/health");
    return c.json(data);
  } catch (err) {
    return c.json({ service: "scraping-service", status: "unreachable" }, 503);
  }
});

export { scraping };
