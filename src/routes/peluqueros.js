import express from "express";
import Peluquero from "../models/Peluqueros.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const peluqueros = await Peluquero.find({ activo: true }); // 👈 Filtra solo activos
    console.log("📡 Peluqueros desde DB:", peluqueros);        // 👈 Agregar este log
    res.set("Cache-Control", "no-store");
    res.json(peluqueros);
  } catch (error) {
    console.error("❌ Error en /peluqueros:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
