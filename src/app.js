import express from "express";
import cors from "cors";
import morgan from "morgan";

import errorHandler from "./middlewares/errors-middleware.js";

// ! App
const app = express();

app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ! API v1 Router
const apiV1 = express.Router();
app.use("/api/v1", apiV1);

// ! Routes
apiV1.use("/", (_, res) => {
  res.json({ message: "Welcome to Spotly API" });
});

// ! 404
app.all("*", (req, res) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// ! Error Handler
app.use(errorHandler);

export default app;
