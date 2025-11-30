import express from "express";
import {
  createTag,
  getAllTags,
  getTagById,
  updateTag,
  deleteTag,
} from "../controllers/tag-controller.js";
import validateMiddleware from "../middlewares/validation-middleware.js";
import authMiddleware from "../middlewares/auth-middleware.js";
import { createTagValidation, updateTagValidation } from "../validations/tag-validation.js";

const router = express.Router();

// Public routes
router.get("/", getAllTags);
router.get("/:id", getTagById);

// Protected routes (require authentication)
router.post("/", authMiddleware, validateMiddleware(createTagValidation), createTag);
router.patch("/:id", authMiddleware, validateMiddleware(updateTagValidation), updateTag);
router.delete("/:id", authMiddleware, deleteTag);

export default router;

