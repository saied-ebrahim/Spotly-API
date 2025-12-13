import {Router} from "express";
import { createTag, getAllTags, getTagById, updateTag, deleteTag } from "../controllers/tag-controller.js";
import authMiddleware from "../middlewares/auth-middleware.js";
import { authorizeAdmin } from "../middlewares/authorize-admin-middleware.js";
import validateMiddleware from "../middlewares/validation-middleware.js";
import { createTagValidation, updateTagValidation } from "../validations/tag-validation.js";

const router = Router();

router.get("/", getAllTags);
router.get("/:id", getTagById);
router.post("/", authMiddleware, authorizeAdmin, validateMiddleware(createTagValidation), createTag);
router.patch("/:id", authMiddleware, authorizeAdmin, validateMiddleware(updateTagValidation), updateTag);
router.delete("/:id", authMiddleware, authorizeAdmin, deleteTag);

export default router;
