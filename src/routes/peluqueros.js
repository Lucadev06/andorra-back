import express from "express";
import Peluquero from "../models/Peluqueros.js";

const router = express.Router();

// Obtener todos los peluqueros activos desde Atlas
router.get("/", async (req, res) => {
  try {
    const peluqueros = await Peluquero.find({ activo: true });
    res.json(peluqueros);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
