# API Endpoints

This API uses two authentication mechanisms:

- Developer session auth: a JWT is issued at login and stored in an `httpOnly` cookie named `token`.
- API key auth: log creation requires the developer's API key in the `x-api-key` header, or in the `apiKey` query parameter.


## Developer Endpoints

### Register

- Method: `POST`
- Path: `/api/users/register`
- Auth: none
- Body:
  - `username` - string, required
  - `email` - string, required
  - `password` - string, required
- Description: Creates a new developer account and generates a unique API key.
- Success response: `201 Created`

### Login

- Method: `POST`
- Path: `/api/users/login`
- Auth: none
- Body:
  - `email` - string, required
  - `password` - string, required
- Description: Verifies credentials and sets the session cookie named `token`.
- Success response: `200 OK`

### Logout

- Method: `POST`
- Path: `/api/users/logout`
- Auth: session cookie required
- Description: Clears the session cookie.
- Success response: `200 OK`

### Get API Key

- Method: `GET`
- Path: `/api/users/api-key`
- Auth: session cookie required
- Description: Returns the authenticated developer's API key.
- Success response: `200 OK`

## Application Endpoints

### Get All Applications

- Method: `GET`
- Path: `/api/applications`
- Auth: session cookie required
- Description: Returns all applications owned by the authenticated developer.
- Success response: `200 OK`

### Get Application By Name

- Method: `GET`
- Path: `/api/applications/:name`
- Auth: session cookie required
- Path params:
  - `name` - application name
- Description: Returns one application owned by the authenticated developer.
- Success response: `200 OK`

### Create Application

- Method: `POST`
- Path: `/api/applications`
- Auth: session cookie required
- Body:
  - `name` - string, required
- Description: Creates a new application for the authenticated developer.
- Validation:
  - name must be unique across the database
  - name cannot contain spaces
- Success response: `201 Created`

### Delete Application By Name

- Method: `DELETE`
- Path: `/api/applications/:name`
- Auth: session cookie required
- Path params:
  - `name` - application name
- Description: Deletes an application owned by the authenticated developer.
- Success response: `200 OK`

## Log Endpoints

### Get Logs For Application

- Method: `GET`
- Path: `/api/applications/:name/logs`
- Auth: session cookie required
- Path params:
  - `name` - application name
- Query params:
  - `page` - positive integer, default `1`
  - `limit` - positive integer, default `10`
  - `sort` - `asc`, `desc`, or `count`
  - `level` - `INFO`, `WARN`, or `ERROR`
  - `message` - partial message search, case-insensitive
- Description: Returns the logs for one application with pagination, filtering, and sorting.
- Sorting:
  - `asc` - oldest updated logs first
  - `desc` - most recently updated logs first
  - `count` - highest count first, then most recently updated among ties
- Success response: `200 OK`

### Post Log For Application

- Method: `POST`
- Path: `/api/applications/:name/logs`
- Auth: API key required
- Authentication:
  - Preferred: `x-api-key: <developer-api-key>`
  - Alternative: `?apiKey=<developer-api-key>`
- Path params:
  - `name` - application name
- Body:
  - `message` - string, required
  - `level` - string, required, one of `INFO`, `WARN`, `ERROR` on input
- Description: Creates a log entry for the application, or increments the count if the same message and level already exist.
- Success responses:
  - `201 Created` when a new log is created
  - `200 OK` when an existing log count is incremented

## Response Shape Summary

### Application

- `id`
- `name`
- `createdAt`

### Log

- `id`
- `applicationName`
- `message`
- `level`
- `count`
- `createdAt`
- `updatedAt`

## Server SDK

The published SDK should expose two methods:

- `init(apiKey, applicationName, options?)` - stores the developer's API key and application name for later log calls.
- `log(data)` - sends `POST /api/applications/:name/logs` with the stored API key in `x-api-key`.

The SDK should not bypass server authorization. The API continues to enforce that the API key belongs to the same owner as the target application before accepting the log.

## Error Responses

- `401 Unauthorized` - missing or invalid session cookie, or invalid API key
- `403 Forbidden` - authenticated user or API key does not belong to the application owner
- `404 Not Found` - application not found
- `400 Bad Request` - invalid input, such as bad sort value, missing fields, or invalid log level
- `409 Conflict` - duplicate application or email registration