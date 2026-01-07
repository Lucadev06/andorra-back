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
        // Add specific hours if they don't already exist
        horarios.forEach(h => {
          if (!existingDia.horarios.includes(h)) {
            existingDia.horarios.push(h);
          }
        });
        await existingDia.save();
        return res.status(200).json(existingDia);
      } else {
        // If an empty array is sent, it means block the entire day
        if (existingDia.horarios.length > 0) {
          existingDia.horarios = []; // Clear all specific blocked hours
          await existingDia.save();
          return res.status(200).json(existingDia);
        } else {
          // Day is already fully blocked
          return res.status(409).json({ message: "El día ya está marcado como no disponible." });
        }
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

// Función helper para generar todos los horarios posibles
const generarTodosLosHorarios = () => {
  const horarios = [];
  for (let hora = 10; hora < 20; hora++) {
    for (let minuto = 0; minuto < 60; minuto += 30) {
      horarios.push(`${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`);
    }
  }
  return horarios;
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
      // Remover el horario específico del array
      if (!Array.isArray(dia.horarios)) {
        dia.horarios = [];
      }
      dia.horarios = dia.horarios.filter((h) => h !== horario);
      
      // Si después de filtrar no quedan horarios bloqueados, eliminar el registro completo
      if (dia.horarios.length === 0) {
        await DiaNoDisponible.findByIdAndDelete(dia._id);
        return res.json({ message: "Horario desbloqueado. Día completamente disponible." });
      }
      
      await dia.save();
      // Devolver el día actualizado
      return res.json(dia);
    } else {
      await DiaNoDisponible.findByIdAndDelete(dia._id);
      return res.json({ message: "Disponibilidad actualizada." });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
