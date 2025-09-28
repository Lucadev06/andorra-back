import mongoose from "mongoose";

const ServicioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String },
  duracion: { type: Number, required: true }, // en minutos
  precio: { type: Number, required: true },
});

const Servicio = mongoose.model("Servicio", ServicioSchema);
export default Servicio;
