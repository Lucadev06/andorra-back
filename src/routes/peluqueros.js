import express from "express";
import Peluquero from "../models/Peluqueros.js";

const router = express.Router();

// Listar peluqueros
router.get("/", async (req, res) => {
  try {
    const peluqueros = await Peluquero.find({ activo: true });
    res.json(peluqueros);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint opcional para cargar peluqueros iniciales
router.post("/seed", async (req, res) => {
  try {
    const dataInicial = [
      {
        nombre: "Juan",
        especialidad: "Cortes",
        servicios: ["Corte", "Barba"],
        disponibilidad: [
          { dia: "Lunes", horarios: ["10:00", "11:00", "15:00"] },
          { dia: "Martes", horarios: ["10:00", "12:00", "16:00"] },
        ],
      },
      {
        nombre: "Pedro",
        especialidad: "Color",
        servicios: ["Coloración"],
        disponibilidad: [
          { dia: "Miércoles", horarios: ["10:00", "11:30", "15:30"] },
          { dia: "Jueves", horarios: ["10:00", "12:00"] },
        ],
      },
    ];

    await Peluquero.insertMany(dataInicial);
    res.json({ mensaje: "✅ Peluqueros iniciales cargados" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
