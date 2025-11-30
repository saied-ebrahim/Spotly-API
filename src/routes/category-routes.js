import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/category-controller.js";
import validateMiddleware from "../middlewares/validation-middleware.js";
import authMiddleware from "../middlewares/auth-middleware.js";
import { createCategoryValidation, updateCategoryValidation } from "../validations/category-validation.js";

const router = express.Router();

// Public routes
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

// Protected routes (require authentication)
router.post("/", authMiddleware, validateMiddleware(createCategoryValidation), createCategory);
router.patch("/:id", authMiddleware, validateMiddleware(updateCategoryValidation), updateCategory);
router.delete("/:id", authMiddleware, deleteCategory);

export default router;


