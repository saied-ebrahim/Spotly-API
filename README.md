## Spotly API

Spotly API is the backend service for an event booking and management platform (Events / Tickets).  
It provides a complete REST API for managing users, organizers, events, tickets, payments, analytics, and file uploads.

---

## Main Features

- **User Management & Auth**
  - Register new users and log in using email and password.
  - JWT authentication with refresh tokens and secure cookie storage.
  - Update profile data and fetch the currently authenticated user.
  - Admin-level endpoints to manage and list all users.

- **Password Management**
  - Request password reset via email.
  - Confirm and complete the reset flow.

- **Organizers Management**
  - Fetch all organizers.
  - Fetch organizers by user or by event.

- **Events Management**
  - Create new events with ticket configuration.
  - Update/delete events with organizer authorization.
  - Fetch all events or a single event by ID.
  - Link events with organizers, orders, and analytics.

- **Categories & Tags**
  - Full CRUD for categories (create, read, update, delete).
  - Full CRUD for tags to organize events.

- **Checkout & Orders**
  - Create Stripe checkout sessions for purchasing event tickets.
  - Handle Stripe webhooks to process payments and confirm orders.
  - Create detailed checkout records and generate tickets with QR codes.
  - Send order confirmation emails with purchase details.
  - Automatically cancel incomplete (pending) orders using cron jobs.
  - Endpoints to view orders for users/organizers and all orders (admin).

- **Tickets / Attendees**
  - Generate tickets for each purchase (each ticket has its own QR code + token).
  - Link tickets to users, events, and checkout references.

- **Favourites**
  - Add / remove / fetch favourite events for a user.

- **File Uploads**
  - Upload a single file using `multer` to Cloudflare R2 (S3-compatible).
  - Generate secure signed URLs to download / view files.

- **Analytics**
  - Platform-wide total revenue and net income.
  - Per-event revenue and net income.
  - Tickets sold and remaining (globally and per event).
  - Admin-only endpoints for aggregated revenue.

- **Emails**
  - Send order confirmation emails.
  - Daily cron job to send email updates to users about the latest Spotly changes.

- **Swagger Documentation**
  - Full API documentation using OpenAPI 3.0 and an interactive Swagger UI.

- **Clean Architecture**
  - Layered structure with `routes` + `controllers` + `services` + `models` + `middlewares` and clear separation of permissions, validation, and business logic.

---

## Tech Stack

- **Runtime & Framework**
  - **Node.js** (ESM modules)
  - **Express.js**

- **Database & ORM**
  - **MongoDB** with **Mongoose**

- **Authentication & Security**
  - **JWT** (`jsonwebtoken`) with refresh tokens and secure cookies (`httpOnly`, `sameSite: "none"`, `secure: true`).
  - Authorization middlewares:
    - `auth-middleware` to validate JWT.
    - `authorize-admin-middleware` for admin permissions.
    - `authorize-event-middleware` to check event ownership/organizer access.

- **Validation**
  - **Joi** via `validations/*-validation.js` and `validation-middleware`.

- **File Storage**
  - **Cloudflare R2** (S3-compatible) using:
    - `@aws-sdk/client-s3`
    - `@aws-sdk/s3-request-presigner`
    - `multer` + `multer-s3`

- **Payments**
  - **Stripe** for checkout, webhooks, and payment processing.

- **Emails**
  - **Nodemailer** with support for:
    - Well-known services (e.g. Gmail) via `EMAIL_SERVICE`.
    - Custom SMTP using `EMAIL_HOST` / `EMAIL_PORT`.

- **Scheduling**
  - **node-cron** for scheduled jobs:
    - Canceling orders after a grace period.
    - Sending daily updates to users.

- **Views & Templating**
  - **EJS** for dynamic pages (e.g. email-styled content or special views).

- **Logging & Utilities**
  - **morgan** (dev logging).
  - **rotating-file-stream** (for rotating access logs when needed).

- **API Docs**
  - **swagger-jsdoc**
  - **swagger-ui-express**

- **Other Utilities**
  - **cookie-parser**, **cors**, **qrcode** for QR code generation for tickets.

---

## Getting Started

### Prerequisites

- **Node.js 18+**
- **MongoDB** (locally or via MongoDB Atlas)
- **Stripe** account (secret key + webhook secret)
- Email account (Gmail or another SMTP provider) for sending emails
- **Cloudflare R2** or any S3-compatible object storage

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root with variables such as:

```bash
# Server
PORT=5000
NODE_ENV=development
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:8000

# Database
MONGO_URI=mongodb://localhost:27017

# Auth (JWT)
JWT_SECRET=replace-with-strong-secret
JWT_EXPIRES=7d

# Cookies
COOKIE_SECRET=some-cookie-secret      # Optional: if used by cookie parser

# Email (Nodemailer)
# Option 1: well-known service (e.g. Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-app-password
EMAIL_FROM="Spotly <no-reply@spotly.com>"

# Option 2: custom SMTP:
# EMAIL_HOST=smtp.your-host.com
# EMAIL_PORT=587
# EMAIL_SECURE=false

# Stripe
STRIPE_SECRET_KEY=sk_test_***************
STRIPE_ENDPOINT_SECRET=whsec_************

# Cloudflare R2 (S3-compatible)
R2_ENDPOINT=https://<your-account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=spotly-bucket
```

> **Note:** Make sure to replace placeholder values with real credentials before running in production.

### Run

Development mode (with nodemon):

```bash
npm run dev
```

Regular start:

```bash
npm start
```

