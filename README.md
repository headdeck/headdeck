# HeadDeck

**A modern, open-source web interface for Headscale management.**

HeadDeck is an independent, community-driven web application for managing [Headscale](https://github.com/juanfont/headscale) through a responsive dashboard. It provides a browser-based interface for everyday network administration while keeping Headscale as the source of truth.

Built with Next.js and TypeScript, HeadDeck communicates with the Headscale management API from the server. It does not require a separate application backend or database.

> **Status — v0.2.1:** HeadDeck is available as a public Docker image for Linux AMD64 and ARM64. Core management features have been manually exercised against Headscale v0.29.7, and the container build and runtime have been tested. Broader compatibility testing, a formal security review, and comprehensive production deployment validation are still pending. This is an early community release, not a production-readiness guarantee.

## Preview

![HeadDeck dashboard in dark mode](docs/screenshots/dashboard.png)

Explore the interface in the [screenshots gallery](#screenshots) below.

## Features

- **Dashboard:** Total and online node counts, user counts, approved route counts, online/offline summaries, and recently registered nodes.
- **Nodes:** Browse, search, sort, and paginate nodes; inspect details; rename, expire, and delete nodes; manage tags and approved routes.
- **Device onboarding**: Register new devices through a guided workflow using interactive authentication or single-use pre-authentication keys. Generate Tailscale connection commands directly from HeadDeck.
- **Users:** Browse and manage Headscale users, including creating, renaming, and deleting users.
- **Pre-authentication keys:** Create keys with configurable user, expiration, reusability, ephemeral behavior, and tags; inspect key records, expire keys, and remove expired keys. Newly created secrets are displayed once.
- **API keys:** Create, inspect, expire, and delete Headscale API keys. Newly created secrets are displayed once.
- **Access policies:** Edit Headscale policies with a visual editor or HuJSON editor; manage groups, tag owners, and ACL rules; format drafts and publish policies to Headscale.
- **Settings:** Inspect the configured Headscale endpoint, manually test API connectivity, sign out, switch between light/dark/system themes, and view application information.
- **Authentication:** Sign in using a Headscale API key, with Auth.js JWT-based sessions and protected application routes.
- **Manual refresh:** Refresh Nodes, Users, Pre-authentication Keys, API Keys, and Access Policies without reloading the browser. Unsaved access policy drafts are protected from manual refresh.

HeadDeck uses the Headscale management API for persistent network state. It does not maintain its own copy of nodes, users, or policies in a separate database.

## Screenshots

Screenshots of the HeadDeck interface in dark mode, with an additional light-mode dashboard preview.

### Dashboard

![HeadDeck dashboard — dark mode](docs/screenshots/dashboard.png)

### Dashboard — light mode

![HeadDeck dashboard — light mode](docs/screenshots/dashboard_light.png)

### Nodes

![HeadDeck node management](docs/screenshots/nodes.png)

### Users

![HeadDeck user management](docs/screenshots/users.png)

### Pre-authentication keys

![HeadDeck pre-authentication key management](docs/screenshots/preauth-keys.png)

### API keys

![HeadDeck API key management](docs/screenshots/api-keys.png)

### Access policies

![HeadDeck access policy editor](docs/screenshots/access-policies.png)

### Settings

![HeadDeck settings](docs/screenshots/settings.png)

## Authentication and sessions

HeadDeck uses an existing **Headscale API key** to authenticate an administrator:

1. Enter the API key on the HeadDeck login page.
2. HeadDeck verifies it against the configured Headscale server.
3. Auth.js creates a JWT-based session. HeadDeck's server-side API client uses the credential from that session when calling Headscale.
4. Signing out ends the HeadDeck browser session; **it does not revoke or expire the underlying Headscale API key**.

The session is configured with an eight-hour maximum age. The API key is retained in the protected Auth.js JWT session token and is not deliberately exposed through the client-facing session callback or stored in browser local storage. Keep `AUTH_SECRET` confidential and use HTTPS for deployed instances.

Each HeadDeck deployment connects to **one Headscale server**, configured by the administrator through `HEADSCALE_URL`. Users cannot switch the server from the login or Settings page.

## Technology stack

- [Next.js](https://nextjs.org/) and [React](https://react.dev/) — Application framework and UI
- [TypeScript](https://www.typescriptlang.org/) — Type safety
- [Tailwind CSS](https://tailwindcss.com/) — Styling
- [shadcn/ui](https://ui.shadcn.com/) and [Base UI](https://base-ui.com/) — UI components and primitives
- [Auth.js](https://authjs.dev/) (NextAuth v5) — Authentication and sessions
- [Zod](https://zod.dev/) — API response and data validation
- [pnpm](https://pnpm.io/) — Package management

## Project structure

```text
headdeck/
├── admin/                 # Next.js application, UI, server actions, and Headscale API client
├── shared/                # Shared Zod schemas, types, and utilities
└── README.md
```

The Next.js server handles authenticated communication with Headscale. Interactive UI components invoke server actions where appropriate; there is no separate HeadDeck API service or application database.

## Docker deployment (recommended)

Prebuilt images are published to [GitHub Container Registry](https://github.com/orgs/headdeck/packages/container/package/headdeck) for `linux/amd64` and `linux/arm64`.

```bash
docker pull ghcr.io/headdeck/headdeck:0.2.1
```

Use a versioned tag for reproducible deployments. The `0.1` and `latest` tags track newer releases and can change over time.

### Docker Compose

Create a `compose.yaml`:

```yaml
services:
  headdeck:
    image: ghcr.io/headdeck/headdeck:0.2.1
    restart: unless-stopped
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      HEADSCALE_URL: "https://headscale.example.com"
      HEADSCALE_EXTERNAL_URL: "https://headscale.example.com"
      AUTH_SECRET: "${AUTH_SECRET:?Set AUTH_SECRET in .env}"
      AUTH_URL: "https://headdeck.example.com"
      AUTH_TRUST_HOST: "true"
      BASE_PATH: "${BASE_PATH:-}"
```

Create a `.env` file alongside `compose.yaml` containing a strong, randomly generated `AUTH_SECRET` (for example, generate one with `openssl rand -base64 32`). Do not commit this file. Replace the Headscale URL and public HeadDeck URL with your own. `AUTH_URL` should be the public **origin** (scheme and hostname, plus port if needed), without the `BASE_PATH` suffix; for direct HTTP testing on localhost, use `http://localhost:3000` instead. `BASE_PATH` is optional and defaults to empty, so normal root deployments require no extra configuration.

```bash
docker compose up -d
```

This example binds port 3000 to the **host loopback interface**, intended for a reverse proxy running on the same host. Configure the proxy to serve HeadDeck over HTTPS and forward the original host and scheme headers. If the reverse proxy runs on another machine or in another container, adapt the network and port configuration rather than blindly exposing the admin interface publicly. `AUTH_TRUST_HOST=true` should only be used when requests arrive through a trusted proxy or controlled ingress that validates host headers.

Open your configured HeadDeck URL, sign in using a Headscale API key, and use **Settings → Test Connection**.

### Hosting under a URL prefix (runtime `BASE_PATH`)

Starting with v0.1.4, HeadDeck can be served at a prefix such as `https://network.example.com/admin/` without rebuilding the Docker image. Set the **server-only**, runtime environment variable `BASE_PATH` to the public path prefix; do not use `NEXT_PUBLIC_BASE_PATH` or configure Next.js's build-time `basePath`.

For example, when Headscale and HeadDeck share `network.example.com`, add this to the Compose `.env` file:

```dotenv
AUTH_SECRET=replace-with-a-strong-random-secret
BASE_PATH=/admin
```

The Compose example above passes `BASE_PATH` into the container. Set `HEADSCALE_URL=https://network.example.com` and `AUTH_URL=https://network.example.com` in `compose.yaml` for this deployment. **Do not append `/admin` to `AUTH_URL` or `HEADSCALE_URL`.** If using `env_file: .env` instead, ensure the required variables are actually passed into the container; a Compose `.env` file alone is used for substitution and is not automatically injected as container environment variables.

| `BASE_PATH` | Public HeadDeck URL |
| --- | --- |
| Unset or empty | `https://headdeck.example.com/` |
| `/admin` | `https://network.example.com/admin/` |
| `/headdeck` | `https://network.example.com/headdeck/` |

The reverse proxy **must remove the prefix** before forwarding requests to HeadDeck. The application continues to use internal routes such as `/nodes`, while generating prefixed browser navigation and login/logout redirects at runtime.

#### Example Nginx: Headscale and HeadDeck on one hostname

The following is an illustrative HTTPS `server` block. It assumes Nginx can reach Headscale at `127.0.0.1:8080` and HeadDeck at `127.0.0.1:3000`. Adapt upstream addresses and certificate paths to your deployment. The HeadDeck container's port binding in the Compose example works when Nginx is on the same host.

```nginx
server {
    listen 443 ssl;
    server_name network.example.com;

    ssl_certificate /etc/letsencrypt/live/network.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/network.example.com/privkey.pem;

    # Next.js assets are requested at the domain root.
    location ^~ /_next/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Auth.js endpoints are also rooted at /api/auth/.
    # Do not forward these to Headscale.
    location ^~ /api/auth/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location = /admin {
        return 301 /admin/;
    }

    location /admin/ {
        # Trailing slash strips /admin/ before forwarding to HeadDeck.
        proxy_pass http://127.0.0.1:3000/;
        proxy_redirect ~^(/.*)$ /admin$1;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # All other paths remain with Headscale, including its /api/v1/ API.
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

This is a starting example, **not a complete hardened reverse-proxy configuration**. Preserve the TLS, access-control, WebSocket, and other settings required by your Headscale deployment. If you protect `/admin/` with an external authentication gateway, separately assess the root-level `/api/auth/` endpoints and avoid breaking Auth.js callbacks. Never expose the HeadDeck upstream directly to untrusted networks.

**Important limitations:** Prefix hosting is not fully path-isolated: `/_next/` and `/api/auth/` remain reserved at the hostname root. Check for collisions with other applications before using a shared hostname. The documented `/admin` deployment has been manually exercised for authentication and navigation, but not every administrative write operation or reverse-proxy combination has been validated. After changing `BASE_PATH`, recreate the container and test sign-in, sign-out, navigation, and management actions.

### Headscale servers using an internal CA

If the Headscale HTTPS certificate is signed by a private CA, Node.js in the HeadDeck container must trust that CA. Add the following to the `headdeck` service in `compose.yaml`:

```yaml
    environment:
      HEADSCALE_URL: "https://headscale.example.com"
      HEADSCALE_EXTERNAL_URL: "https://headscale.example.com"
      AUTH_SECRET: "${AUTH_SECRET:?Set AUTH_SECRET in .env}"
      AUTH_URL: "https://headdeck.example.com"
      AUTH_TRUST_HOST: "true"
      BASE_PATH: "${BASE_PATH:-}"
      NODE_EXTRA_CA_CERTS: "/etc/headdeck/ca/root-ca.pem"
    volumes:
      - ./certs/root-ca.pem:/etc/headdeck/ca/root-ca.pem:ro
```

The `environment` block above **replaces** the earlier one; do not add a second `environment` key. Supply your own PEM-encoded CA certificate at `./certs/root-ca.pem`, and restart the container. The Headscale server should also present any required intermediate certificates. **Never disable TLS verification** with `NODE_TLS_REJECT_UNAUTHORIZED=0`.

`HEADSCALE_URL` must be reachable from inside the HeadDeck container. The application does not need a separate database or persistent application-data volume.

## Getting started

### Prerequisites for source development

- A Node.js version supported by the Next.js version in this repository
- pnpm
- A reachable Headscale server with a compatible management API
- A Headscale API key authorized to perform the management operations you intend to use

### Clone and install for development

```bash
git clone https://github.com/headdeck/headdeck.git
cd headdeck/admin
pnpm install
```

### Configure development environment variables

Create `admin/.env.local`:

```dotenv
HEADSCALE_URL=https://headscale.example.com
AUTH_SECRET=replace-with-a-strong-random-secret
```

| Variable | Purpose |
| --- | --- |
| `HEADSCALE_URL` | Base URL of the Headscale server, including its port if needed. Used only on the server. |
| `AUTH_SECRET` | Secret used by Auth.js to protect session tokens. Required. |
| `BASE_PATH` | Optional private runtime URL prefix (for example, `/admin`). Empty by default. |
| `HEADSCALE_EXTERNAL_URL` | Optional Headscale URL used in device onboarding commands. Falls back to HEADSCALE_URL with a reachability warning. |

Generate a secret using:

```bash
pnpm dlx auth secret
```

For deployments requiring an explicit application URL, Auth.js v5 also supports `AUTH_URL`. It is not normally necessary for local development. Configure reverse-proxy and trusted-host settings appropriately for your deployment; do not expose the Headscale API key through public environment variables.

**Important:** `HEADSCALE_URL` must be reachable **from the HeadDeck server**, not merely from the administrator's browser. If your Headscale instance uses an internal CA, configure Node.js to trust that CA rather than disabling TLS verification.

### Run locally

From the `admin` directory:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000), sign in with a Headscale API key, and use **Settings → Test Connection** to confirm that the server can reach Headscale with the current credential.

### Build

From the `admin` directory:

```bash
pnpm build
```

A multi-platform production Docker image has been built and its runtime manually tested. Production hosting, HTTPS termination, and reverse-proxy configuration should still be validated for each deployment before exposing HeadDeck to users.

## Compatibility

HeadDeck has been developed and tested against **Headscale v0.29.7**. This is the currently verified development target, **not** a declaration that all older or newer releases are compatible.

Headscale management API behavior can change between versions. Broader compatibility testing and a formally supported version range are still pending.

## Security considerations

HeadDeck can perform sensitive network-administration operations. Deploy it with the same care as other privileged administrative interfaces.

- Headscale API requests and API-key retrieval are performed server-side.
- Authentication uses Auth.js JWT-based sessions; the Headscale API key is held in the protected session token.
- The client-facing session does not intentionally include the Headscale API key.
- No separate HeadDeck application database or browser local-storage credential store is required.
- Signing out clears the application session, **not** the Headscale API key on the server.
- Use HTTPS, a strong `AUTH_SECRET`, and appropriately scoped/restricted network access to the HeadDeck application and Headscale API.
- Avoid using production credentials in development or publicly reachable test deployments.

**A formal security review and comprehensive production deployment validation are still outstanding.** A successful container build and manual functional testing do not constitute an independent security audit.

For responsible disclosure, see the [Security Policy](SECURITY.md). Please report security vulnerabilities privately rather than opening public GitHub issues.

## Development roadmap

### Phase 1 — Interface

- [x] Dashboard layout and navigation
- [x] Dashboard, Nodes, and Users pages
- [x] Pre-authentication Keys and API Keys pages
- [x] Access Policies visual and HuJSON editors
- [x] Settings and appearance controls
- [x] API-key login page

### Phase 2 — Headscale integration

- [x] API-key authentication and protected sessions
- [x] Server-side Headscale API client
- [x] Live dashboard and node information
- [x] User and node management
- [x] Pre-authentication key management
- [x] API key management
- [x] Access policy editing and publishing
- [x] Connection testing and sign-out
- [x] Guided device registration and onboarding
- [x] Manual refresh controls for administration pages

### Phase 3 — Release readiness

- [ ] Broader integration and end-to-end testing
- [ ] Security and accessibility review
- [ ] Responsive layout verification across target devices
- [x] Production Docker build and initial container runtime testing
- [x] Initial public Docker image release (AMD64 and ARM64)
- [x] Runtime-configurable URL prefix with initial shared-hostname Nginx example
- [ ] Broader production deployment and reverse-proxy validation

## Contributing

Contributions, bug reports, feature suggestions, and discussions are welcome. Please use [GitHub Issues](https://github.com/headdeck/headdeck/issues) for bugs and feature requests, but report security vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

## License

HeadDeck is licensed under the [Apache License, Version 2.0](LICENSE). See the [LICENSE](LICENSE) file for details.

## Links

- **Website:** https://headdeck.org
- **GitHub:** https://github.com/headdeck/headdeck
- **Contact:** contact@headdeck.org

---

HeadDeck is an independent community project and is **not an official Headscale application**.