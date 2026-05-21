/**
 * HackMyIP API Client
 * Free IP lookup, geolocation, breach checking, DNS, WHOIS, and privacy scoring.
 * https://hackmyip.com
 *
 * No API key required. Free for non-commercial use.
 */

const BASE_URL = 'https://hackmyip.com/api';
const REQUEST_TIMEOUT_MS = 15000;

async function request(endpoint, params = {}, { method = 'GET', body } = {}) {
  const query = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  const url = `${BASE_URL}${endpoint}${query ? '?' + query : ''}`;
  const opts = { method, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) };
  if (body !== undefined) {
    opts.headers = { 'Content-Type': 'application/json' };
    opts.body = JSON.stringify(body);
  }
  let resp;
  try {
    resp = await fetch(url, opts);
  } catch (e) {
    if (e && e.name === 'TimeoutError') throw new Error(`Request timed out after ${REQUEST_TIMEOUT_MS}ms`);
    throw new Error(`Network request failed: ${e.message}`);
  }
  if (!resp.ok) {
    const errBody = await resp.json().catch(() => ({}));
    throw new Error(errBody.error || `API request failed with status ${resp.status}`);
  }
  const json = await resp.json();
  if (!json.success) throw new Error(json.error || 'Unknown API error');
  return json.data;
}

const DOMAIN_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/i;
const IP_RE = /^[\d.:a-fA-F]+$/;

function cleanDomain(input) {
  return String(input || '')
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .replace(/^www\./i, '')
    .toLowerCase()
    .trim();
}

/**
 * Get your public IP address with geolocation, ISP, and privacy info.
 * @returns {Promise<Object>} IP data including location, network, and privacy score
 * @example
 * const data = await hackmyip.getMyIP();
 * console.log(data.ip);            // "203.0.113.42"
 * console.log(data.location.city); // "Tokyo"
 * console.log(data.privacy.grade); // "A"
 */
async function getMyIP() {
  return request('/ip');
}

/**
 * Look up geolocation and network info for any IP address.
 * @param {string} ip - The IP address to look up
 * @returns {Promise<Object>} IP geolocation and network data
 * @example
 * const data = await hackmyip.lookup("8.8.8.8");
 * console.log(data.location.city); // "Mountain View"
 */
async function lookup(ip) {
  if (!ip || !IP_RE.test(ip)) throw new Error('A valid IP address is required');
  return request('/lookup', { ip });
}

/**
 * Check if an email address has been exposed in data breaches.
 * @param {string} email - The email address to check
 * @returns {Promise<Object>} Breach data including count, services, risk score, and password exposure
 * @example
 * const data = await hackmyip.checkBreach("user@example.com");
 * console.log(data.breaches);   // 13
 * console.log(data.risk.level); // "high"
 */
async function checkBreach(email) {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('A valid email address is required');
  return request('/breach', { email });
}

/**
 * Get your IP's privacy and cleanliness score.
 * Detects VPN, datacenter, or residential IP and provides a grade.
 * @returns {Promise<Object>} Privacy score including grade, type, and flags
 * @example
 * const data = await hackmyip.getPrivacyScore();
 * console.log(data.privacy.grade);  // "A"
 * console.log(data.privacy.is_vpn); // false
 */
async function getPrivacyScore() {
  return request('/score');
}

/**
 * Look up DNS records for a domain.
 * @param {string} domain - The domain name (e.g. "example.com")
 * @param {string} [type="A"] - Record type: A, AAAA, CNAME, MX, NS, TXT, SOA, SRV, CAA, PTR
 * @returns {Promise<Object>} DNS records and authority section
 * @example
 * const data = await hackmyip.dnsLookup("example.com", "MX");
 * console.log(data.records); // [{ name, type, TTL, data }, ...]
 */
async function dnsLookup(domain, type = 'A') {
  const d = cleanDomain(domain);
  if (!d || !DOMAIN_RE.test(d)) throw new Error('A valid domain name is required');
  return request('/dns', { domain: d, type });
}

/**
 * Look up WHOIS / RDAP registration data for a domain.
 * @param {string} domain - The domain name (e.g. "example.com")
 * @returns {Promise<Object>} Registrar, creation/expiration dates, name servers, and status
 * @example
 * const data = await hackmyip.whois("example.com");
 * console.log(data.registrar);       // "MarkMonitor Inc."
 * console.log(data.expiration_date); // "2026-08-13T04:00:00Z"
 */
async function whois(domain) {
  const d = cleanDomain(domain);
  if (!d || !DOMAIN_RE.test(d)) throw new Error('A valid domain name is required');
  return request('/whois', { domain: d });
}

/**
 * Reverse DNS (PTR) lookup for an IP address.
 * @param {string} ip - The IP address (IPv4)
 * @returns {Promise<Object>} Hostname and PTR record for the IP
 * @example
 * const data = await hackmyip.reverseDns("8.8.8.8");
 * console.log(data.hostname); // "dns.google"
 */
async function reverseDns(ip) {
  if (!ip || !IP_RE.test(ip)) throw new Error('A valid IP address is required');
  return request('/rdns', { ip });
}

/**
 * Check whether an IP is listed on major DNS blacklists (DNSBLs).
 * @param {string} ip - The IPv4 address to check
 * @returns {Promise<Object>} Blacklist results, listed count, and clean/warning/blacklisted status
 * @example
 * const data = await hackmyip.checkBlacklist("203.0.113.42");
 * console.log(data.status);       // "CLEAN"
 * console.log(data.listed_count); // 0
 */
async function checkBlacklist(ip) {
  if (!ip || !/^[\d.]+$/.test(ip)) throw new Error('A valid IPv4 address is required');
  return request('/blacklist', { ip });
}

/**
 * Check whether a website or service is up or down.
 * @param {string} url - The URL or hostname to check (protocol optional)
 * @returns {Promise<Object>} Up/down status, status code, and response time
 * @example
 * const data = await hackmyip.checkSite("example.com");
 * console.log(data.is_up);            // true
 * console.log(data.response_time_ms); // 142
 */
async function checkSite(url) {
  if (!url || typeof url !== 'string') throw new Error('A URL is required');
  return request('/down', { url });
}

/**
 * Look up multiple IP addresses in one request (max 50).
 * @param {string[]} ips - Array of IP addresses
 * @returns {Promise<Object>} Per-IP geolocation and network results
 * @example
 * const data = await hackmyip.bulkLookup(["8.8.8.8", "1.1.1.1"]);
 * console.log(data.results); // [{ ip, country, city, isp, ... }, ...]
 */
async function bulkLookup(ips) {
  if (!Array.isArray(ips) || ips.length === 0) throw new Error('An array of IP addresses is required');
  return request('/bulk', {}, { method: 'POST', body: { ips } });
}

module.exports = {
  getMyIP,
  lookup,
  checkBreach,
  getPrivacyScore,
  dnsLookup,
  whois,
  reverseDns,
  checkBlacklist,
  checkSite,
  bulkLookup,
};
