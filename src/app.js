import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

<<<<<<< Updated upstream
import uploadRoutes from './routes/upload-routes.js';

import errorHandler from './middlewares/errors-middleware.js';
=======
import errorHandler from "./middlewares/errors-middleware.js";
import AppError from "./utils/AppError.js";

import authRoutes from "./routes/auth-routes.js";
>>>>>>> Stashed changes

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// ! API v1 Router
const apiV1 = express.Router();

// ! Routes Mounting
apiV1.use("/", uploadRoutes);

// ! Mount API v1 Router
app.use("/api/v1", apiV1);

<<<<<<< Updated upstream
// --- Global Error Handling ---
app.use(errorHandler);

// 6. التعامل مع المسارات الغلط (404)
app.all('*', (req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
=======
// ! Routes
apiV1.use("/auth", authRoutes);
// apiV1.use("/", (req, res, next) => {
//   res.status(200).json({ message: "Welcome to Spotly API" });
// });

// ! 404
app.all("*", (_, __, next) => {
  return next(new AppError("Page not found", 404));
>>>>>>> Stashed changes
});


export default app;
