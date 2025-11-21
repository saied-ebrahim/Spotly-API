# E-commerce Express API

A production-ready REST API for a simple e-commerce backend built with Express and MongoDB. Supports user auth (JWT), roles and permissions, product management with image uploads to Cloudinary, shopping carts, and orders.

---

## Features

- **Auth**: Register, login, JWT-based auth, forgot/reset password via email
- **Roles**: `user`, `seller`, `admin` with route-level authorization
- **Products**: Public listing, protected search, seller CRUD, Cloudinary image upload
- **Cart**: Per-user cart with priced items and ownership checks
- **Orders**: Create orders from cart, per-user and admin/seller visibility
- **Error Handling**: Centralized error handler and async error capture
- **Health Check**: `/health`

## Tech Stack

- Node.js, Express
- MongoDB with Mongoose
- JWT for auth
- Multer + Cloudinary for image uploads
- Nodemailer for emails
- CORS enabled

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (Atlas or local)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```bash
# Server
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017

# Auth
JWT_SECRET=replace-with-strong-secret
JWT_EXPIRES=7d

# Email (Nodemailer)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

### Run

```bash
npm start
# Server: http://localhost:5000
```

---

## Project Structure

```text
ecommerce-express-api/
├─ server.js
├─ config/
│  └─ db.js
├─ models/
│  ├─ User.js
│  ├─ Product.js
│  ├─ Cart.js
│  └─ Order.js
├─ middlewares/
│  ├─ auth.js
│  ├─ authorize.js
│  ├─ errorHandler.js
│  └─ upload.js
├─ controllers/
│  ├─ authController.js
│  ├─ productController.js
│  ├─ cartController.js
│  └─ orderController.js
├─ routes/
│  ├─ auth.js
│  ├─ products.js
│  ├─ carts.js
│  └─ orders.js
└─ utils/
   ├─ email.js
   └─ token.js
```

---

## API Reference

Base URL: `http://localhost:5000`

### Auth

- POST `/auth/register`
  - body: `{ name, email, password, role? }`
  - returns: `{ token, user }`
- POST `/auth/login`
  - body: `{ email, password }`
  - returns: `{ token, user }`
- POST `/auth/forgot-password`
  - body: `{ email }`
  - returns: message (always generic)
- POST `/auth/reset-password`
  - body: `{ token, email, newPassword }`
  - returns: `{ message }`

### Health

- GET `/health` → `{ ok: true }`

### Products

- GET `/products/public`
  - query: `page=1&limit=20`
  - returns: list of products
- GET `/products/:id` → product by id
- GET `/products` (auth required)
  - query: `q=keyword&page=1&limit=20`
  - returns: search results (text index on `name`, `sellerName`)
- POST `/products` (auth, role: `seller` or `admin`)
  - content-type: `multipart/form-data`
  - fields: `name`, `description?`, `price`
  - file: `photo`
- PUT `/products/:id` (auth; owner or admin)
  - content-type: `multipart/form-data`
  - optional fields: `name`, `description`, `price`, `photo`
- DELETE `/products/:id` (auth; owner or admin)
- GET `/products/seller/:sellerId` (auth; same seller or admin)

### Cart

- GET `/carts/me` (auth) → current user cart
- POST `/carts` (auth)
  - body: `{ items: [{ product, quantity }] }`
  - creates or replaces entire cart
- PUT `/carts/:id` (auth; owner or admin)
  - body: `{ items }` (partial replace)
- DELETE `/carts/:id` (auth; owner or admin)

### Orders

- POST `/orders` (auth)
  - creates order from the current user cart
  - body: `{ paymentMethod: 'cod' | 'stripe' }`
- GET `/orders/:id` (auth; owner/admin or seller who owns any product in the order)
- GET `/orders/user/:userId` (auth; same user or admin)

---

## Auth & Roles

- Send JWT as `Authorization: Bearer <token>` header
- Roles supported: `user`, `seller`, `admin`
- Authorization is enforced using `middlewares/auth.js` and `middlewares/authorize.js`

---

## Image Uploads

- Upload uses `multer` memory storage and Cloudinary
- For `POST /products` and `PUT /products/:id`, send `multipart/form-data` with `photo` file field

Example (cURL):

```bash
curl -X POST http://localhost:5000/products \
  -H "Authorization: Bearer <TOKEN>" \
  -F "name=Sleek Chair" \
  -F "price=129.99" \
  -F "photo=@/path/to/image.jpg"
```

---

## Emails

- Password reset emails are sent using Nodemailer via `utils/email.js`
- Requires `EMAIL_SERVICE`, `EMAIL_USER`, `EMAIL_PASS`. For Gmail, use an app password

---

## Scripts

```bash
npm start    # start with nodemon
```

## API Docs (Swagger)

- After starting the server, open `http://localhost:5000/api-docs` to view interactive docs.
- Docs are generated from JSDoc in `routes/*.js` using `swagger-jsdoc` and served by `swagger-ui-express`.

---

## Troubleshooting

- 401 Unauthorized: Ensure `Authorization: Bearer <token>` header is present and valid
- 403 Forbidden: Role/ownership check failed
- 500 Server Error: Check server logs and `.env` values
- Cloudinary upload issues: verify Cloudinary credentials and that requests use `multipart/form-data`
- Email not sending: verify email service credentials and less-secure/app-password settings

---

## License

MIT

## Auther

Saeed Ebrahim
