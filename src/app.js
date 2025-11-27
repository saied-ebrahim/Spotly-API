import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import uploadRoutes from "./routes/upload-routes.js";
import authRoutes from "./routes/auth-routes.js";
import errorHandler from "./middlewares/errors-middleware.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// ! API v1 Router
const apiV1 = express.Router();
app.use("/api/v1", apiV1);

// ! Routes
apiV1.use("/auth", authRoutes);
apiV1.use("/upload", uploadRoutes);

// ! 404
app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// ! Error Handler
app.use(errorHandler);

export default app;
