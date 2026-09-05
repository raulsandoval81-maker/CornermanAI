# Match Backend Phase 1

CornermanAI keeps its existing static UI and adds a narrow durable boundary for Match records.

## Authentication

Visit `/auth/` and enter the single internal access password. The server compares it with `CORNERMAN_ACCESS_PASSWORD` and, on success, issues a 12-hour HMAC-signed `HttpOnly`, `Secure`, `SameSite=Strict` cookie. Browser code never receives or stores the password, session secret, or KV token.

## Required Vercel environment variables

- `CORNERMAN_ACCESS_PASSWORD`
- `CORNERMAN_SESSION_SECRET` (a long random value)
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

The KV values are the REST credentials for a Vercel KV-compatible Upstash Redis database. Match data is stored under `cornerman:matches:v1`.

## Phase 1 concurrency limit

The server currently persists the collection with a `GET → modify → SET` cycle. This is intentionally a single-user Phase 1 design and is not safe for concurrent multi-user writes. Before any multi-user rollout, move Matches to per-record keys and/or use transactional compare-and-set operations so simultaneous writes cannot overwrite one another.

## Transitional browser storage

- Cache: `cornerman_matches`
- One-time migration marker: `cornerman_matches_backend_migration_v1`
- Pending writes: `cornerman_matches_outbox_v1`

History and Detail prefer authenticated backend records and fall back to the cache. A failed Console write remains in both the cache and outbox and is retried on the next authenticated Match list operation.
