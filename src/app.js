import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/errors-middleware.js";
import uploadRoutes from "./routes/upload-routes.js";
import eventsRoutes from "./routes/events-routes.js";
import authRoutes from "./routes/auth-routes.js";
import categoryRoutes from "./routes/category-routes.js";
import tagRoutes from "./routes/tag-routes.js";
import organizerRoutes from "./routes/organizer-routes.js";
// ! App
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
// apiV1.use("/", (_, res) => {
//   res.json({ message: "Welcome to Spotly API" });
// });
apiV1.use("/auth", authRoutes);
apiV1.use("/categories", categoryRoutes);
apiV1.use("/tags", tagRoutes);
apiV1.use("/organizers", organizerRoutes);
apiV1.use("/upload", uploadRoutes);
apiV1.use("/events", eventsRoutes);


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
