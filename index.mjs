/**
 * HackMyIP API Client (ESM)
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
 */
export async function getMyIP() {
  return request('/ip');
}

/**
 * Look up geolocation and network info for any IP address.
 * @param {string} ip - The IP address to look up
 * @returns {Promise<Object>} IP geolocation and network data
 */
export async function lookup(ip) {
  if (!ip || !IP_RE.test(ip)) throw new Error('A valid IP address is required');
  return request('/lookup', { ip });
}

/**
 * Check if an email address has been exposed in data breaches.
 * @param {string} email - The email address to check
 * @returns {Promise<Object>} Breach data including count, services, risk score
 */
export async function checkBreach(email) {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('A valid email address is required');
  return request('/breach', { email });
}

/**
 * Get your IP's privacy and cleanliness score.
 * @returns {Promise<Object>} Privacy score, grade, and VPN/datacenter detection
 */
export async function getPrivacyScore() {
  return request('/score');
}

/**
 * Look up DNS records for a domain.
 * @param {string} domain - The domain name (e.g. "example.com")
 * @param {string} [type="A"] - Record type: A, AAAA, CNAME, MX, NS, TXT, SOA, SRV, CAA, PTR
 * @returns {Promise<Object>} DNS records and authority section
 */
export async function dnsLookup(domain, type = 'A') {
  const d = cleanDomain(domain);
  if (!d || !DOMAIN_RE.test(d)) throw new Error('A valid domain name is required');
  return request('/dns', { domain: d, type });
}

/**
 * Look up WHOIS / RDAP registration data for a domain.
 * @param {string} domain - The domain name (e.g. "example.com")
 * @returns {Promise<Object>} Registrar, creation/expiration dates, name servers, and status
 */
export async function whois(domain) {
  const d = cleanDomain(domain);
  if (!d || !DOMAIN_RE.test(d)) throw new Error('A valid domain name is required');
  return request('/whois', { domain: d });
}

/**
 * Reverse DNS (PTR) lookup for an IP address.
 * @param {string} ip - The IP address (IPv4)
 * @returns {Promise<Object>} Hostname and PTR record for the IP
 */
export async function reverseDns(ip) {
  if (!ip || !IP_RE.test(ip)) throw new Error('A valid IP address is required');
  return request('/rdns', { ip });
}

/**
 * Check whether an IP is listed on major DNS blacklists (DNSBLs).
 * @param {string} ip - The IPv4 address to check
 * @returns {Promise<Object>} Blacklist results, listed count, and status
 */
export async function checkBlacklist(ip) {
  if (!ip || !/^[\d.]+$/.test(ip)) throw new Error('A valid IPv4 address is required');
  return request('/blacklist', { ip });
}

/**
 * Check whether a website or service is up or down.
 * @param {string} url - The URL or hostname to check (protocol optional)
 * @returns {Promise<Object>} Up/down status, status code, and response time
 */
export async function checkSite(url) {
  if (!url || typeof url !== 'string') throw new Error('A URL is required');
  return request('/down', { url });
}

/**
 * Look up multiple IP addresses in one request (max 50).
 * @param {string[]} ips - Array of IP addresses
 * @returns {Promise<Object>} Per-IP geolocation and network results
 */
export async function bulkLookup(ips) {
  if (!Array.isArray(ips) || ips.length === 0) throw new Error('An array of IP addresses is required');
  return request('/bulk', {}, { method: 'POST', body: { ips } });
}

export default {
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
