import express from "express";
import Peluquero from "../models/Peluqueros.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const peluqueros = await Peluquero.find({ activo: true });
    console.log("PELQUEROS DESDE DB:", peluqueros); // 👈 Para debug en Render
    res.set("Cache-Control", "no-store");
    res.json(peluqueros);
  } catch (error) {
    console.error("ERROR AL TRAER PELUQUEROS:", error);
    res.status(500).json({ error: error.message });
  }
});



export default router;