Server will be available at:

- `http://localhost:5000`
- `http://localhost:5000/api/v1`

---

## API Structure & Modules

### Base URL

- **Development:** `http://localhost:5000/api/v1`
- **Production (example):** `https://spotly-api.vercel.app/api/v1`

### Auth

**Routes (under `/api/v1/auth`):**

- `POST /signup` – create a new account.
- `POST /login` – log in and receive access + refresh tokens.
- `POST /refreshToken` – issue a new access token from a refresh token.
- `POST /logout` – log out from the current session.
- `POST /logoutAll` – log out from all sessions.
- `GET /me` – get the current user (requires JWT).
- `GET /users` – get all users (admin only).
- `POST /updateMe` – update the authenticated user's profile.

### Password

**Routes (under `/api/v1/password`):**

- Request/complete password reset (implemented in `password-routes.js` and `password-controller.js`).

### Organizers & Events

**Organizers (under `/api/v1/organizers`):**

- `GET /` – get all organizers.
- `GET /user/:userId` – get organizers linked to a specific user.
- `GET /event/:eventId` – get organizers for a specific event.
- `USE /events` – forwards to `events-routes` for managing organizers' events.

**Events (under `/api/v1/events`):**

- `GET /` – get all events.
- `GET /:id` – get a specific event.
- `POST /` – create an event (requires auth + validation).
- `PATCH /:id` – update an event (auth + organizer authorization).
- `DELETE /:id` – delete an event (auth + organizer authorization).
- Nested:
  - `/api/v1/events/:id/orders` – manage orders for a specific event.
  - `/api/v1/events/:id/analytics` – analytics for a specific event.

### Categories & Tags

**Categories (under `/api/v1/categories`):**

- `GET /` – get all categories.
- `GET /:id` – get a specific category.
- `POST /` – create a category (requires auth + validation).
- `PATCH /:id` – update a category.
- `DELETE /:id` – delete a category.

**Tags (under `/api/v1/tags`):**

- Endpoints similar to categories (create/read/update/delete).

### Checkout & Orders

**Checkout (under `/api/v1/checkout`):**

- `POST /` – create a Stripe checkout session for purchasing event tickets.
- `POST /webhook` – Stripe webhook handler to process payment status.
- `GET /complete` – redirect after successful payment to the frontend.
- `GET /cancel/:orderID/:eventID` – cancel order and redirect to the frontend.

**Orders (under `/api/v1/orders`):**

- `GET /myorders` – get orders for the current organizer/user.
- `GET /` – get all orders (admin only).
- `GET /:id` – get a specific order by ID.

### Favourites

**Routes (under `/api/v1/favourite`):**

- Add/remove favourite events and get a user's favourites (see `favourite-routes.js` and `favourite-controller.js`).

### Tickets

**Routes (under `/api/v1/tickets`):**

- Manage tickets/attendees, typically for viewing and validating tickets.

### Uploads

**Routes (under `/api/v1/upload`):**

- `POST /` – upload a single file via `multipart/form-data` using the `file` field.
- `GET /file/:key` – get a signed URL for a file stored in R2.

### Analytics

**Routes (under `/api/v1/events/:id/analytics` and `/api/v1/events/analytics`):**

- `GET /revenue` – total revenue.
- `GET /:id/revenue` – revenue for a specific event.
- `GET /net-income` – net income for the platform.
- `GET /:id/net-income` – net income for a specific event.
- `GET /tickets-sold` / `/:id/tickets-sold` – number of tickets sold.
- `GET /tickets-available` / `/:id/tickets-available` – number of tickets available.
- `GET /all-revenue` – aggregated revenue (admin only).

---

## Swagger API Docs

- After running the server, open:
  - `http://localhost:5000/api/v1/api-docs`
- Documentation is generated using:
  - `swagger-jsdoc` (reading annotations from `./src/routes/*.js`)
  - `swagger-ui-express` to serve an interactive web UI.

---

## CORS & Security

- CORS is enabled with an allow-list of origins:
  - `http://localhost:8000`
  - Several Vercel frontend URLs for the Spotly client (`spotly-clinet`).
- Requests without an `Origin` header (e.g. Postman, server-to-server) are allowed.
- Cookies are configured as:
  - `httpOnly: true`
  - `secure: true`
  - `sameSite: "none"`

---

## Error Handling

- A global error-handling middleware (`errors-middleware`) is used to handle:
  - Validation errors.
  - Application errors (`AppError`).
  - Unexpected errors (uncaughtException, unhandledRejection).
- Error responses follow a consistent JSON structure.

---

## Scripts

```bash
npm start        # start in production mode (node server.js)
npm run dev      # start in development mode with nodemon
npm run docs:check # verify that swagger-jsdoc can be loaded
```

---

## Troubleshooting

- **401 Unauthorized**: Make sure you send `Authorization: Bearer <token>` or valid cookies.
- **403 Forbidden**: Permission check failed (not an admin or not the organizer of the event).
- **500 Server Error**: Check server logs and your `.env` configuration.
- **Stripe Webhook Issues**: Verify `STRIPE_ENDPOINT_SECRET` and that Stripe is calling the correct webhook endpoint.
- **R2 / File Upload Issues**: Verify R2 configuration (endpoint, bucket, access key, secret) and that the uploaded field name is `file`.
- **Email Not Sending**: Check your email settings (`EMAIL_SERVICE` or SMTP config) and ensure you use an app password if using Gmail.

---

## License

MIT

---

## Author

Saeed Ebrahim
