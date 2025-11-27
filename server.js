// Swagger
// import swaggerUi from 'swagger-ui-express';
// import swaggerSpec from './config/swagger.js';
import "dotenv/config";
import "express-async-errors"; // auto-catch async errors
import app from "./src/app.js";
import connectDB from "./src/config/db.js";

connectDB();
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`App running on port ${PORT}... 🚀`);
});

// 2. التعامل مع الأخطاء غير المتوقعة (Uncaught Exceptions)
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  server.close(() => {
    process.exit(1);
  });
});
