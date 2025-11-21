
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

## API Reference

Base URL: `http://localhost:5000`

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
