# Contributing

Thanks for your interest in improving the HackMyIP API client!

## Reporting bugs

[Open an issue](https://github.com/hackmyip/hackmyip-js/issues) with:

- what you called and what you expected
- what actually happened (error message, output)
- your Node.js version

## Development

This package has **zero runtime dependencies** and uses Node's built-in test runner.

```bash
git clone https://github.com/hackmyip/hackmyip-js.git
cd hackmyip-js
npm test
```

Tests live in `test/` and run with `node --test`. They mock `fetch`, so no network access is required.

When changing the client, please update:

- `index.js` (CommonJS) and `index.mjs` (ESM) — keep them in sync
- `index.d.ts` — TypeScript definitions
- `README.md` — the methods table and examples
- `test/client.test.js` — add coverage for new behavior

## Suggesting a tool

The tool catalog shown on [hackmyip.com](https://hackmyip.com) is maintained on the site itself. To suggest a new tool or report incorrect data, open an issue describing it.

## Code style

- 2-space indentation, semicolons
- No new runtime dependencies without discussion
- Validate inputs at the boundary and throw clear `Error` messages
