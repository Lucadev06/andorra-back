import Servicio from "../models/Servicio.js";

export const getServicios = async (req, res) => {
  try {
    const servicios = await Servicio.find();
    res.json(servicios);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getServicioById = async (req, res) => {
  try {
    const servicio = await Servicio.findById(req.params.id);
    if (servicio == null) {
      return res.status(404).json({ message: "Cannot find servicio" });
    }
    res.json(servicio);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const createServicio = async (req, res) => {
  const servicio = new Servicio({
    nombre: req.body.nombre,
    descripcion: req.body.descripcion,
    duracion: req.body.duracion,
    precio: req.body.precio,
  });

  try {
    const newServicio = await servicio.save();
    res.status(201).json(newServicio);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateServicio = async (req, res) => {
  try {
    const updatedServicio = await Servicio.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedServicio);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteServicio = async (req, res) => {
  try {
    await Servicio.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted Servicio" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
