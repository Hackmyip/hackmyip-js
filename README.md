# hackmyip

Free API client for IP lookup, email breach checking, and privacy scoring. No API key required.

[![npm](https://img.shields.io/npm/v/hackmyip)](https://www.npmjs.com/package/hackmyip)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

## Install

```bash
npm install hackmyip
```

## Usage

### Get Your IP

```javascript
const { getMyIP } = require('hackmyip');

const data = await getMyIP();
console.log(data.ip);              // "203.0.113.42"
console.log(data.location.city);   // "Tokyo"
console.log(data.location.country);// "JP"
console.log(data.network.isp);     // "NTT Communications"
console.log(data.privacy.grade);   // "A"
console.log(data.privacy.is_vpn);  // false
```

### Look Up Any IP

```javascript
const { lookup } = require('hackmyip');

const data = await lookup("8.8.8.8");
console.log(data.location.city);   // "Mountain View"
console.log(data.network.isp);     // "Google LLC"
```

### Check Email Breaches

```javascript
const { checkBreach } = require('hackmyip');

const data = await checkBreach("user@example.com");
console.log(data.breaches);        // 13
console.log(data.risk.level);      // "high"
console.log(data.risk.score);      // 71
console.log(data.services);        // ["Adobe", "LinkedIn", "Canva", ...]
console.log(data.passwords);       // { plain_text: 3, weak_hash: 2, strong_hash: 3, ... }
```

### Get Privacy Score

```javascript
const { getPrivacyScore } = require('hackmyip');

const data = await getPrivacyScore();
console.log(data.privacy.score);   // 90
console.log(data.privacy.grade);   // "A"
console.log(data.privacy.type);    // "residential"
console.log(data.privacy.is_vpn);  // false
```

## ESM

```javascript
import hackmyip from 'hackmyip';

const ip = await hackmyip.getMyIP();
const breach = await hackmyip.checkBreach("user@example.com");
```

## API Endpoints

| Endpoint | Description | Parameters |
|----------|-------------|------------|
| `GET /api/ip` | Your IP + geolocation + privacy score | None |
| `GET /api/lookup` | Look up any IP address | `ip` (required) |
| `GET /api/breach` | Email breach check | `email` (required) |
| `GET /api/score` | IP cleanliness + VPN detection | None |

Full API docs: [hackmyip.com/api](https://hackmyip.com/api)

## Features

- **No API key required** - zero friction, start immediately
- **Free** - no usage limits for reasonable use
- **Fast** - powered by Cloudflare's global edge network
- **Privacy-first** - we don't log or store your queries
- **TypeScript support** - full type definitions included

## What Makes This Different

Most IP APIs only do geolocation. HackMyIP also provides:

- **Email breach checking** (free - most competitors charge for this)
- **Privacy scoring** (unique - grade your IP's cleanliness)
- **VPN/datacenter/residential detection**
- **Risk assessment** for breached emails

## Related Tools

- [hackmyip.com](https://hackmyip.com) - Full privacy toolkit (12 tools)
- [Email Leak Checker](https://hackmyip.com/breach) - Check breaches in browser
- [Privacy Checkup](https://hackmyip.com/checkup) - Get your privacy grade
- [Speed Test](https://hackmyip.com/speed) - Test connection speed
- [Browser Fingerprint](https://hackmyip.com/fingerprint) - How unique are you?

## License

MIT
