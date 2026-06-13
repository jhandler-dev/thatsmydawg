# That's My Dawg — API Reference

All server endpoints are Next.js App Router **route handlers** under `/api`. They run server-side and are the only place secret keys are used.

**Conventions**
- Request/response bodies are JSON (uploads are `multipart/form-data`).
- Errors use a uniform shape: `{ "error": "Human-readable message", "code": "SCREAMING_SNAKE_CASE" }`.
- Timestamps are ISO 8601 UTC.
- Inputs to mutating routes are validated (Zod); invalid input returns `422 VALIDATION_ERROR`.
- One doc file per endpoint group in `docs/api/`. Claude updates the relevant file in the same session as any endpoint change.

## Endpoint Index

| Method | Path | Auth | Doc |
|---|---|---|---|
| GET | `/api/health` | None | Below |
| GET | `/api/scenes` | None | `api/scenes.md` |
| POST | `/api/generate` | None (rate-limited + free-capped) | `api/generate.md` |
| POST | `/api/checkout` | None | `api/checkout.md` |
| POST | `/api/webhooks/stripe` | Stripe signature | `api/checkout.md` |
| GET | `/api/orders` | Admin secret | `api/orders.md` |
| PATCH | `/api/orders/:id` | Admin secret | `api/orders.md` |

## GET /api/health
Server health check. No auth.

**Response** `200 OK`
```json
{ "status": "ok" }
```

## Other Reference Docs

| File | Contents |
|---|---|
| `data-model.md` | Schema — models, fields, relationships |
| `workflow.md` | Branching, CI/CD, deploy mapping, post-merge sync |
| `security-and-privacy.md` | Secrets, uploads, payments, PII, deferred hardening |
