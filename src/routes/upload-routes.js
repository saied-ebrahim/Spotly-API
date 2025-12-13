import {Router} from "express";
import upload from "../middlewares/upload-middleware.js";
import { handleUpload, getFileSignedUrl } from "../controllers/upload-controller.js";

const router = Router();

router.post('/', upload.single('file'), handleUpload);
router.get("/file/:key", getFileSignedUrl);

export default router;
