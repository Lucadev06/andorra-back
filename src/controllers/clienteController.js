import Cliente from "../models/Cliente.js";

export const getClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find();
    res.json(clientes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getClienteById = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (cliente == null) {
      return res.status(404).json({ message: "Cannot find cliente" });
    }
    res.json(cliente);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const createCliente = async (req, res) => {
  const cliente = new Cliente({
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    telefono: req.body.telefono,
    email: req.body.email,
  });

  try {
    const newCliente = await cliente.save();
    res.status(201).json(newCliente);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateCliente = async (req, res) => {
  try {
    const updatedCliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedCliente);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteCliente = async (req, res) => {
  try {
    await Cliente.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted Cliente" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
