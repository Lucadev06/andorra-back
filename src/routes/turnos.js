import express from "express";
import Turno from "../models/Turnos.js";
import Peluquero from "../models/Peluqueros.js"; // ✅ igual que arriba
const router = express.Router();

// Listar turnos
router.get("/", async (req, res) => {
  try {
    const turnos = await Turno.find().populate("peluquero");
    res.json(turnos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear turno (validando duplicado)
router.post("/", async (req, res) => {
  try {
    const { peluquero, fecha } = req.body;
    const existe = await Turno.findOne({ peluquero, fecha: new Date(fecha) });

    if (existe) {
      return res.status(400).json({ error: "Ese horario ya está ocupado" });
    }

    const nuevoTurno = await Turno.create(req.body);
    res.status(201).json(nuevoTurno);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Consultar horarios disponibles
router.get("/disponibles", async (req, res) => {
  try {
    const { peluqueroId, fecha } = req.query;

    const peluquero = await Peluquero.findById(peluqueroId);
    if (!peluquero) return res.status(404).json({ error: "Peluquero no encontrado" });

    const fechaDate = new Date(fecha);
    const diaSemana = fechaDate.toLocaleDateString("es-AR", { weekday: "long" });

    const disponibilidad = peluquero.disponibilidad.find(
      (d) => d.dia.toLowerCase() === diaSemana.toLowerCase()
    );

    if (!disponibilidad) return res.json({ horariosDisponibles: [] });

    const turnosOcupados = await Turno.find({
      peluquero: peluqueroId,
      fecha: {
        $gte: new Date(fechaDate.setHours(0, 0, 0, 0)),
        $lt: new Date(fechaDate.setHours(23, 59, 59, 999)),
      },
    });

    const horariosOcupados = turnosOcupados.map((t) =>
      t.fecha.toISOString().slice(11, 16)
    );

    const libres = disponibilidad.horarios.filter(
      (h) => !horariosOcupados.includes(h)
    );

    res.json({ peluquero: peluquero.nombre, fecha, horariosDisponibles: libres });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
