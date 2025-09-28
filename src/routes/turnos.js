import express from "express";
import Turno from "../models/Turnos.js";

const router = express.Router();

// 📌 GET: Obtener turnos (opcionalmente filtrado por fecha)
router.get("/", async (req, res) => {
  try {
    const { fecha } = req.query;
    const query = fecha ? { fecha: new Date(fecha) } : {};
    const turnos = await Turno.find(query);
    res.json({ data: turnos });
  } catch (err) {
    console.error("Error obteniendo turnos:", err);
    res.status(500).json({ error: "Error obteniendo turnos" });
  }
});

// 📌 POST: Crear un nuevo turno
router.post("/", async (req, res) => {
  try {
    const { peluquero, cliente, fecha, hora } = req.body;

    // Evitamos doble turno en mismo horario y peluquero
    const existe = await Turno.findOne({ peluquero, fecha, hora });
    if (existe) {
      return res.status(400).json({ error: "Ese turno ya está ocupado" });
    }

    const nuevoTurno = await Turno.create({ peluquero, cliente, fecha, hora });
    res.status(201).json({ data: nuevoTurno });
  } catch (err) {
    console.error("Error creando turno:", err);
    res.status(500).json({ error: "Error creando turno" });
  }
});

// 📌 DELETE: Eliminar turno por ID
router.delete("/:id", async (req, res) => {
  try {
    await Turno.findByIdAndDelete(req.params.id);
    res.json({ message: "Turno eliminado" });
  } catch (err) {
    console.error("Error eliminando turno:", err);
    res.status(500).json({ error: "Error eliminando turno" });
  }
});

// 📌 PUT: Editar turno
router.put("/:id", async (req, res) => {
  try {
    const turnoEditado = await Turno.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ data: turnoEditado });
  } catch (err) {
    console.error("Error editando turno:", err);
    res.status(500).json({ error: "Error editando turno" });
  }
});

export default router;
