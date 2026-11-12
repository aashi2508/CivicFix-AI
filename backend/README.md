# CivicFix backend

Isolated Express/TypeScript API for the CivicFix clients. It uses PostgreSQL through Prisma and never connects during `npm run build`.

## Setup
1. Copy `.env.example` to `.env`, set a real `DATABASE_URL` and a long random `JWT_SECRET`.
2. `npm install` (generates a fresh lockfile for this updated package)
3. `npx prisma migrate deploy` (or `npm run prisma:migrate` during development)
4. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`, then run `npm run seed` to create/update the admin account. Local example: `admin@civicfix.local` / `admin@123`. Development only; change the password before any deployment.
5. `npm run dev` or `npm start`

`npm run build` runs Prisma client generation and TypeScript compilation only. `npm run smoke` verifies the health endpoint without a database.

## API

`POST /api/auth/register` and `POST /api/auth/login` accept `{email,password,name?}` and return a JWT. Send it as `Authorization: Bearer <token>`.

Citizens: `POST /api/complaints` (JSON or multipart field `photo`, JPEG/PNG/WebP, max 5 MB; optional priority `LOW`, `MEDIUM`, `HIGH`, or `URGENT`), `GET /api/complaints`, `GET /api/complaints/:id` (including status history), `PATCH` and `DELETE` while submitted, and public `GET /api/complaints/map`.

Admins: `GET /api/admin/queue`, `POST /api/admin/complaints/:id/ai-review`, correction and status `PATCH` endpoints, and `GET /api/admin/analytics`. Status changes and AI review transitions are written to `StatusHistory`. Statuses are `SUBMITTED`, `IN_REVIEW`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `REJECTED`.

AI review uses a provider-independent vision interface. For OpenAI, set `AI_API_URL=https://api.openai.com/v1`, `AI_MODEL=gpt-4.1-mini`, and put the real key only in the backend's uncommitted `.env` file. The adapter appends `/chat/completions` to a base URL and sends the uploaded image as a server-side data URL. The request asks for strict JSON and the response is validated with Zod. Timeouts, rate limits, invalid output, missing images, and low confidence become an explicit `needsHumanReview` result; no complaint is automatically resolved or treated as an official government decision.

The API key is read only by `backend/src/config.ts` and used only in the server-to-provider request. It is never included in API responses, database records, mobile configuration, or the admin dashboard bundle. Do not commit `.env`; keep the real value out of `.env.example`.

IBM AI is not assumed to be an inference runtime. Only configure an IBM endpoint after confirming that your IBM service exposes a compatible vision inference API and credentials. IBM Bobathon/Bob itself is not used as an API provider by this backend.

`POST /api/admin/complaints/:id/ai-review` persists every result in `AIAnalysis`, returns nearby duplicate suggestions when coordinates and category match, and always leaves the complaint in `IN_REVIEW`. Admin approval and corrections are recorded separately. No measured classification accuracy is claimed: accuracy must be measured against a labeled CivicFix evaluation set before production use.


## Admin dashboard data and live events

All admin endpoints require an ADMIN JWT in `Authorization: Bearer <token>`:
- `GET /api/admin/dashboard` returns registered citizen count, registrations today, currently connected authenticated users, complaint total, status totals, and recent complaints.
- `GET /api/admin/users?q=&page=1&limit=20` returns paginated citizen accounts and each user's complaint count.
- `GET /api/admin/users/:id` returns a citizen profile and complaint history.

Socket.IO is available on the same host/port. Connect with `io(API_URL, { auth: { token } })`.
Authenticated clients are counted once per user even if they have multiple open sockets. Admin sockets join the `admins` room and receive `presence:update`, `user:registered`, `complaint:created`, `complaint:updated`, and `ai:reviewed` events. The dashboard should still refresh its REST data on initial load/reconnect; socket events are incremental updates, not a replacement for fetching authoritative data.
