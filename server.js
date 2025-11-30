
import "dotenv/config";
import "express-async-errors"; // auto-catch async errors
import app from "./src/app.js";
import connectDB from "./src/config/db.js";



const PORT = process.env.PORT || 5000;

// 1. التعامل مع الأخطاء غير المتوقعة (Uncaught Exceptions)
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

// 2. Connect to database and start server
let server;
connectDB()
  .then(() => {
    server = app.listen(PORT, () => {
      console.log(`Server running on port http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect DB", err);
    process.exit(1);
  });

// 3. التعامل مع الأخطاء غير المعالجة (Unhandled Rejections)
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});
