import {Router} from "express";
import { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory } from "../controllers/category-controller.js";
import validateMiddleware from "../middlewares/validation-middleware.js";
import authMiddleware from "../middlewares/auth-middleware.js";
import { createCategoryValidation, updateCategoryValidation } from "../validations/category-validation.js";

const router = Router();

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.post("/", authMiddleware, validateMiddleware(createCategoryValidation), createCategory);
router.patch("/:id", authMiddleware, validateMiddleware(updateCategoryValidation), updateCategory);
router.delete("/:id", authMiddleware, deleteCategory);

export default router;
