#!/usr/bin/env node
/**
 * hackmyip CLI — your IP, location, network, and privacy from the terminal.
 *
 *   npx hackmyip                 your IP + location + network (summary)
 *   npx hackmyip ip              your public IP only (raw, pipe-friendly)
 *   npx hackmyip json            full JSON (IP + city + country + asn + org)
 *   npx hackmyip proxy           VPN / proxy / datacenter verdict for your IP
 *   npx hackmyip lookup <ip>     geolocation + network for any IP
 *   npx hackmyip dns <domain> [type]   DNS records (A, AAAA, MX, NS, TXT, ...)
 *   npx hackmyip blacklist <ip>  DNSBL reputation across major blocklists
 *   npx hackmyip whois <domain>  WHOIS / RDAP registration data
 *   npx hackmyip help            this menu
 *
 * No API key. No signup. Uses the public hackmyip.com API.
 * Requires Node 18+ (global fetch).
 */

'use strict';

const SITE = 'https://hackmyip.com';
const REQUEST_TIMEOUT_MS = 15000;
// Identify as a CLI client. The "curl/" token is what hackmyip.com keys on to
// serve clean text/JSON instead of the full HTML site.
const USER_AGENT = 'hackmyip-cli (+https://hackmyip.com) curl/0';

// --- color (auto-disabled when not a TTY or NO_COLOR is set) -----------------

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;

function paint(code) {
  return (s) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : String(s));
}

const c = {
  teal: paint('38;5;43'), // hackmyip accent (#00d4aa-ish)
  bold: paint('1'),
  dim: paint('2'),
  green: paint('32'),
  yellow: paint('33'),
  red: paint('31'),
  cyan: paint('36'),
};

function label(text) {
  // Fixed-width label so columns line up (always keeps a gap before the value).
  return c.dim(text.padEnd(10));
}

// --- fetch helpers -----------------------------------------------------------

async function getText(path) {
  return doFetch(path, (r) => r.text());
}

async function getJson(path) {
  return doFetch(path, (r) => r.json());
}

