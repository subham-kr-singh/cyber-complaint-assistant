import express from "express";
import { getAuthority, listCategories } from "../controllers/routing.controller.js";

const router = express.Router();

router.get("/authority", getAuthority);
router.get("/categories", listCategories);

export default router;
