# Fastify.js Core for Particula

[![license](https://img.shields.io/github/license/mashape/apistatus.svg?maxAge=2592000)](https://opensource.org/licenses/MIT)

## Notes & limitations

- Route methods use Fastify `(request, reply)` signature
- Because of the way Fastify works - routes hot-reload is not supported.

## How to use

### Setup

Install it:

```bash
npm install --save particula-core-fastify
```

Particula will detect it automatically and start using instead of default Express.js core.
