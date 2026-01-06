import express from "express";
import {
  getDiasNoDisponibles,
  createDiaNoDisponible,
  deleteDiaNoDisponible,
} from "../controllers/diasNoDisponiblesController.js";

const router = express.Router();

router.get("/", getDiasNoDisponibles);
router.post("/", createDiaNoDisponible);
router.delete("/", deleteDiaNoDisponible);

export default router;
