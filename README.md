# Trip.io — Ride-Hailing REST API

A backend REST API for a ride-hailing platform. Riders book trips, drivers accept and complete them, and payments are processed via Paystack.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Running the Server](#running-the-server)
- [Seeding the Database](#seeding-the-database)
- [Running Tests](#running-tests)
- [API Documentation](#api-documentation)
- [API Reference](#api-reference)
- [Ride Lifecycle](#ride-lifecycle)
- [Authentication](#authentication)

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js v5
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT (access + refresh tokens), Google OAuth
- **Payments:** Paystack webhook integration
- **Email:** Nodemailer (SMTP)
- **Validation:** express-validator
- **Rate Limiting:** express-rate-limit
- **Docs:** Swagger UI (OpenAPI 3.0)
- **Logging:** Winston
- **Testing:** Jest + Supertest + mongodb-memory-server

---

## Features

- Local registration and login with email verification
- Google OAuth sign-in
- Access and refresh token rotation with blacklisting
- Password reset via email
- Role-based access control (rider, driver, admin)
- Geospatial nearest-driver assignment on ride booking
- Full ride lifecycle: pending → accepted → ongoing → completed / cancelled
- Driver rejection with automatic reassignment to next nearest driver
- Paystack webhook with HMAC signature verification
- Driver ratings with automatic average recalculation
- Paginated listings for users, drivers, rides, payments, and ratings
- Input sanitization and request validation on all endpoints
- Rate limiting on auth endpoints (10 requests / 15 min per IP)
- Centralized error handling

---

## Project Structure

```
trip_io/
├── src/
│   ├── config/          # Database connection and env validation
│   ├── controllers/     # Route handlers (thin — delegate to services)
│   ├── middlewares/     # Auth, role, validate, error, rate limiter
│   ├── models/          # Mongoose schemas (User, Token, Driver, Ride, Payment, Rating)
│   ├── routes/          # Express routers, all mounted under /api/v1
│   ├── services/        # Business logic
│   ├── utils/           # JWT helpers, logger, email, distance calculator
│   ├── validators/      # express-validator rule sets
│   ├── app.js           # Express app setup
│   └── server.js        # HTTP server entry point
├── seeders/             # Database seed scripts (admin, drivers, riders, rides)
├── swagger/             # OpenAPI 3.0 spec
├── tests/
│   ├── setup.js         # mongodb-memory-server lifecycle
│   ├── unit/            # Service-level unit tests (mocked models)
│   └── integration/     # Route-level integration tests (real DB)
├── .env.example
├── jest.config.js
└── package.json
```

---

## Prerequisites

- Node.js v18 or later
- MongoDB instance (local or Atlas)
- A Paystack account (for payment webhooks)
- A Google Cloud project with OAuth 2.0 credentials (for Google login)
- An SMTP account for transactional email (Gmail App Password recommended)

---

## Setup

**1. Clone the repository**

```bash
git clone <repository-url>
cd trip_io
```

**2. Install dependencies**

```bash
npm install
```

**3. Create your environment file**

```bash
cp .env.example .env
```

Then fill in all required values — see [Environment Variables](#environment-variables) below.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port. Defaults to `3000` |
| `NODE_ENV` | No | `development`, `production`, or `test` |
| `MONGO_URI` | **Yes** | MongoDB connection string |
| `JWT_ACCESS_SECRET` | **Yes** | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | **Yes** | Secret for signing refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | **Yes** | Access token TTL e.g. `15m` |
| `JWT_REFRESH_EXPIRES_IN` | **Yes** | Refresh token TTL e.g. `7d` |
| `GOOGLE_CLIENT_ID` | **Yes** | Google OAuth 2.0 client ID |
| `PAYSTACK_SECRET_KEY` | **Yes** | Paystack secret key for webhook verification |
| `SMTP_HOST` | No | SMTP host. Defaults to `smtp.gmail.com` |
| `SMTP_PORT` | No | SMTP port. Defaults to `587` |
| `SMTP_USER` | No | SMTP username / email address |
| `SMTP_PASS` | No | SMTP password or App Password |
| `EMAIL_FROM` | No | From address for outgoing emails |
| `CLIENT_URL` | No | Frontend URL used in email links. Defaults to `http://localhost:3000` |

> **Note:** The server will refuse to start if any required variable is missing.

---

## Running the Server

**Development** (auto-restarts on file changes):

```bash
npm run dev
```

**Production:**

```bash
npm start
```

The server starts on `http://localhost:<PORT>` (default: `3000`).

---

## Seeding the Database

Populate the database with test data — 1 admin, 10 drivers, 20 riders, and 15 completed rides with payments and ratings:

```bash
npm run seed
```

**Default admin credentials:**

```
Email:    admin@tripio.com
Password: Admin@12345
```

> Run the seed only once, or clear the database first to avoid duplicate key errors.

---

## Running Tests

Tests use an in-memory MongoDB instance — no external database needed.

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage
```

The test suite includes:
- Unit tests for all six service modules
- Integration tests for all six route domains
- Covers success paths, validation errors, auth failures, and business logic edge cases

---

## API Documentation

Interactive Swagger UI is available at:

```
http://localhost:<PORT>/api-docs
```

All endpoints are documented with request/response schemas and example payloads. Protected routes require a Bearer JWT token — use the **Authorize** button in Swagger to set it.

---

## API Reference

All routes are prefixed with `/api/v1`.

### Auth — `/api/v1/auth`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register a new rider or driver |
| POST | `/login` | Public | Log in and receive tokens |
| POST | `/google` | Public | Sign in with a Google ID token |
| POST | `/refresh` | Public | Exchange a refresh token for a new access token |
| POST | `/logout` | Protected | Invalidate the current refresh token |
| POST | `/forgot-password` | Public | Send a password reset email |
| POST | `/reset-password/:token` | Public | Reset password using email token |
| POST | `/verify-email/:token` | Public | Verify email address |
| POST | `/resend-verification` | Public | Resend email verification link |

> Register and login are rate-limited to **10 requests per 15 minutes** per IP.

### Users — `/api/v1/users`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/me` | Protected | Get own profile |
| PATCH | `/me` | Protected | Update name, phone, or profile photo |
| GET | `/` | Admin | List all users (paginated) |
| GET | `/:id` | Admin | Get a user by ID |
| PATCH | `/:id/deactivate` | Admin | Deactivate a user account |

### Drivers — `/api/v1/drivers`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/profile` | Driver | Create driver profile (vehicle + license) |
| GET | `/profile` | Driver | Get own driver profile |
| PATCH | `/availability` | Driver | Toggle online / offline status |
| PATCH | `/location` | Driver | Update current GPS coordinates |
| GET | `/` | Admin | List all drivers (paginated) |
| PATCH | `/:id/approve` | Admin | Approve a driver |

### Rides — `/api/v1/rides`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Rider | Book a ride |
| GET | `/my` | Protected | Get own ride history (paginated) |
| GET | `/:id` | Protected | Get a ride by ID |
| PATCH | `/:id/accept` | Driver | Accept an assigned ride |
| PATCH | `/:id/reject` | Driver | Reject a ride (triggers reassignment) |
| PATCH | `/:id/start` | Driver | Start the ride |
| PATCH | `/:id/complete` | Driver | Mark the ride as completed |
| PATCH | `/:id/cancel` | Rider | Cancel a pending or accepted ride |
| GET | `/` | Admin | List all rides (paginated) |

### Payments — `/api/v1/payments`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Rider | Initiate payment for a completed ride |
| GET | `/my` | Protected | Get own payment history (paginated) |
| GET | `/ride/:rideId` | Protected | Get payment for a specific ride |
| GET | `/` | Admin | List all payments (paginated) |
| POST | `/webhook/paystack` | Public | Paystack webhook receiver |

### Ratings — `/api/v1/ratings`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Rider | Rate a driver after a completed ride |
| GET | `/driver/:driverId` | Protected | Get all ratings for a driver (paginated) |
| GET | `/ride/:rideId` | Protected | Get the rating for a specific ride |

---

## Ride Lifecycle

```
         Book
Rider ──────────► pending
                     │
          Driver accepts / rejects
                     │
                  accepted ──── Driver rejects ──► pending (reassigned)
                     │
              Driver starts
                     │
                  ongoing
                     │
             Driver completes
                     │
                 completed
                     │
              Rider pays & rates

At pending or accepted: Rider may cancel ──► cancelled
```

Fare is calculated as **₦500 base + ₦100 per km**. Duration (minutes) is recorded on completion.

---

## Authentication

All protected endpoints require an `Authorization` header:

```
Authorization: Bearer <accessToken>
```

**Token flow:**

1. Register or log in — receive `accessToken` (short-lived) and `refreshToken` (long-lived).
2. When the access token expires, call `POST /api/v1/auth/refresh` with the refresh token to get a new pair.
3. On logout the refresh token is blacklisted and can no longer be used.

Google sign-in (`POST /api/v1/auth/google`) accepts a Google `id_token` from the client and returns the same token pair.
