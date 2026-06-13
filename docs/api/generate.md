# /api/generate

## POST /api/generate
Runs the dog swap: composites the uploaded dog photo into the chosen scene via fal.ai (Gemini 2.5 Flash Image edit). **Server-side only — holds `FAL_KEY`.** Rate-limited and free-capped.

**Request** `multipart/form-data`
| Field | Type | Notes |
|---|---|---|
| sceneId | string | Must be an active scene |
| photo | file | image/jpeg|png|webp, ≤ `MAX_UPLOAD_MB` |
| sessionId | string | From the session cookie (server may read the cookie directly) |

**Flow**
1. Validate `sceneId` is active; validate file type + size **server-side**.
2. Enforce `GENERATE_RATE_PER_MIN` and `MAX_FREE_PROOFS_PER_SESSION` (from `constants.ts`).
3. Upload the photo to Supabase Storage (per-session path).
4. Call fal with the scene image + dog photo + the per-scene tuned instruction.
5. Store the proof image; create a `Proof` row.

**Response** `200 OK`
```json
{ "proofId": "clx...", "proofImageUrl": "https://.../signed...", "status": "done" }
```

**Errors**
| Code | When |
|---|---|
| `VALIDATION_ERROR` (422) | Bad/missing sceneId or file |
| `UNSUPPORTED_MEDIA` (415) | Wrong image type |
| `FILE_TOO_LARGE` (413) | Over `MAX_UPLOAD_MB` |
| `RATE_LIMITED` (429) | Over per-IP rate |
| `FREE_CAP_REACHED` (429) | Over `MAX_FREE_PROOFS_PER_SESSION` |
| `GENERATION_FAILED` (502) | fal error/timeout — client should offer retry; nothing is charged |

**Notes**
- POC uses the cheap model only. High-res print regeneration is Phase 2, gated behind a paid order.
