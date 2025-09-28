import express from "express";
import {
  getServicios,
  getServicioById,
  createServicio,
  updateServicio,
  deleteServicio,
} from "../controllers/servicioController.js";

const router = express.Router();

router.get("/", getServicios);
router.get("/:id", getServicioById);
router.post("/", createServicio);
router.put("/:id", updateServicio);
router.delete("/:id", deleteServicio);

export default router;
