# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed
- README: synced the tool count from "35 tools" to "50+ tools" to match the live site (llms.txt, /tools, and ai-plugin.json all report 50+)

## [1.2.0] - 2026-06-30

### Added
- `npx hackmyip` CLI (`bin/cli.js`) — run the toolkit straight from the terminal, no install and no API key
  - Commands: `hackmyip` (summary), `ip`, `json`, `proxy`, `lookup <ip>`, `dns <domain> [type]`, `blacklist <ip>`, `whois <domain>`, `help`
  - Dependency-free (Node 18+ global fetch), colorized on a TTY, auto-plain when piped or `NO_COLOR` is set, non-zero exit on error
- Terminal demo (`assets/demo.svg`) embedded at the top of the README
- README "Use it from your terminal (curl)" and "CLI (`npx hackmyip`)" sections documenting the curl toolkit and CLI

## [1.1.0] - 2026-05-21

### Added
- `dnsLookup(domain, type)` — DNS records (A, AAAA, CNAME, MX, NS, TXT, SOA, SRV, CAA, PTR)
- `whois(domain)` — WHOIS / RDAP registration data
- `reverseDns(ip)` — reverse DNS (PTR) lookup
- `checkBlacklist(ip)` — DNSBL reputation check across 12 blocklists
- `checkSite(url)` — website up/down checker with response time
- `bulkLookup(ips)` — look up up to 50 IPs in one call
- TypeScript definitions for all new methods
- Client-side input validation for IPs, domains, and emails

## [1.0.0] - 2026-04-21

### Added
- Initial release
- `getMyIP()` — IP lookup with geolocation, ISP, and privacy scoring
- `lookup(ip)` — Look up any IP address
- `checkBreach(email)` — Email breach checking
- `getPrivacyScore()` — IP cleanliness and VPN detection
- Full TypeScript type definitions
- ESM and CommonJS dual module support
