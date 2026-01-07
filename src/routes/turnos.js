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
    
    // Validar que no sea domingo
    const fechaDate = new Date(fechaStr + 'T00:00:00');
    if (fechaDate.getDay() === 0) {
      return res.status(400).json({ error: "Los domingos no están disponibles para turnos" });
    }

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

// 📌 DELETE: Eliminar turno por ID (solo admin)
router.delete("/:id", async (req, res) => {
  try {
    await Turno.findByIdAndDelete(req.params.id);
    res.json({ message: "Turno eliminado" });
  } catch (err) {
    console.error("Error eliminando turno:", err);
    res.status(500).json({ error: "Error eliminando turno" });
  }
});

// 📌 DELETE: Cancelar turno por cliente (con validación de 6 horas)
router.delete("/cancelar/:id", async (req, res) => {
  try {
    const turno = await Turno.findById(req.params.id);
    
    if (!turno) {
      return res.status(404).json({ error: "Turno no encontrado" });
    }

    // Obtener fecha y hora del turno
    const fechaTurno = new Date(turno.fecha);
    const [hora, minuto] = turno.hora.split(":").map(Number);
    fechaTurno.setHours(hora, minuto, 0, 0);

    // Obtener fecha y hora actual del servidor
    const ahora = new Date();

    // Calcular diferencia en milisegundos
    const diferenciaMs = fechaTurno.getTime() - ahora.getTime();
    const diferenciaHoras = diferenciaMs / (1000 * 60 * 60);

    // Validar: no se puede cancelar si faltan 6 horas o menos
    if (diferenciaHoras <= 6) {
      return res.status(400).json({ 
        error: `No se puede cancelar el turno. Debe cancelarse con más de 6 horas de anticipación. Faltan ${Math.round(diferenciaHoras * 10) / 10} horas.` 
      });
    }

    // Si pasa la validación, eliminar el turno
    await Turno.findByIdAndDelete(req.params.id);
    res.json({ message: "Turno cancelado exitosamente" });
  } catch (err) {
    console.error("Error cancelando turno:", err);
    res.status(500).json({ error: "Error cancelando turno" });
  }
});

// 📌 PUT: Editar turno
router.put("/:id", async (req, res) => {
  try {
    const { fecha } = req.body;
    
    // Si se está editando la fecha, validar que no sea domingo
    if (fecha) {
      const fechaStr = typeof fecha === "string" ? fecha : new Date(fecha).toISOString().split("T")[0];
      const fechaDate = new Date(fechaStr + 'T00:00:00');
      if (fechaDate.getDay() === 0) {
        return res.status(400).json({ error: "Los domingos no están disponibles para turnos" });
      }
      req.body.fecha = fechaStr;
    }
    
    const turnoEditado = await Turno.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ data: turnoEditado });
  } catch (err) {
    console.error("Error editando turno:", err);
    res.status(500).json({ error: "Error editando turno" });
  }
});

export default router;
