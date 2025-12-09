// ? Packages
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

// ? Middlewares
import errorHandler from "./middlewares/errors-middleware.js";

// ? Routes
import authRoutes from "./routes/auth-routes.js";
import organizerRoutes from "./routes/organizer-routes.js";
import eventsRoutes from "./routes/events-routes.js";
import categoryRoutes from "./routes/category-routes.js";
import tagRoutes from "./routes/tag-routes.js";
import uploadRoutes from "./routes/upload-routes.js";
import passwordRoutes from "./routes/password-routes.js";
import checkoutRoutes from "./routes/checkout-routes.js";
import ordersRoutes from "./routes/orders-routes.js";
import favouriteRoutes from "./routes/favourite-routes.js";
import ticketRoutes from "./routes/ticket-routes.js";

// ? Swagger Docs
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

// ! App
const app = express();
app.set("view engine", "ejs");
app.use(cors());
app.use((req, res, next) => {
  req.originalUrl === "/api/v1/checkout/webhook" ? express.raw({ type: "application/json" })(req, res, next) : express.json()(req, res, next);
});
app.use(cookieParser());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}


// ! API v1 Router
const apiV1 = express.Router();
app.use("/api/v1", apiV1);

// ! Routes
apiV1.get("/", (_, res) => {
  res.json({ message: "Welcome to Spotly API v1 (Spotly Backend)" });
});
apiV1.use("/auth", authRoutes);
apiV1.use("/password", passwordRoutes);
apiV1.use("/organizers", organizerRoutes);
apiV1.use("/events", eventsRoutes);
apiV1.use("/categories", categoryRoutes);
apiV1.use("/tags", tagRoutes);
apiV1.use("/checkout", checkoutRoutes);
apiV1.use("/orders", ordersRoutes);
apiV1.use("/favourite", favouriteRoutes);
apiV1.use("/upload", uploadRoutes);
apiV1.use("/tickets", ticketRoutes);


// ? Swagger Docs
apiV1.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// ! 404
app.all("*", (req, res) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});
app.use("/",
  (req, res) => {
    res.status(200).json({
      status: "success",
      message: "Welcome to Spotly API (Spotly Backend)",
    });
  }
);
// ! Error Handler
app.use(errorHandler);

export default app;
