import express from "express";
import cors from "cors";
import morgan from "morgan";

import uploadRoutes from "./routes/upload-routes.js";

const app = express();
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// ! API v1 Router
const apiV1 = express.Router();

// ! Routes Mounting
apiV1.use("/", uploadRoutes);

// ! Mount API v1 Router
app.use("/api/v1", apiV1);

// ! 404
app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// ! Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});

export default app;
