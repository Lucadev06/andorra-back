import express from "express";
import {
  getPeluqueros,
  getPeluqueroById,
  createPeluquero,
  updatePeluquero,
  deletePeluquero,
} from "../controllers/peluqueroController.js";

const router = express.Router();

router.get("/", getPeluqueros);
router.get("/:id", getPeluqueroById);
router.post("/", createPeluquero);
router.put("/:id", updatePeluquero);
router.delete("/:id", deletePeluquero);

export default router;