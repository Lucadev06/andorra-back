import express from "express";
import peluquerosData from "../data/peluqueros.json" assert { type: "json" };

const router = express.Router();

let turnos = []; // ⚠️ en memoria, se vacía al reiniciar el servidor

// Traer todos los turnos
router.get("/", (req, res) => {
  res.json(turnos);
});

// Crear turno
router.post("/", (req, res) => {
  const { peluquero, fecha } = req.body;
  const existe = turnos.find(
    (t) => t.peluquero === peluquero && t.fecha === fecha
  );
  if (existe) return res.status(400).json({ error: "Ese horario ya está ocupado" });

  const nuevo = { id: Date.now().toString(), ...req.body };
  turnos.push(nuevo);
  res.status(201).json(nuevo);
});

// Consultar horarios disponibles
router.get("/disponibles", (req, res) => {
  const { peluqueroId, fecha } = req.query;

  const peluquero = peluquerosData.find((p) => p.id === peluqueroId);
  if (!peluquero) return res.status(404).json({ error: "Peluquero no encontrado" });

  const diaSemana = new Date(fecha).toLocaleDateString("es-AR", { weekday: "long" });
  const disponibilidad = peluquero.disponibilidad.find(
    (d) => d.dia.toLowerCase() === diaSemana.toLowerCase()
  );

  if (!disponibilidad) return res.json({ horariosDisponibles: [] });

  const ocupados = turnos
    .filter((t) => t.peluquero === peluqueroId && t.fecha.startsWith(fecha))
    .map((t) => t.fecha.split("T")[1].slice(0, 5));

  const libres = disponibilidad.horarios.filter((h) => !ocupados.includes(h));

  res.json({ peluquero: peluquero.nombre, fecha, horariosDisponibles: libres });
});

export default router;
