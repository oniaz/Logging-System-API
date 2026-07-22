# API Reference

Base URL: `http://localhost:3000` (or whatever `PORT` is set to).

Two auth schemes are used, depending on the route:

- **JWT (cookie)** — set by `POST /api/users/login`, sent automatically by
  the browser as an `httpOnly` cookie named `token` on subsequent requests.
  Used for the dashboard/user-facing endpoints.
- **API key** — a per-user key returned by `GET /api/users/api-key`, sent by
  the *logging* application itself via the `x-api-key` header (or
  `?apiKey=` query param). Used only for `POST /api/applications/:name/logs`,
  since that's the endpoint a deployed app calls from its own backend, not
  from a logged-in browser session.

All responses are JSON. All error responses have the shape:

```json
{ "message": "Human-readable error description" }
```

---

## Users — `/api/users`

### `POST /api/users/register`
Create a new account.

**Body**
```json
{ "username": "ada", "email": "ada@example.com", "password": "correct horse battery staple" }
```

**Responses**
| Status | Condition | Body |
|---|---|---|
| 201 | Created | `{ "message": "User registered successfully" }` |
| 400 | Missing `username`, `email`, or `password` | `{ "message": "Missing required fields: username, email, or password" }` |
| 409 | Email already registered | `{ "message": "Email already registered" }` |

---

### `POST /api/users/login`
**Body**
```json
{ "email": "ada@example.com", "password": "correct horse battery staple" }
```

On success, sets an `httpOnly` cookie named `token` (1 day expiry, `sameSite: strict`, `secure` when `NODE_ENV=production`).

| Status | Condition | Body |
|---|---|---|
| 200 | OK | `{ "message": "Login successful" }` |
| 400 | Missing `email` or `password` | `{ "message": "Missing required fields: email or password" }` |
| 401 | Wrong email/password | `{ "message": "Invalid credentials" }` |

---

### `POST /api/users/logout`
Clears the `token` cookie. No body required.

| Status | Body |
|---|---|
| 200 | `{ "message": "Logout successful" }` |

---

### `GET /api/users/api-key` 🔒 *(JWT)*
Returns the caller's API key (used to authenticate log ingestion from your
deployed application).

| Status | Condition | Body |
|---|---|---|
| 200 | OK | `{ "apiKey": "..." }` |
| 401 | Missing/invalid/expired token | `{ "message": "Unauthorized. Missing Token." }` / `"Unauthorized. Invalid token"` |

---

## Applications — `/api/applications`

All routes require the JWT cookie. An application always belongs to the
authenticated user (`owner`), and lookups are scoped to that owner.

### `GET /api/applications` 🔒 *(JWT)*
List all applications owned by the current user.

**Response `200`**
```json
[
  { "id": "665f...", "name": "my-app", "createdAt": "2026-01-10T12:00:00.000Z" }
]
```

---

### `GET /api/applications/:name` 🔒 *(JWT)*
Get a single application by name.

| Status | Condition | Body |
|---|---|---|
| 200 | OK | `{ "id": "...", "name": "...", "createdAt": "..." }` |
| 404 | Doesn't exist, **or** exists but belongs to another user | `{ "message": "Application not found" }` |

> Note: a wrong-owner lookup returns `404`, not `403` — this matches the
> original behavior and avoids leaking whether a name is taken by someone
> else.

---

### `POST /api/applications` 🔒 *(JWT)*
Create a new application. Names must be unique **across all users** (not
just your own) and must not contain spaces.

**Body**
```json
{ "name": "my-app" }
```

| Status | Condition | Body |
|---|---|---|
| 201 | Created | `{ "id": "...", "name": "my-app", "createdAt": "..." }` |
| 400 | Missing/blank `name` | `{ "message": "Application name is required" }` |
| 409 | Name already taken (by anyone) | `{ "message": "Application with this name already exists" }` |

---

### `DELETE /api/applications/:name` 🔒 *(JWT)*
Delete an application **and all of its logs**.

| Status | Condition | Body |
|---|---|---|
| 200 | Deleted | `{ "message": "Application my-app deleted successfully" }` |
| 404 | Doesn't exist, or belongs to another user | `{ "message": "Application not found" }` |

---

## Logs — `/api/applications/:name/logs`

### `GET /api/applications/:name/logs` 🔒 *(JWT)*
List logs for an application you own. Identical log entries (same
application + message + level) are deduplicated server-side and tracked via
a `count` instead of creating duplicate rows — this endpoint returns the
deduplicated rows.

**Query parameters**

| Param | Default | Notes |
|---|---|---|
| `sort` | `desc` | `asc` \| `desc` (by `updatedAt`) \| `count` (by `count` desc, then `updatedAt` desc) |
| `page` | `1` | must be ≥ 1 |
| `limit` | `10` | must be ≥ 1 |
| `level` | — | filter to `INFO` \| `WARN` \| `ERROR` (case-insensitive) |
| `message` | — | case-insensitive substring match |

**Response `200`**
```json
[
  {
    "id": "665f...",
    "applicationName": "my-app",
    "message": "Payment webhook failed",
    "level": "ERROR",
    "count": 3,
    "createdAt": "2026-01-10T12:00:00.000Z",
    "updatedAt": "2026-01-12T09:15:00.000Z"
  }
]
```

| Status | Condition | Body |
|---|---|---|
| 400 | Invalid `sort` | `{ "message": "Invalid sort value. Use \"asc\", \"desc\", or \"count\"." }` |
| 400 | Invalid `page` | `{ "message": "Invalid page number. Page must be a positive integer." }` |
| 400 | Invalid `limit` | `{ "message": "Invalid limit value. Limit must be a positive integer." }` |
| 400 | Invalid `level` | `{ "message": "Invalid log level. Use \"INFO\", \"WARN\", \"ERROR\"." }` |
| 404 | Application doesn't exist | `{ "message": "Application not found" }` |
| 403 | Application exists, but you don't own it | `{ "message": "You do not have permission to view logs for this application" }` |

---

### `POST /api/applications/:name/logs` 🔑 *(API key: `x-api-key` header or `?apiKey=`)*
Ingest a log line from your deployed application. If an identical
`(applicationName, message, level)` entry already exists for this owner,
its `count` is incremented instead of creating a new row.

**Body**
```json
{ "message": "Payment webhook failed", "level": "error" }
```
(`level` is case-insensitive; normalized to uppercase.)

| Status | Condition | Body |
|---|---|---|
| 201 | New log created | `{ "message": "Log created successfully", "log": { ... } }` |
| 200 | Existing log's `count` incremented | `{ "message": "Existing log updated with new occurrence", "log": { ... } }` |
| 400 | Missing `message`/`level`, invalid `level`, or empty name/message after trimming | `{ "message": "..." }` |
| 401 | Missing/invalid API key | `{ "message": "Missing API key" }` / `"Invalid API key"` |
| 404 | Application doesn't exist | `{ "message": "Application not found" }` |
| 403 | Application exists, but the API key's owner doesn't match | `{ "message": "API key does not belong to the application owner" }` |

---

## Fallback routes

| Route | Behavior |
|---|---|
| `GET /` | `"Logging System API"` (plain text, 200) |
| `GET /api` | `"api"` (plain text, 200) |
| Anything unmatched | `404 { "message": "Route not found" }` |
