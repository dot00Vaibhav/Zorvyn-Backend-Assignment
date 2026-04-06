# Zrovyn Backend

A lightweight Express.js backend for managing users, records, and dashboard summaries.

## What this project includes

- `server.js` — application bootstrap and database connection
- `src/app.js` — main Express app configuration
- `src/config/db.js` — database connection logic with optional MongoDB URI support and in-memory fallback
- `src/controllers/` — route controllers for authentication, records, users, and dashboard summary
- `src/routes/` — route definitions and access control
- `src/middlewares/` — authentication and error handling middleware
- `src/models/` — Mongoose models for `User` and `Record`
- `src/utils/` — helper utilities and error class

## How to run

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm run dev
```

3. The API will listen on `http://localhost:5000` by default.

## Environment variables

- `PORT` — port to run the server
- `NODE_ENV` — environment mode (`development` or `production`)
- `JWT_SECRET` — secret used for signing JSON Web Tokens
- `JWT_EXPIRES_IN` — token expiration duration (default: `90d`)
- `MONGODB_URI` — optional connection string for a MongoDB instance

If `MONGODB_URI` is not provided, the app will use an in-memory MongoDB instance for local development.

## Notes

- The first registered user is automatically granted the `Admin` role.
- Protected API routes require a valid Bearer token in the `Authorization` header.
- User passwords are stored securely and never returned in API responses.
