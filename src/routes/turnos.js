import express from "express";
import Turno from "../models/Turnos.js";
import DiaNoDisponible from "../models/DiasNoDisponibles.js";
import {
  isDateWithinAdvanceBookingWindow,
  isTimeAllowedForDate,
} from "../utils/fixedSchedule.js";

const router = express.Router();

const normalizarFecha = (fecha) => {
  if (!fecha) return null;

  if (typeof fecha === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return fecha;
    }

    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toISOString().split("T")[0];
  }

  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().split("T")[0];
};

const rangoFechaUTC = (fechaStr) => {
  const inicio = new Date(`${fechaStr}T00:00:00.000Z`);
  const fin = new Date(inicio);
  fin.setUTCDate(fin.getUTCDate() + 1);
  return { inicio, fin };
};

const estaHorarioBloqueado = async (fechaStr, hora) => {
  const { inicio, fin } = rangoFechaUTC(fechaStr);
  const bloqueo = await DiaNoDisponible.findOne({
    fecha: { $gte: inicio, $lt: fin },
  });

  if (!bloqueo) {
    return false;
  }

  if (!Array.isArray(bloqueo.horarios) || bloqueo.horarios.length === 0) {
    return true;
  }

  return bloqueo.horarios.includes(hora);
};

// 📌 GET: Obtener turnos (opcionalmente filtrado por fecha)
// 📌 GET: Obtener turnos (opcionalmente filtrado por fecha)
router.get("/", async (req, res) => {
  try {
    const { fecha } = req.query;
    const query = fecha ? { fecha: { $regex: `^${fecha}` } } : {};
    const turnos = await Turno.find(query).lean();
    res.json({
      data: turnos.map((t) => ({ ...t, telefono: t.telefono || "" })),
    });
  } catch (err) {
    console.error("Error obteniendo turnos:", err);
    res.status(500).json({ error: "Error obteniendo turnos" });
  }
});



