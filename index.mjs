/**
 * HackMyIP API Client (ESM)
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
  if (!ip) throw new Error('IP address is required');
  return request('/lookup', { ip });
}

/**
 * Check if an email address has been exposed in data breaches.
 * @param {string} email - The email address to check
 * @returns {Promise<Object>} Breach data including count, services, risk score
 */
export async function checkBreach(email) {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Valid email address is required');
  return request('/breach', { email });
}

/**
 * Get your IP's privacy and cleanliness score.
 * @returns {Promise<Object>} Privacy score, grade, and VPN/datacenter detection
 */
export async function getPrivacyScore() {
  return request('/score');
}

export default { getMyIP, lookup, checkBreach, getPrivacyScore };
