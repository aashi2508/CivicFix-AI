# CivicFix AI — Admin Panel

This is the existing CivicFix Admin UI with operational API wiring. The visual theme and page layout are retained.

## Requirements
- Node.js 18+
- CivicFix backend running on port 4000
- Neon PostgreSQL configured by the backend

## Setup
1. Extract this folder.
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. Set `VITE_API_URL=http://localhost:4000`.
5. Run `npm run dev`.

## Admin sign-in
Use the admin account created by the backend seed script. Do not use the development seed password in a public deployment; change it first.

## Connected functionality
- Authenticated admin sign-in and sign-out.
- Live complaint list from `GET /api/complaints` (admin role receives all citizen reports).
- Automatic refresh every 10 seconds, plus the header refresh control.
- Dashboard counts from `GET /api/admin/dashboard`.
- User search/list from `GET /api/admin/users?q=...`.
- Complaint status and priority changes persisted through admin APIs.
- AI analysis initiated through `POST /api/admin/complaints/:id/ai-review`.
- AI suggestion approval and category correction through admin APIs.
- Map markers use actual latitude/longitude only; no fabricated locations.

## Backend compatibility
Use the companion `CivicFix_Backend_Admin_Fixed.zip`. It includes the existing admin routes and returns the latest AI analysis with each complaint. Keep your existing `.env` and database credentials; do not overwrite them with sample values.

## Important
AI output is advisory and must be reviewed by an administrator. Empty database results are shown as empty; demo seed complaints are not silently displayed as live reports.
