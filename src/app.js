import express from "express";
import cors from "cors";
import morgan from "morgan";

import uploadRoutes from './routes/upload-routes.js';

import errorHandler from './middlewares/errors-middleware.js';

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

// --- Global Error Handling ---
app.use(errorHandler);

// 6. التعامل مع المسارات الغلط (404)
app.all('*', (req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});


export default app;
