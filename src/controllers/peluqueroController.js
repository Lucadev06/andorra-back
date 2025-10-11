import Peluquero from "../models/Peluqueros.js";
import Servicio from "../models/Servicio.js";

export const getPeluqueros = async (req, res) => {
  try {
    const peluqueros = await Peluquero.find().populate('servicios');
    res.json(peluqueros);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPeluqueroById = async (req, res) => {
  try {
    const peluquero = await Peluquero.findById(req.params.id).populate('servicios');
    if (peluquero == null) {
      return res.status(404).json({ message: "Cannot find peluquero" });
    }
    res.json(peluquero);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const createPeluquero = async (req, res) => {
  const peluquero = new Peluquero({
    nombre: req.body.nombre,
    especialidad: req.body.especialidad,
    servicios: req.body.servicios,
    disponibilidad: req.body.disponibilidad,
  });

  try {
    const newPeluquero = await peluquero.save();
    res.status(201).json(newPeluquero);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updatePeluquero = async (req, res) => {
  try {
    const updatedPeluquero = await Peluquero.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedPeluquero);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deletePeluquero = async (req, res) => {
  try {
    await Peluquero.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted Peluquero" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addDiaLibre = async (req, res) => {
  const { id } = req.params;
  const { fecha } = req.body;
  console.log("id", id);
  console.log("fecha", fecha);
  console.log("id", id);
  console.log("fecha", fecha);

  try {
    const peluquero = await Peluquero.findById(id);
    if (!peluquero) {
      return res.status(404).json({ message: "Peluquero not found" });
    }

    if (!peluquero.especialidad) {
      peluquero.especialidad = "No especificada";
    }

    if (peluquero.servicios && typeof peluquero.servicios[0] === 'string') {
      const servicioNombres = peluquero.servicios.map(s => s.toString());
      const servicios = await Servicio.find({ nombre: { $in: servicioNombres } });
      peluquero.servicios = servicios.map(s => s._id);
    }

    peluquero.diasLibres.push(new Date(fecha + 'T00:00:00'));
    await peluquero.save();

    res.status(200).json(peluquero);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};