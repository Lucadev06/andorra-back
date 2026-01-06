import express from "express";
import Turno from "../models/Turnos.js";

const router = express.Router();

// 📌 GET: Obtener turnos (opcionalmente filtrado por fecha)
// 📌 GET: Obtener turnos (opcionalmente filtrado por fecha)
router.get("/", async (req, res) => {
  try {
    const { fecha } = req.query;
    const query = fecha ? { fecha: { $regex: `^${fecha}` } } : {};
    const turnos = await Turno.find(query); // 👈 útil si peluquero es ref
    res.json({ data: turnos });
  } catch (err) {
    console.error("Error obteniendo turnos:", err);
    res.status(500).json({ error: "Error obteniendo turnos" });
  }
});



router.get("/email/:mail", async (req, res) => {
  try {
    const turnos = await Turno.find({ mail: req.params.mail });
    res.json({ data: turnos });
  } catch (err) {
    console.error("Error obteniendo turnos por email:", err);
    res.status(500).json({ error: "Error obteniendo turnos por email" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { cliente, mail, fecha, hora, servicio } = req.body;

    if (!cliente || !mail || !fecha || !hora || !servicio) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const fechaStr =
      typeof fecha === "string" ? fecha : new Date(fecha).toISOString().split("T")[0];

    const existe = await Turno.findOne({ fecha: fechaStr, hora });
    if (existe) {
      return res.status(400).json({ error: "Ese turno ya está ocupado" });
    }

    const nuevoTurno = await Turno.create({
      cliente,
      mail,
      fecha: fechaStr,
      hora,
      servicio,
    });

    res.status(201).json({ data: nuevoTurno });
  } catch (err) {
    res.status(500).json({ error: err.message || "Error creando turno" });
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
