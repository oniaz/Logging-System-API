# Logging System API 

A REST API for collecting, storing, and analyzing application logs.

## Tech Stack
- Node.js
- Express
- Mongoose (MongoDB)

## Models
- Developer: `username`, `email`, `password`, `apiKey` (unique)
- Application: `name` (unique, no whitespace), `createdAt`, owner reference
- Log: `message`, `level` (INFO | WARN | ERROR), `count`, `createdAt`, `updatedAt`, application reference

## Key Features
- Developer auth (JWT session cookie) — register / login / logout
- Protected routes for managing applications and viewing logs
- API-key authenticated endpoint for posting logs
- Logs support pagination, filtering, and sorting
- Server SDK with `init` and `log` for easy integration

## API Summary

Authentication
- Session auth: JWT stored in an httpOnly cookie named `token` for dashboard and protected routes.
- API key: required for posting logs via `x-api-key` header or `?apiKey=` query param.

Developer Endpoints
- `POST /api/users/register` — register (username, email, password). Returns `201 Created` and generates `apiKey`.
- `POST /api/users/login` — login (email, password). Sets session cookie `token`.
- `POST /api/users/logout` — logout (clears session cookie).
- `GET /api/users/api-key` — returns the authenticated developer's API key.

Application Endpoints
- `GET /api/applications` — list applications for the authenticated developer.
- `GET /api/applications/:name` — get one application by name.
- `POST /api/applications` — create application (body: `name`). Validations: unique across DB, no spaces.
- `DELETE /api/applications/:name` — delete an application owned by the authenticated developer.

Log Endpoints
- `GET /api/applications/:name/logs` — list logs for an application. Supports query params:
  - `page` (default 1), `limit` (default 10)
  - `sort` — `asc`, `desc`, or `count` (`desc` = most recent first; `count` = highest count first)
  - `level` — `INFO`, `WARN`, `ERROR`
  - `message` — partial, case-insensitive search
- `POST /api/applications/:name/logs` — post a log. Requires API key auth (`x-api-key` or `?apiKey=`). Body: `message`, `level`.
  - Creates a new log or increments `count` for an existing (same message + level) log.

## Response Shapes

Application:
- `id`, `name`, `createdAt`

Log:
- `id`, `applicationName`, `message`, `level`, `count`, `createdAt`, `updatedAt`

## Server SDK (npm package)
- `init(apiKey, applicationName, options?)` — store credentials for the client.
- `log({ message, level })` — sends `POST /api/applications/:name/logs` with `x-api-key` header.

The server enforces that the provided API key belongs to the same developer that owns the target application.

## Running Locally
1. Install dependencies:

```bash
npm install
```

2. Environment variables (example):

- `MONGO_URI` — MongoDB connection string
- `PORT` — server port (default 3000)
- `JWT_SECRET` — secret for signing session tokens

3. Start the server:

```bash
npm start
```

4. Development (nodemon):

```bash
npm run dev
```

## Notes & Behavior
- Routes that read or modify developer-owned resources require an authenticated session (session cookie).
- `POST /api/applications/:name/logs` explicitly requires the developer's API key and will return `403 Forbidden` if the API key does not belong to the owner of the application.

---
For full endpoint details, see `API_ENDPOINTS.md`.
