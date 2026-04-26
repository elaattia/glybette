# Portfolio Routing Setup

Glybette supports two public portfolio URL forms:

- Premium: `https://{slug}.glybette.com`
- Standard: `https://glybette.com/user/{slug}`

Both URL forms should serve the same client application. The client resolves standard path URLs from `/user/:slug` and resolves premium subdomain URLs from the request hostname.

## Environment Variables

Set these values for the API gateway and portfolio service:

```bash
PORTFOLIO_SERVICE_URL=http://portfolio-service:3004
PORT_PORTFOLIO_SERVICE=3004
PORTFOLIO_SERVICE_MONGODB_DB_NAME=glybette_portfolios
PORTFOLIO_PUBLIC_ROOT_DOMAIN=glybette.com
```

Set this value for the Vite client build:

```bash
VITE_PORTFOLIO_ROOT_DOMAIN=glybette.com
```

## DNS

Create DNS records that point both the apex domain and wildcard subdomains to the same frontend host or reverse proxy:

```text
glybette.com        A/CNAME  your-frontend-target
www.glybette.com    A/CNAME  your-frontend-target
*.glybette.com      A/CNAME  your-frontend-target
```

The wildcard record is required for premium URLs like `rayen.glybette.com`.

## Reverse Proxy

Configure the proxy so all portfolio hosts serve the SPA entry point and API calls continue to the API gateway:

```nginx
server {
    server_name glybette.com www.glybette.com *.glybette.com;

    location /api/ {
        proxy_pass http://api-gateway:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri /index.html;
    }
}
```

The `X-Forwarded-Host` header lets the portfolio service resolve a slug from `{slug}.glybette.com` when the client asks `/api/portfolio/public/resolve`.

## Local Testing

Path routing works without host changes:

```text
http://localhost:5173/user/{slug}
```

To test subdomain routing locally, add a hosts entry and run the Vite dev server with that host:

```text
127.0.0.1 rayen.glybette.test
```

Then set:

```bash
VITE_PORTFOLIO_ROOT_DOMAIN=glybette.test
PORTFOLIO_PUBLIC_ROOT_DOMAIN=glybette.test
```

Open:

```text
http://rayen.glybette.test:5173
```

Production DNS and TLS certificates must include the wildcard hostname.