async function doFetch(path, parse) {
  const url = path.startsWith('http') ? path : `${SITE}${path}`;
  let resp;
  try {
    resp = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json, text/plain, */*' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (e) {
    if (e && e.name === 'TimeoutError') {
      throw new Error(`request timed out after ${REQUEST_TIMEOUT_MS}ms`);
    }
    throw new Error(`network request failed: ${e.message}`);
  }
  if (!resp.ok) {
    throw new Error(`request failed with status ${resp.status} ${resp.statusText}`);
  }
  return parse(resp);
}

// Calls the JSON API (/api/...) and unwraps the { success, data } envelope.
// The API returns a useful { success:false, error } body even on 4xx, so we
// parse the body regardless of status to surface the real message.
async function apiData(endpoint, params = {}) {
  const query = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  const url = `${SITE}/api${endpoint}${query ? '?' + query : ''}`;
  let resp;
  try {
    resp = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (e) {
    if (e && e.name === 'TimeoutError') {
      throw new Error(`request timed out after ${REQUEST_TIMEOUT_MS}ms`);
    }
    throw new Error(`network request failed: ${e.message}`);
  }
  const json = await resp.json().catch(() => null);
  if (!json || !json.success) {
    throw new Error((json && json.error) || `request failed with status ${resp.status}`);
  }
  return json.data;
}

// --- commands ----------------------------------------------------------------

async function cmdSummary() {
  const d = await getJson('/json');
  const loc = [d.city, d.country].filter(Boolean).join(', ') || 'unknown';
  const out = [
    `${label('IP')}${c.teal(c.bold(d.ip || 'unknown'))}`,
    `${label('Location')}${loc}`,
    `${label('Network')}${[d.asn, d.org].filter(Boolean).join('  ')}`,
  ];
  print(out.join('\n'));
  print('');
  print(c.dim(`More: ${c.teal('npx hackmyip help')}  ·  ${SITE}`));
}

async function cmdIp() {
  const ip = (await getText('/ip')).trim();
  print(ip);
}

async function cmdJson() {
  const d = await getJson('/json');
  print(JSON.stringify(d, null, 2));
}

async function cmdProxy() {
  // The site's /proxy endpoint already prints a tidy verdict for your own IP.
  const text = (await getText('/proxy')).trim();
  if (!useColor) {
    print(text);
    return;
  }
  // Lightly colorize the verdict line.
  const colored = text
    .split('\n')
    .map((line) => {
      const m = line.match(/^proxy:\s*(\S+)/i);
      if (m) {
        const yes = /yes|true/i.test(m[1]);
        const verdict = yes ? c.red(m[1]) : c.green(m[1]);
        return line.replace(m[1], verdict);
      }
      return line;
    })
    .join('\n');
  print(colored);
}

async function cmdLookup(ip) {
  if (!ip) throw new Error('usage: hackmyip lookup <ip>');
  const d = await apiData('/lookup', { ip });
  const loc = d.location || {};
  const net = d.network || {};
  const place = [loc.city, loc.region, loc.country_name || loc.country].filter(Boolean).join(', ');
  const out = [
    `${label('IP')}${c.teal(c.bold(d.ip))}`,
    `${label('Location')}${place || 'unknown'}`,
    `${label('Network')}${[net.asn ? 'AS' + net.asn : null, net.isp].filter(Boolean).join('  ')}`,
  ];
  if (net.org) out.push(`${label('Org')}${net.org}`);
  if (loc.timezone) out.push(`${label('Timezone')}${loc.timezone}`);
  if (d.privacy && d.privacy.hosting) out.push(`${label('Flags')}${c.yellow('hosting/datacenter')}`);
  print(out.join('\n'));
}

async function cmdDns(domain, type) {
  if (!domain) throw new Error('usage: hackmyip dns <domain> [type]');
  const d = await apiData('/dns', { domain, type: (type || 'A').toUpperCase() });
  print(`${c.bold(d.domain)} ${c.dim(d.type)}`);
  const records = d.records || [];
  if (records.length === 0) {
    print(c.dim('  (no records)'));
    return;
  }
  for (const r of records) {
    print(`  ${c.teal((r.data || '').toString())}  ${c.dim('TTL ' + r.TTL)}`);
  }
}

async function cmdBlacklist(ip) {
  if (!ip) throw new Error('usage: hackmyip blacklist <ip>');
  const d = await apiData('/blacklist', { ip });
  const statusColor =
    d.status === 'CLEAN' ? c.green : d.status === 'WARNING' ? c.yellow : c.red;
  print(`${label('IP')}${c.bold(d.ip)}`);
  print(`${label('Status')}${statusColor(c.bold(d.status))}`);
  print(`${label('Listed')}${d.listed_count}/${d.total_checked} blocklists`);
  const listed = (d.results || []).filter((r) => r.listed);
  for (const r of listed) {
    print(`  ${c.red('•')} ${r.name} ${c.dim('(' + r.zone + ')')}`);
  }
}

async function cmdWhois(domain) {
  if (!domain) throw new Error('usage: hackmyip whois <domain>');
  const d = await apiData('/whois', { domain });
  const out = [
    `${label('Domain')}${c.bold(d.domain)}`,
    `${label('Registrar')}${d.registrar || 'unknown'}`,
  ];
  if (d.creation_date) out.push(`${label('Created')}${fmtDate(d.creation_date)}`);
  if (d.expiration_date) out.push(`${label('Expires')}${fmtDate(d.expiration_date)}`);
  if (Array.isArray(d.name_servers) && d.name_servers.length) {
    out.push(`${label('NS')}${d.name_servers.join(', ')}`);
  }
  print(out.join('\n'));
}

function fmtDate(iso) {
  // Show just the date part if it parses; otherwise pass through.
  const m = String(iso).match(/^\d{4}-\d{2}-\d{2}/);
  return m ? m[0] : iso;
}

function cmdHelp() {
  const lines = [
    c.teal(c.bold('hackmyip')) + c.dim(' — your IP, network & privacy from the terminal'),
    '',
    c.bold('Usage:') + ' npx hackmyip [command] [args]',
    '',
    `  ${c.teal('npx hackmyip')}                 your IP + location + network`,
    `  ${c.teal('npx hackmyip ip')}              your public IP only (raw, pipe-friendly)`,
    `  ${c.teal('npx hackmyip json')}            full JSON (IP, city, country, asn, org)`,
    `  ${c.teal('npx hackmyip proxy')}           VPN / proxy / datacenter verdict for your IP`,
    `  ${c.teal('npx hackmyip lookup')} <ip>     geolocation + network for any IP`,
    `  ${c.teal('npx hackmyip dns')} <domain> [type]  DNS records (A, AAAA, MX, NS, TXT, ...)`,
    `  ${c.teal('npx hackmyip blacklist')} <ip>  DNSBL reputation across major blocklists`,
    `  ${c.teal('npx hackmyip whois')} <domain>  WHOIS / RDAP registration data`,
    `  ${c.teal('npx hackmyip help')}            this menu`,
    '',
    c.dim('No API key. No signup. Powered by ' + SITE),
  ];
  print(lines.join('\n'));
}

// --- output ------------------------------------------------------------------

function print(s) {
  process.stdout.write(s + '\n');
}

// --- dispatch ----------------------------------------------------------------

async function main(argv) {
  const [command, ...rest] = argv;

  switch ((command || '').toLowerCase()) {
    case undefined:
    case '':
      return cmdSummary();
    case 'ip':
      return cmdIp();
    case 'json':
      return cmdJson();
    case 'proxy':
    case 'vpn':
      return cmdProxy();
    case 'lookup':
      return cmdLookup(rest[0]);
    case 'dns':
      return cmdDns(rest[0], rest[1]);
    case 'blacklist':
      return cmdBlacklist(rest[0]);
    case 'whois':
      return cmdWhois(rest[0]);
    case 'help':
    case '-h':
    case '--help':
      cmdHelp();
      return;
    case 'version':
    case '-v':
    case '--version': {
      const pkg = require('../package.json');
      print(pkg.version);
      return;
    }
    default:
      process.stderr.write(c.red(`unknown command: ${command}`) + '\n');
      cmdHelp();
      process.exitCode = 1;
  }
}

main(process.argv.slice(2)).catch((err) => {
  process.stderr.write(c.red('error: ') + (err && err.message ? err.message : String(err)) + '\n');
  process.exitCode = 1;
});
