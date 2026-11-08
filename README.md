# HeadDeck

**A modern, open-source web interface for Headscale management.**

HeadDeck is a community-driven web application designed to make managing [Headscale](https://github.com/juanfont/headscale) networks easier through a clean, responsive dashboard.

Built with Next.js, TypeScript, and modern UI components, HeadDeck aims to provide a straightforward management experience while keeping Headscale as the source of truth.

> **Development Status:** HeadDeck is under active development. The initial dashboard UI is complete, but authentication and Headscale API integration are not yet functional. It is not ready for production use.

## Features

HeadDeck is designed to provide the following functionality:

- **Overview:** Network statistics, connectivity summaries, and recently registered nodes.
- **Nodes:** View and manage nodes, registration details, tags, and routes.
- **Users:** Manage Headscale users and their associated nodes.
- **Pre-auth Keys:** Create, inspect, and expire pre-authentication keys.
- **Access Policies:** View, edit, validate, and publish Headscale ACL policies.
- **API Keys:** Create and manage Headscale API keys.
- **Settings:** View connection information, manage sessions, and customize appearance.
- **Appearance:** Light, dark, and system themes.

### Authentication

HeadDeck is designed to use Headscale API keys for authentication.

Each deployment connects to a single Headscale instance configured through the `HEADSCALE_URL` environment variable. Users will authenticate by entering their Headscale API key.

The planned architecture uses Auth.js with server-side Headscale API communication and encrypted sessions, without requiring a separate application database.

Authentication and session management are not yet implemented.

## Technology Stack

- [Next.js](https://nextjs.org/) — Application framework
- [React](https://react.dev/) — User interface
- [TypeScript](https://www.typescriptlang.org/) — Type-safe development
- [Tailwind CSS](https://tailwindcss.com/) — Styling
- [shadcn/ui](https://ui.shadcn.com/) — UI components
- [Base UI](https://base-ui.com/) — Accessible component primitives
- [Auth.js](https://authjs.dev/) — Authentication framework
- [Zod](https://zod.dev/) — Schema validation
- [pnpm](https://pnpm.io/) — Package management

## Project Structure

```text
headdeck/
├── admin/          # Next.js web application
├── shared/         # Shared schemas, types, and utilities
└── README.md
```

HeadDeck uses a lightweight architecture without a separate backend service or application database. The Next.js application will communicate with the Headscale management API through server-side handlers.

## Getting Started

### Prerequisites

- Node.js (a version compatible with the project's Next.js release)
- pnpm
- A Headscale instance (required for future API integration)

### Clone the Repository

```bash
git clone https://github.com/headdeck/headdeck.git
cd headdeck
```

### Install Dependencies

```bash
cd admin
pnpm install
```

### Configure Environment Variables

Create `admin/.env.local`:

```dotenv
HEADSCALE_URL=https://headscale.example.com
AUTH_SECRET=your-generated-secret
```

Generate a secure Auth.js secret using:

```bash
pnpm dlx auth secret
```

The Headscale URL is configured server-side and is not entered by users through the login screen.

### Start the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

**Note:** The application currently redirects unauthenticated visitors to a preview login screen. Actual authentication is not yet available, so the protected dashboard cannot be accessed through the normal login flow.

## Development Roadmap

### Phase 1 — User Interface

- [x] Dashboard layout and navigation
- [x] Overview, Nodes, and Users pages
- [x] Pre-auth Keys and API Keys pages
- [x] Access Policies editor
- [x] Settings and appearance controls
- [x] API-key login screen
- [x] Auth.js configuration and route protection foundation

### Phase 2 — Headscale Integration

- [ ] API-key authentication
- [ ] Secure session and credential handling
- [ ] Headscale API client
- [ ] Real network statistics and node information
- [ ] User and node management
- [ ] Pre-auth key management
- [ ] API key management
- [ ] Access policy management
- [ ] Connection and session management

### Phase 3 — Testing and Release

- [ ] Integration and end-to-end testing
- [ ] Security and accessibility review
- [ ] Responsive layout verification
- [ ] Production build and deployment testing
- [ ] Initial release

## Compatibility

HeadDeck targets the latest Headscale management API. Backward compatibility with older Headscale releases is not currently a project goal.

A specific minimum supported Headscale version will be documented when API integration and compatibility testing are complete.

## Security

HeadDeck is intended to manage sensitive Headscale network configuration and credentials.

The planned security model includes:

- Server-side Headscale API communication.
- A deployment-configured Headscale endpoint.
- API-key-based authentication.
- Protected sessions.
- No API key storage in browser local storage.
- No separate application database.

These are architectural goals, not claims that all protections are already implemented.

**Do not expose a development deployment to untrusted networks or use production API keys until authentication and security testing are complete.**

For responsible vulnerability disclosure, supported versions, and security reporting instructions, see our [Security Policy](SECURITY.md).

Please report security vulnerabilities privately rather than opening public GitHub issues.

## Contributing

Contributions, bug reports, feature suggestions, and discussions are welcome.

As the project develops, contribution guidelines and development documentation will be added.

You can participate through [GitHub Issues](https://github.com/headdeck/headdeck/issues).

## License

HeadDeck is licensed under the [Apache License, Version 2.0](LICENSE).

See the [LICENSE](LICENSE) file for the complete license terms.

## Links

- **Website:** https://headdeck.org
- **GitHub:** https://github.com/headdeck/headdeck
- **Contact:** contact@headdeck.org

---

HeadDeck is an independent community project and is not an official Headscale application.