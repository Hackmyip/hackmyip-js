'use strict';

const { test, afterEach } = require('node:test');
const assert = require('node:assert');
const client = require('../index.js');

const realFetch = globalThis.fetch;

function mockFetch(responder) {
  const calls = [];
  globalThis.fetch = async (url, opts = {}) => {
    calls.push({ url, opts });
    return responder(url, opts);
  };
  return calls;
}

function ok(data) {
  return { ok: true, status: 200, statusText: 'OK', json: async () => ({ success: true, data }) };
}

afterEach(() => {
  globalThis.fetch = realFetch;
});

// ---- happy paths: correct URL, method, and data unwrapping ----

test('getMyIP hits /api/ip and returns data', async () => {
  const calls = mockFetch(() => ok({ ip: '1.2.3.4' }));
  const data = await client.getMyIP();
  assert.equal(data.ip, '1.2.3.4');
  assert.match(calls[0].url, /\/api\/ip$/);
  assert.equal(calls[0].opts.method, 'GET');
});

test('lookup builds /api/lookup?ip=', async () => {
  const calls = mockFetch(() => ok({ ip: '8.8.8.8' }));
  await client.lookup('8.8.8.8');
  assert.match(calls[0].url, /\/api\/lookup\?ip=8\.8\.8\.8$/);
});

test('getPrivacyScore hits /api/score', async () => {
  const calls = mockFetch(() => ok({ privacy: { grade: 'A' } }));
  const data = await client.getPrivacyScore();
  assert.equal(data.privacy.grade, 'A');
  assert.match(calls[0].url, /\/api\/score$/);
});

test('checkBreach encodes email', async () => {
  const calls = mockFetch(() => ok({ breaches: 0 }));
  await client.checkBreach('user@example.com');
  assert.match(calls[0].url, /\/api\/breach\?email=user%40example\.com$/);
});

test('dnsLookup passes domain and type', async () => {
  const calls = mockFetch(() => ok({ records: [] }));
  await client.dnsLookup('example.com', 'MX');
  assert.match(calls[0].url, /\/api\/dns\?domain=example\.com&type=MX$/);
});

test('dnsLookup defaults type to A and strips protocol/www', async () => {
  const calls = mockFetch(() => ok({ records: [] }));
  await client.dnsLookup('https://www.example.com/path');
  assert.match(calls[0].url, /\/api\/dns\?domain=example\.com&type=A$/);
});

test('whois cleans and passes domain', async () => {
  const calls = mockFetch(() => ok({ registrar: 'X' }));
  await client.whois('example.com');
  assert.match(calls[0].url, /\/api\/whois\?domain=example\.com$/);
});

test('reverseDns builds /api/rdns?ip=', async () => {
  const calls = mockFetch(() => ok({ hostname: 'dns.google' }));
  const data = await client.reverseDns('8.8.8.8');
  assert.equal(data.hostname, 'dns.google');
  assert.match(calls[0].url, /\/api\/rdns\?ip=8\.8\.8\.8$/);
});

test('checkBlacklist builds /api/blacklist?ip=', async () => {
  const calls = mockFetch(() => ok({ status: 'CLEAN' }));
  const data = await client.checkBlacklist('203.0.113.42');
  assert.equal(data.status, 'CLEAN');
  assert.match(calls[0].url, /\/api\/blacklist\?ip=203\.0\.113\.42$/);
});

test('checkSite builds /api/down?url=', async () => {
  const calls = mockFetch(() => ok({ is_up: true }));
  const data = await client.checkSite('example.com');
  assert.equal(data.is_up, true);
  assert.match(calls[0].url, /\/api\/down\?url=example\.com$/);
});

test('bulkLookup POSTs a JSON body', async () => {
  const calls = mockFetch(() => ok({ total: 2, results: [] }));
  await client.bulkLookup(['8.8.8.8', '1.1.1.1']);
  const { url, opts } = calls[0];
  assert.match(url, /\/api\/bulk$/);
  assert.equal(opts.method, 'POST');
  assert.equal(opts.headers['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(opts.body), { ips: ['8.8.8.8', '1.1.1.1'] });
});

// ---- validation guards: throw without touching the network ----

test('lookup rejects empty input', async () => {
  let called = false;
  mockFetch(() => { called = true; return ok({}); });
  await assert.rejects(() => client.lookup(''), /valid IP/);
  assert.equal(called, false);
});

test('checkBreach rejects malformed email', async () => {
  await assert.rejects(() => client.checkBreach('not-an-email'), /valid email/);
});

test('dnsLookup rejects empty domain', async () => {
  await assert.rejects(() => client.dnsLookup(''), /valid domain/);
});

test('whois rejects bad domain', async () => {
  await assert.rejects(() => client.whois('not a domain'), /valid domain/);
});

test('checkBlacklist rejects non-IPv4', async () => {
  await assert.rejects(() => client.checkBlacklist('example.com'), /valid IPv4/);
});

test('bulkLookup rejects empty array', async () => {
  await assert.rejects(() => client.bulkLookup([]), /array of IP/);
});

// ---- error handling ----

test('throws API error message on non-ok response', async () => {
  mockFetch(() => ({ ok: false, status: 400, statusText: 'Bad Request', json: async () => ({ error: 'Domain parameter required' }) }));
  await assert.rejects(() => client.dnsLookup('example.com'), /Domain parameter required/);
});

test('throws when success is false', async () => {
  mockFetch(() => ({ ok: true, status: 200, json: async () => ({ success: false, error: 'Unknown API error' }) }));
  await assert.rejects(() => client.getMyIP(), /Unknown API error/);
});

test('surfaces a friendly timeout error', async () => {
  globalThis.fetch = async () => {
    const err = new Error('aborted');
    err.name = 'TimeoutError';
    throw err;
  };
  await assert.rejects(() => client.getMyIP(), /timed out/);
});
