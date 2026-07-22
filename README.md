# Logging System API

A small Express + MongoDB service that lets an application register, get an
API key, and push structured logs (`INFO`/`WARN`/`ERROR`) to a per-user
dashboard, with deduplication (repeated log lines increment a `count`
instead of piling up rows).

Built with a **clean architecture** layering — see [`ARCHITECTURE.md`](./ARCHITECTURE.md)
for the full breakdown, and [`API_ENDPOINTS.md`](./API_ENDPOINTS.md) for the
complete API reference.

## Stack

- Express 4
- MongoDB via Mongoose 8
- JWT cookie auth (dashboard) + API-key auth (log ingestion)
- bcrypt for password hashing

## Getting started

### Prerequisites
- Node.js 18+
- A MongoDB connection string (local or Atlas)

### Install
```bash
npm install
```

### Configure
Create a `.env` file in the project root:

```bash
PORT=3000
MONGO_URI=mongodb://localhost:27017/logging-system
JWT_SECRET=replace-with-a-long-random-string
# optional — only used if you switch app.js back to the allowlist CORS config
ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend.example.com
```

### Run
```bash
npm start        # node src/server.js
npm run dev       # node --watch src/server.js
```

The server logs `MongoDB connected` then `Server is running on port 3000`
(or your configured `PORT`) once it's up.

## Quick smoke test

```bash
# 1. Register
curl -s -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"ada","email":"ada@example.com","password":"correct-horse"}'

# 2. Log in (saves the JWT cookie to cookies.txt)
curl -s -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"ada@example.com","password":"correct-horse"}'

# 3. Get your API key
curl -s http://localhost:3000/api/users/api-key -b cookies.txt

# 4. Create an application
curl -s -X POST http://localhost:3000/api/applications \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"my-app"}'

# 5. Push a log using the API key from step 3
curl -s -X POST http://localhost:3000/api/applications/my-app/logs \
  -H "Content-Type: application/json" \
  -H "x-api-key: <API_KEY_FROM_STEP_3>" \
  -d '{"message":"Payment webhook failed","level":"error"}'

# 6. Read logs back
curl -s http://localhost:3000/api/applications/my-app/logs -b cookies.txt
```

Full endpoint-by-endpoint documentation (query params, every status code,
error bodies) is in [`API_ENDPOINTS.md`](./API_ENDPOINTS.md).

## Project structure

```
src/
├── app.js                        # Express app + route wiring (no DB connect, no listen)
├── server.js                     # Process entrypoint: connectDB() then app.listen()
├── config/
│   └── env.js                    # Centralized process.env reads
├── domain/                       # Framework-free business rules
│   ├── entities/                 # LogLevel, SortOption (enums + rules)
│   ├── errors/                   # AppError + ValidationError/NotFoundError/etc.
│   └── repositories/             # Repository interfaces (ports)
├── application/
│   └── use-cases/                # RegisterUser, LoginUser, CreateApplication,
│                                  # GetLogsForApplication, CreateLog, ...
├── infrastructure/                # Everything that talks to the outside world
│   ├── database/
│   │   ├── models/                # Mongoose schemas
│   │   └── repositories/          # Mongo*Repository (implements domain ports)
│   └── security/                  # PasswordHasher, ApiKeyGenerator, TokenService
├── interfaces/
│   └── http/
│       ├── controllers/           # Thin req/res handlers
│       ├── routes/                # Express router factories
│       ├── middleware/            # auth.middleware.js, error.middleware.js
│       └── presenters/            # Response DTO shaping
├── main/
│   └── container.js               # Composition root — wires everything together
└── shared/
    └── utils/
        └── stringUtils.js
```

## Documentation

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — layer-by-layer explanation, the
  dependency rule, how to add a new feature, and testing guidance.
- [`API_ENDPOINTS.md`](./API_ENDPOINTS.md) — every route, request/response
  shape, and status code.

## Notes

- CORS is currently wide open (`cors()`); an allowlist-based config using
  `ALLOWED_ORIGINS` is included commented-out in `app.js` if you want to
  restrict it.
- `vercel.json` / `package-lock.json` from the original project aren't
  included here since they weren't part of the refactor input — carry them
  over as-is (double check `vercel.json` still points at the right entry
  file if it referenced the old `app.js` path directly).
