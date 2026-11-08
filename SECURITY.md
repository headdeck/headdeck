# Security Policy

Security is an important part of HeadDeck. As a web interface for Headscale management, HeadDeck may handle sensitive API credentials, network configuration, and administrative operations.

We appreciate responsible security research and coordinated vulnerability disclosure.

## Supported Versions

HeadDeck is currently under active development and has not reached its first stable release.

| Version | Security Support |
|---|---|
| Development (`main` / `master`) | Best effort |
| Unreleased builds | No guaranteed support |
| Stable releases | Not yet available |

Once stable releases are available, this section will be updated to document which versions receive security fixes.

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub Issues, Discussions, or pull requests.**

If you discover a potential security vulnerability, report it privately through one of the following channels:

**Preferred:** [GitHub Private Vulnerability Reporting](https://github.com/headdeck/headdeck/security/advisories/new), if enabled for this repository.

**Email:** [contact@headdeck.org](mailto:contact@headdeck.org)

When submitting a report, please include:

- A description of the vulnerability and its potential impact.
- The affected HeadDeck version or commit.
- Steps to reproduce the issue.
- Relevant logs, screenshots, or proof-of-concept details.
- Any suggested mitigations, if available.

Do not include real API keys, session tokens, passwords, or other sensitive credentials in your report unless a secure method of sharing them has been agreed upon.

## Disclosure Process

We aim to handle vulnerability reports responsibly.

1. **Acknowledgment:** We will make a best-effort attempt to acknowledge reports within 72 hours.
2. **Investigation:** We will review the report, assess its impact, and attempt to reproduce the issue.
3. **Remediation:** Confirmed vulnerabilities will be prioritized according to severity and potential impact.
4. **Disclosure:** Where appropriate, a security advisory will be published after a fix or suitable mitigation is available.

These are project goals rather than guaranteed response or remediation timelines.

We ask reporters to coordinate public disclosure with the maintainers to allow reasonable time for investigation and remediation.

## Security Scope

Security issues may include, but are not limited to:

- Authentication and authorization bypasses.
- Headscale API key exposure or improper handling.
- Session management vulnerabilities.
- Cross-site scripting (XSS).
- Cross-site request forgery (CSRF).
- Server-side request forgery (SSRF).
- Unauthorized network or node management operations.
- Sensitive information disclosure.
- Dependency vulnerabilities with a demonstrable impact on HeadDeck.

## Responsible Testing

When investigating potential vulnerabilities:

- Test only systems you own or are explicitly authorized to assess.
- Avoid disrupting production services or other users.
- Do not access, modify, or destroy data belonging to others.
- Do not perform denial-of-service attacks.
- Do not attempt social engineering against maintainers or contributors.
- Use test credentials and isolated environments whenever possible.

## Deployment Security

HeadDeck is intended to be deployed by administrators who control their own Headscale infrastructure.

Once authentication integration is implemented, deployments should follow these security practices:

- Use HTTPS for public-facing HeadDeck deployments.
- Protect Headscale API keys and authentication secrets.
- Configure the Headscale endpoint through server-side environment variables.
- Restrict direct access to the Headscale management API where practical.
- Keep HeadDeck, Headscale, and dependencies updated.
- Avoid exposing development builds to untrusted networks.
- Use appropriate network access controls and monitoring.

HeadDeck's authentication and Headscale API integration are still under development. **The current development version must not be considered production-ready.**

## Security Updates

Security fixes and advisories will be communicated through the project's GitHub repository when applicable.

Repository: https://github.com/headdeck/headdeck

Thank you for helping keep HeadDeck and its community secure.