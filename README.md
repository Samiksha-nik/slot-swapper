# Slot Swapper

A simple slot-trading app where users can mark their calendar events as swappable and request swaps with other users.

- Frontend: React (Vite + TailwindCSS), React Router DOM, Axios
- Backend: Node.js + Express, Mongoose, bcryptjs, jsonwebtoken, cors, dotenv

## Overview & Design Choices

- Authentication: stateless JWT stored in `localStorage`, sent as `Authorization: Bearer <token>` via Axios interceptor.
- Data model: `User`, `Event`, `SwapRequest`. Event statuses: `BUSY`, `SWAPPABLE`, `SWAP_PENDING`.
- Swap flow: requester proposes swapping two `SWAPPABLE` events → both become `SWAP_PENDING` → recipient accepts/rejects; on accept, event `userId`s are swapped and both become `BUSY`.
- Separation of concerns: DB connection in `backend/config/db.js`, auth middleware in `backend/middleware/authMiddleware.js`, routes grouped by feature.

## Monorepo Structure

- `backend/` Express API
- `frontend/` Vite React app

## Prerequisites

- Node.js 18+ and npm
- MongoDB locally (`mongodb://localhost:27017`) or a remote URI

## Setup & Run (Step-by-step)

1) Install dependencies

```bash
# From repo root
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

2) Configure environment variables

- Copy examples and adjust values as needed:

```bash
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env
```

Backend `.env`
- `PORT` (default 5000)
- `MONGODB_URI` (or `MONGO_URI`) e.g. `mongodb://localhost:27017/slot_swapper`
- `JWT_SECRET` (secure random string)
- `CORS_ORIGIN` (e.g., `http://localhost:5173`)

Frontend `.env`
- `VITE_API_URL` (e.g., `http://localhost:5000`)

3) Run backend

```bash
cd backend
npm run dev
```

4) Run frontend

```bash
cd frontend
npm run dev
```

Open the app at `http://localhost:5173`.

## Frontend Routes

- `/login`, `/signup`
- `/dashboard`: manage my events (add, delete, mark swappable)
- `/marketplace`: browse others' `SWAPPABLE` events and request swaps
- `/requests`: manage incoming/outgoing swap requests

## API Endpoints

All protected endpoints require the `Authorization: Bearer <JWT>` header.

Authentication
- `POST /api/auth/signup` — body: `{ name, email, password }` → returns `{ token, user }`
- `POST /api/auth/login` — body: `{ email, password }` → returns `{ token, user }`

Events
- `GET /api/events` — list my events
- `POST /api/events` — body: `{ title, startTime, endTime, status? }`
- `PUT /api/events/:id` — body: any subset, e.g. `{ status: 'SWAPPABLE' }`
- `DELETE /api/events/:id`

Swaps
- `GET /api/swaps/swappable-slots` — list `SWAPPABLE` events owned by other users
- `GET /api/swaps/requests?type=incoming|outgoing` — list swap requests
- `POST /api/swaps/swap-request` — body: `{ mySlotId, theirSlotId }`
- `POST /api/swaps/swap-response/:requestId` — body: `{ accepted: true|false }`

Example (cURL)

```bash
# Login
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'

# List my events
curl -s http://localhost:5000/api/events \
  -H "Authorization: Bearer <JWT>"
```

## Assumptions & Notes

- No roles/permissions beyond authenticated user context.
- Minimal validation kept at the route layer for brevity; a production version should add stronger validation and error semantics.
- Basic conflict handling for swaps; not using DB transactions; if you need stronger consistency, consider MongoDB transactions.
- `JWT_SECRET` must be set for token issuance/verification.

## Challenges / Trade-offs

- Swap acceptance updates two `Event` documents and one `SwapRequest`. Without transactions, there is a small risk of partial updates if a failure occurs mid-way. The current code minimizes this via sequential saves but does not fully guarantee atomicity.
- Simplicity over features: no pagination on lists, no email verification, no rate limiting, minimal UI polish.