router.get("/email/:mail", async (req, res) => {
  try {
    const turnos = await Turno.find({ mail: req.params.mail }).lean();
    res.json({
      data: turnos.map((t) => ({ ...t, telefono: t.telefono || "" })),
    });
  } catch (err) {
    console.error("Error obteniendo turnos por email:", err);
    res.status(500).json({ error: "Error obteniendo turnos por email" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { cliente, mail, telefono, fecha, hora, servicio } = req.body;

    if (!cliente || !mail || !telefono || !fecha || !hora || !servicio) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const fechaStr = normalizarFecha(fecha);
    if (!fechaStr) {
      return res.status(400).json({ error: "La fecha es inválida" });
    }
    
    // Validar que no sea domingo
    const fechaDate = new Date(`${fechaStr}T00:00:00.000Z`);
    if (fechaDate.getUTCDay() === 0) {
      return res.status(400).json({ error: "Los domingos no están disponibles para turnos" });
    }

    if (!isDateWithinAdvanceBookingWindow(fechaDate)) {
      return res.status(400).json({ error: "Solo se puede reservar hasta 14 días de anticipación" });
    }

    if (!isTimeAllowedForDate(fechaDate, hora)) {
      return res.status(400).json({ error: "Ese horario no está habilitado para el día seleccionado" });
    }

    const hoyUTC = new Date();
    hoyUTC.setUTCHours(0, 0, 0, 0);

    const turnosVigentesDelCliente = await Turno.countDocuments({
      mail,
      fecha: { $gte: hoyUTC },
    });

    if (turnosVigentesDelCliente >= 5) {
      return res.status(409).json({ error: "Ya tenés 5 turnos reservados, no podés sacar otro." });
    }

    const bloqueado = await estaHorarioBloqueado(fechaStr, hora);
    if (bloqueado) {
      return res.status(409).json({ error: "Ese horario está bloqueado y no se puede reservar" });
    }

    const nuevoTurno = await Turno.create({
      cliente,
      mail,
      telefono,
      fecha: fechaStr,
      hora,
      servicio,
    });

    res.status(201).json({ data: nuevoTurno });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Ese turno ya está ocupado" });
    }
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

// 📌 PUT: Editar turno (solo admin)
router.put("/:id", async (req, res) => {
  try {
    const { fecha, hora } = req.body;
    const turnoActual = await Turno.findById(req.params.id);

    if (!turnoActual) {
      return res.status(404).json({ error: "Turno no encontrado" });
    }

    const fechaFinal = fecha ? normalizarFecha(fecha) : normalizarFecha(turnoActual.fecha);
    const horaFinal = hora || turnoActual.hora;

    if (!fechaFinal) {
      return res.status(400).json({ error: "La fecha es inválida" });
    }
    
    // Si se está editando la fecha, validar que no sea domingo
    const fechaDate = new Date(`${fechaFinal}T00:00:00.000Z`);
    if (fechaDate.getUTCDay() === 0) {
      return res.status(400).json({ error: "Los domingos no están disponibles para turnos" });
    }

    if (!isTimeAllowedForDate(fechaDate, horaFinal)) {
      return res.status(400).json({ error: "Ese horario no está habilitado para el día seleccionado" });
    }

    const bloqueado = await estaHorarioBloqueado(fechaFinal, horaFinal);
    if (bloqueado) {
      return res.status(409).json({ error: "Ese horario está bloqueado y no se puede reservar" });
    }

    const existe = await Turno.findOne({
      fecha: fechaFinal,
      hora: horaFinal,
      _id: { $ne: req.params.id },
    });

    if (existe) {
      return res.status(409).json({ error: "Ese turno ya está ocupado" });
    }

    req.body.fecha = fechaFinal;
    req.body.hora = horaFinal;
    
    const turnoEditado = await Turno.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ data: turnoEditado });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Ese turno ya está ocupado" });
    }
    console.error("Error editando turno:", err);
    res.status(500).json({ error: "Error editando turno" });
  }
});

// 📌 PUT: Editar turno por cliente (con validación de 6 horas)
router.put("/editar/:id", async (req, res) => {
  try {
    const turno = await Turno.findById(req.params.id);
    
    if (!turno) {
      return res.status(404).json({ error: "Turno no encontrado" });
    }

    // Obtener fecha y hora original del turno
    const fechaTurnoOriginal = new Date(turno.fecha);
    const [horaOriginal, minutoOriginal] = turno.hora.split(":").map(Number);
    fechaTurnoOriginal.setHours(horaOriginal, minutoOriginal, 0, 0);

    // Obtener fecha y hora actual del servidor
    const ahora = new Date();

    // Calcular diferencia en milisegundos
    const diferenciaMs = fechaTurnoOriginal.getTime() - ahora.getTime();
    const diferenciaHoras = diferenciaMs / (1000 * 60 * 60);

    // Validar: no se puede editar si faltan 6 horas o menos
    if (diferenciaHoras <= 6) {
      return res.status(400).json({ 
        error: `No se puede editar el turno. Debe editarse con más de 6 horas de anticipación. Faltan ${Math.round(diferenciaHoras * 10) / 10} horas.` 
      });
    }

    const { fecha, hora } = req.body;

    // Validar que no sea domingo si se cambia la fecha
    if (fecha) {
      const fechaStr = normalizarFecha(fecha);
      if (!fechaStr) {
        return res.status(400).json({ error: "La fecha es inválida" });
      }
      const fechaDate = new Date(`${fechaStr}T00:00:00.000Z`);
      if (fechaDate.getUTCDay() === 0) {
        return res.status(400).json({ error: "Los domingos no están disponibles para turnos" });
      }
      req.body.fecha = fechaStr;
    }

    // Verificar que el nuevo turno no esté ocupado (si cambió fecha o hora)
    if (fecha || hora) {
      const fechaFinal = fecha
        ? normalizarFecha(fecha)
        : normalizarFecha(turno.fecha);
      const horaFinal = hora || turno.hora;

      if (!fechaFinal) {
        return res.status(400).json({ error: "La fecha es inválida" });
      }

      const bloqueado = await estaHorarioBloqueado(fechaFinal, horaFinal);
      if (bloqueado) {
        return res.status(409).json({ error: "Ese horario está bloqueado y no se puede reservar" });
      }

      const fechaDate = new Date(`${fechaFinal}T00:00:00.000Z`);
      if (!isTimeAllowedForDate(fechaDate, horaFinal)) {
        return res.status(400).json({ error: "Ese horario no está habilitado para el día seleccionado" });
      }
      
      const existe = await Turno.findOne({ 
        fecha: fechaFinal, 
        hora: horaFinal,
        _id: { $ne: req.params.id } // Excluir el turno actual
      });
      
      if (existe) {
        return res.status(409).json({ error: "Ese turno ya está ocupado" });
      }
    }

    const turnoEditado = await Turno.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ data: turnoEditado });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Ese turno ya está ocupado" });
    }
    console.error("Error editando turno:", err);
    res.status(500).json({ error: "Error editando turno" });
  }
});

export default router;
