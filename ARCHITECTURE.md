# Architecture

Same behavior, same routes, same status codes/messages as the pre-refactor
app — just re-layered so business rules don't depend on Express or Mongoose.
See the root [`README.md`](./README.md) for setup/run instructions and
[`API_ENDPOINTS.md`](./API_ENDPOINTS.md) for the API reference.

## Layers (dependency rule: arrows point inward only)

```
interfaces/http  --->  application/use-cases  --->  domain
        ^                                              ^
        |                                              |
infrastructure ----------------------------------------+
        ^
        |
      main (composition root — wires everything together)
```

- **domain/** — pure business rules, zero framework imports.
  - `errors/` — `AppError` + subclasses (`ValidationError`, `NotFoundError`,
    `ForbiddenError`, `ConflictError`, `UnauthorizedError`). Replaces the old
    pattern of `res.status(400).json(...)` scattered through controllers —
    use cases now just `throw`, and `error.middleware.js` maps error → status.
  - `entities/` — `LogLevel.js`, `SortOption.js`: the enums/validation rules
    and the "count sort means `{count:-1, updatedAt:-1}`" business rule that
    used to be inline in the controller.
  - `repositories/` — interfaces (`IUserRepository`, `IApplicationRepository`,
    `ILogRepository`) documenting the contract. Infrastructure implements them;
    use cases only depend on them, never on Mongoose.

- **application/use-cases/** — one class per original controller action
  (`RegisterUser`, `LoginUser`, `CreateApplication`, `GetLogsForApplication`,
  `CreateLog`, etc.). This is a 1:1 port of the logic from
  `*.controller.js`, just stripped of `req`/`res` and Mongoose specifics.

- **infrastructure/** — the only place Mongoose/bcrypt/jsonwebtoken/crypto
  are imported.
  - `database/models/` — your original schemas, unchanged.
  - `database/repositories/Mongo*Repository.js` — implement the domain
    repository interfaces; map Mongoose documents to plain objects so
    nothing above this layer ever touches a Mongoose document.
  - `security/` — `PasswordHasher` (bcrypt), `ApiKeyGenerator` (crypto),
    `TokenService` (jsonwebtoken).

- **interfaces/http/** — Express-specific "glue".
  - `controllers/` — thin: parse `req`, call a use case, shape the response.
  - `routes/` — factories (`createUsersRouter(deps)`) instead of importing
    singletons, so routing stays swappable/testable.
  - `middleware/` — `auth.middleware.js` is now `createAuthMiddleware({ userRepository, tokenService })`,
    so it depends on the domain port, not directly on the `User` model.
    `error.middleware.js` now understands `AppError.statusCode` in addition
    to the old Mongoose `ValidationError`/duplicate-key (`11000`) handling.
  - `presenters/` — the small `{id, name, createdAt}` / log DTO shaping that
    used to be inlined in the controllers as `.map(l => ({...}))`.

- **main/container.js** — the single composition root. It's the only file
  that `new`s up concrete repositories/services and injects them into use
  cases and controllers. Nothing in `domain/` or `application/` imports it.

- **app.js / server.js** — split so `app.js` (Express app + routing) can be
  imported in tests without opening a DB connection or a port; `server.js`
  is the actual process entrypoint (`connectDB` then `app.listen`).

## Behavior preserved intentionally (not bugs to "fix" silently)

- `createApplication` checks name uniqueness globally (`findByName`, no
  owner filter) — matches the `unique: true` constraint on `Application.name`.
- `getApplicationByName` returns a flat `404` for both "doesn't exist" and
  "exists but belongs to someone else" — same as the original
  `Application.findOne({ name, owner })` query.
- `getLogsForApplication` / `createLog` *do* distinguish 404 (app doesn't
  exist) vs 403 (app exists, wrong owner) — same as the original controllers.
- CORS is left wide open (`cors()`) with the allowlist version commented
  out in `app.js`, exactly as it was in the original `app.js`.

## Adding a new feature

Say you're adding "tags" on logs. The layer order to work through is:

1. **domain/** — add any new error type or validation rule (e.g. a `Tag`
   entity/enum) if the feature introduces new business constraints.
2. **domain/repositories/** — extend the relevant interface with the new
   method signature (e.g. `ILogRepository.findByTag`).
3. **infrastructure/database/repositories/** — implement that method in
   `MongoLogRepository`.
4. **application/use-cases/** — add or extend a use case that calls the new
   repository method and enforces the business rule.
5. **interfaces/http/** — add a controller method, a presenter field if the
   response shape changes, and a route.
6. **main/container.js** — wire the new use case into the controller.

The dependency rule never bends: nothing in `domain/` or `application/`
should ever `import` from `infrastructure/`, `interfaces/`, or `main/`.

## Testing this structure

Nothing here requires a running Mongo instance or an HTTP server to unit
test:

- **Use cases** take plain-object dependencies in their constructor, so
  tests can pass hand-written fakes/mocks for `userRepository`,
  `passwordHasher`, etc. — no `jest.mock('mongoose')` needed.
- **Repositories** are the natural boundary for integration tests against a
  real (or in-memory) Mongo instance.
- **Controllers** can be tested with a fake use case object (`{ execute: () => ... }`)
  and lightweight `req`/`res` stubs.
- `app.js`'s `createApp()` builds a full Express app without connecting to
  Mongo, so it's suitable for `supertest`-style route tests once repositories
  are swapped for fakes via a test-specific container.

## Trade-offs / things kept intentionally simple

- Dependency injection is manual (`main/container.js`), not a DI framework —
  appropriate for a project this size; revisit if the graph grows much
  larger.
- Repository "interfaces" are plain classes whose methods throw
  `not implemented` — there's no `interface` keyword in JS, so this is a
  convention, not an enforced contract. A TypeScript migration would let
  these become real interfaces.
