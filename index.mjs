/**
 * HackMyIP API Client (ESM)
 * Free IP lookup, email breach checking, and privacy scoring.
 * https://hackmyip.com
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

export async function getMyIP() { return request('/ip'); }
export async function lookup(ip) { if (!ip) throw new Error('IP address is required'); return request('/lookup', { ip }); }
export async function checkBreach(email) { if (!email || !email.includes('@')) throw new Error('Valid email address is required'); return request('/breach', { email }); }
export async function getPrivacyScore() { return request('/score'); }
export default { getMyIP, lookup, checkBreach, getPrivacyScore };
