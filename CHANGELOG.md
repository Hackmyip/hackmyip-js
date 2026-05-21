# Changelog

All notable changes to this project will be documented in this file.

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
