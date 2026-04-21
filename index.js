/**
 * HackMyIP API Client
 * Free IP lookup, email breach checking, and privacy scoring.
 * https://hackmyip.com
 *
 * No API key required. Free for non-commercial use.
 */

const BASE_URL = 'https://hackmyip.com/api';

async function request(endpoint, params = {}) {
  const query = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  const url = `${BASE_URL}${endpoint}${query ? '?' + query : ''}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    throw new Error(body.error || `API request failed with status ${resp.status}`);
  }
  const json = await resp.json();
  if (!json.success) throw new Error(json.error || 'Unknown API error');
  return json.data;
}

/**
 * Get your public IP address with geolocation, ISP, and privacy info.
 * @returns {Promise<Object>} IP data including location, network, and privacy score
 * @example
 * const data = await hackmyip.getMyIP();
 * console.log(data.ip);           // "203.0.113.42"
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
  if (!ip) throw new Error('IP address is required');
  return request('/lookup', { ip });
}

/**
 * Check if an email address has been exposed in data breaches.
 * @param {string} email - The email address to check
 * @returns {Promise<Object>} Breach data including count, services, risk score, and password exposure
 * @example
 * const data = await hackmyip.checkBreach("user@example.com");
 * console.log(data.breaches);       // 13
 * console.log(data.risk.level);     // "high"
 * console.log(data.services);       // ["Adobe", "LinkedIn", ...]
 */
async function checkBreach(email) {
  if (!email || !email.includes('@')) throw new Error('Valid email address is required');
  return request('/breach', { email });
}

/**
 * Get your IP's privacy and cleanliness score.
 * Detects VPN, datacenter, or residential IP and provides a grade.
 * @returns {Promise<Object>} Privacy score including grade, type, and flags
 * @example
 * const data = await hackmyip.getPrivacyScore();
 * console.log(data.privacy.grade);   // "A"
 * console.log(data.privacy.is_vpn);  // false
 * console.log(data.privacy.score);   // 90
 */
async function getPrivacyScore() {
  return request('/score');
}

module.exports = { getMyIP, lookup, checkBreach, getPrivacyScore };
