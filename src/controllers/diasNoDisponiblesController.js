import DiaNoDisponible from "../models/DiasNoDisponibles.js";

export const getDiasNoDisponibles = async (req, res) => {
  try {
    const dias = await DiaNoDisponible.find();
    res.json(dias);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createDiaNoDisponible = async (req, res) => {
  const { fecha, horarios } = req.body;

  const fechaUTC = new Date(fecha);

  try {
    const existingDia = await DiaNoDisponible.findOne({ fecha: fechaUTC });
    if (existingDia) {
      if (horarios && horarios.length > 0) {
        existingDia.horarios.push(...horarios);
        await existingDia.save();
        return res.status(200).json(existingDia);
      } else {
        return res.status(409).json({ message: "El día ya está marcado como no disponible." });
      }
    }

    const dia = new DiaNoDisponible({
      fecha: fechaUTC,
      horarios,
    });

    const newDia = await dia.save();
    res.status(201).json(newDia);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteDiaNoDisponible = async (req, res) => {
  const { fecha, horario } = req.body;
  const fechaUTC = new Date(fecha);

  try {
    const dia = await DiaNoDisponible.findOne({ fecha: fechaUTC });
    if (!dia) {
      return res.status(404).json({ message: "Día no encontrado." });
    }

    if (horario) {
      dia.horarios = dia.horarios.filter((h) => h !== horario);
      await dia.save();
    } else {
      await DiaNoDisponible.findByIdAndDelete(dia._id);
    }

    res.json({ message: "Disponibilidad actualizada." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
