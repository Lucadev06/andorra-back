import express from "express";
import Turno from "../models/Turnos.js";

const router = express.Router();

// 📌 GET: Obtener turnos (opcionalmente filtrado por fecha)
// 📌 GET: Obtener turnos (opcionalmente filtrado por fecha)
router.get("/", async (req, res) => {
  try {
    const { fecha } = req.query;
    const query = fecha ? { fecha: { $regex: `^${fecha}` } } : {};
    const turnos = await Turno.find(query).populate("peluquero"); // 👈 útil si peluquero es ref
    res.json({ data: turnos });
  } catch (err) {
    console.error("Error obteniendo turnos:", err);
    res.status(500).json({ error: "Error obteniendo turnos" });
  }
});

// 📌 GET: Obtener horarios disponibles para un peluquero en una fecha
// 📌 GET: Obtener horarios disponibles para un peluquero en una fecha
// 📌 GET: Obtener horarios disponibles para un peluquero en una fecha
router.get("/disponibles", async (req, res) => {
  try {
    const { peluqueroId, fecha } = req.query;

    if (!peluqueroId || !fecha) {
      return res
        .status(400)
        .json({ error: "Faltan parámetros (peluqueroId y fecha)" });
    }

    // Normalizamos fecha a solo día
    const fechaISO = new Date(fecha).toISOString().split("T")[0];

    // Buscamos turnos del peluquero en esa fecha
    const turnos = await Turno.find({
      peluquero: peluqueroId,
      fecha: { $regex: `^${fechaISO}` },
    });

    // Generamos horarios
    const horarios = [];
    for (let h = 9; h <= 19; h++) {
      horarios.push(`${String(h).padStart(2, "0")}:00`);
      horarios.push(`${String(h).padStart(2, "0")}:30`);
    }

    // Filtramos ocupados
    const ocupados = turnos.map((t) => t.hora);
    const disponibles = horarios.filter((h) => !ocupados.includes(h));

    res.json({ data: disponibles });
  } catch (err) {
    console.error("Error obteniendo horarios disponibles:", err);
    res.status(500).json({ error: "Error obteniendo horarios disponibles" });
  }
});

router.get("/email/:mail", async (req, res) => {
  try {
    const turnos = await Turno.find({ mail: req.params.mail }).populate("peluquero");
    res.json({ data: turnos });
  } catch (err) {
    console.error("Error obteniendo turnos por email:", err);
    res.status(500).json({ error: "Error obteniendo turnos por email" });
  }
});

router.post("/", async (req, res) => {
  try {
    console.log("📥 Body recibido:", req.body); // 👈 LOG CLAVE

    const { peluquero, cliente, mail, fecha, hora, servicio } = req.body;

    if (!cliente || !mail || !fecha || !hora) {
      console.warn("⚠️ Faltan datos:", { cliente, mail, fecha, hora });
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // Normalizamos fecha para evitar problemas de comparación
    const fechaStr =
      typeof fecha === "string" ? fecha : new Date(fecha).toISOString().split("T")[0];

    console.log("🔎 Buscando turno en:", {
      peluquero,
      fecha: fechaStr,
      hora,
    });

    const existe = await Turno.findOne({ peluquero, fecha: fechaStr, hora });
    if (existe) {
      return res.status(400).json({ error: "Ese turno ya está ocupado" });
    }

    const nuevoTurno = await Turno.create({
      peluquero,
      cliente,
      mail,
      fecha: fechaStr,
      hora,
      servicio, // 👈 si lo tenés en el schema
    });

    console.log("✅ Turno creado:", nuevoTurno);
    res.status(201).json({ data: nuevoTurno });
  } catch (err) {
    console.error("❌ Error creando turno:", err);
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
