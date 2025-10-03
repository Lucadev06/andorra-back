import Turno from "../models/Turnos.js";

export const getTurnos = async (req, res) => {
  try {
    const turnos = await Turno.find().populate('peluquero').populate('cliente').populate('servicio');
    res.json(turnos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTurnoById = async (req, res) => {
  try {
    const turno = await Turno.findById(req.params.id).populate('peluquero').populate('cliente').populate('servicio');
    if (turno == null) {
      return res.status(404).json({ message: "Cannot find turno" });
    }
    res.json(turno);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const createTurno = async (req, res) => {
  const { cliente, fecha, hora, servicio, peluquero } = req.body;

  const fechaUTC = new Date(fecha);

  try {
    const existingTurno = await Turno.findOne({ peluquero, fecha: fechaUTC, hora });
    if (existingTurno) {
      return res.status(409).json({ message: "El turno ya está ocupado." });
    }

    const turno = new Turno({
      cliente,
      fecha: fechaUTC,
      hora,
      servicio,
      peluquero,
    });

    const newTurno = await turno.save();
    res.status(201).json(newTurno);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "El turno ya está ocupado." });
    }
    res.status(400).json({ message: err.message });
  }
};

export const updateTurno = async (req, res) => {
  const { id } = req.params;
  const { cliente, fecha, hora, servicio, peluquero } = req.body;

  const fechaUTC = new Date(fecha);

  try {
    const existingTurno = await Turno.findOne({ peluquero, fecha: fechaUTC, hora, _id: { $ne: id } });
    if (existingTurno) {
      return res.status(409).json({ message: "El turno ya está ocupado." });
    }

    const updatedTurno = await Turno.findByIdAndUpdate(id, { cliente, fecha: fechaUTC, hora, servicio, peluquero }, { new: true });
    if (!updatedTurno) {
      return res.status(404).json({ message: "Turno no encontrado." });
    }

    res.json(updatedTurno);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "El turno ya está ocupado." });
    }
    res.status(400).json({ message: err.message });
  }
};

export const deleteTurno = async (req, res) => {
  try {
    await Turno.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted Turno" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
