# HeadDeck

**A modern, open-source web interface for Headscale management.**

HeadDeck is an independent, community-driven web application for managing [Headscale](https://github.com/juanfont/headscale) through a responsive dashboard. It provides a browser-based interface for everyday network administration while keeping Headscale as the source of truth.

Built with Next.js and TypeScript, HeadDeck communicates with the Headscale management API from the server. It does not require a separate application backend or database.

> **Status — v0.1.0 development:** The core management features and API-key authentication are implemented and have been exercised against a Headscale v0.29.7 test instance. Security review, broader compatibility testing, production build/deployment validation, and release testing are still pending. Treat this as pre-release software, not a production-readiness guarantee.

## Features

- **Dashboard:** Total and online node counts, user counts, approved route counts, online/offline summaries, and recently registered nodes.
- **Nodes:** Browse, search, sort, and paginate nodes; inspect details; rename, expire, and delete nodes; manage tags and approved routes.
- **Users:** Browse and manage Headscale users, including creating, renaming, and deleting users.
- **Pre-authentication keys:** Create keys with configurable user, expiration, reusability, ephemeral behavior, and tags; inspect key records, expire keys, and remove expired keys. Newly created secrets are displayed once.
- **API keys:** Create, inspect, expire, and delete Headscale API keys. Newly created secrets are displayed once.
- **Access policies:** Edit Headscale policies with a visual editor or HuJSON editor; manage groups, tag owners, and ACL rules; format drafts and publish policies to Headscale.
- **Settings:** Inspect the configured Headscale endpoint, manually test API connectivity, sign out, switch between light/dark/system themes, and view application information.
- **Authentication:** Sign in using a Headscale API key, with Auth.js JWT-based sessions and protected application routes.

HeadDeck uses the Headscale management API for persistent network state. It does not maintain its own copy of nodes, users, or policies in a separate database.

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

## Getting started

### Prerequisites

- A Node.js version supported by the Next.js version in this repository
- pnpm
- A reachable Headscale server with a compatible management API
- A Headscale API key authorized to perform the management operations you intend to use

### Clone and install

```bash
git clone https://github.com/headdeck/headdeck.git
cd headdeck/admin
pnpm install
```

### Configure environment variables

Create `admin/.env.local`:

```dotenv
HEADSCALE_URL=https://headscale.example.com
AUTH_SECRET=replace-with-a-strong-random-secret
```

| Variable | Purpose |
| --- | --- |
| `HEADSCALE_URL` | Base URL of the Headscale server, including its port if needed. Used only on the server. |
| `AUTH_SECRET` | Secret used by Auth.js to protect session tokens. Required. |

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

A successful build is only one part of deployment validation. Production hosting and reverse-proxy configuration should be tested separately before exposing HeadDeck to users.

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

**Security review and production deployment validation are still outstanding.** These implementation choices do not constitute an independent security audit.

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

### Phase 3 — Release readiness

- [ ] Broader integration and end-to-end testing
- [ ] Security and accessibility review
- [ ] Responsive layout verification across target devices
- [ ] Production build and deployment validation
- [ ] Initial public release

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