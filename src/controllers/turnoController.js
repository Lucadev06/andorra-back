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
  const turno = new Turno({
    cliente: req.body.cliente,
    fecha: req.body.fecha,
    servicio: req.body.servicio,
    peluquero: req.body.peluquero,
  });

  try {
    const newTurno = await turno.save();
    res.status(201).json(newTurno);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateTurno = async (req, res) => {
  try {
    const updatedTurno = await Turno.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedTurno);
  } catch (err) {
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
