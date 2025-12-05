import { Router } from "express";
import { getFavourites, addFavourite, removeFavourite, removeAllFavourites } from "../controllers/favourite-controller.js";
import authMiddleware from "../middlewares/auth-middleware.js";

const router = Router();

router.route("/").get(authMiddleware, getFavourites).post(authMiddleware, addFavourite).delete(authMiddleware, removeAllFavourites);
router.route("/:id").delete(authMiddleware, removeFavourite);

export default router;
