import mongoose from "mongoose";

const PeluqueroSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  especialidad: { type: String, required: true },
  servicios: [{ type: mongoose.Schema.Types.ObjectId, ref: "Servicio" }],
  disponibilidad: [
    {
      dia: { type: String, required: true },
      horarios: [{ type: String, required: true }],
    },
  ],
  activo: { type: Boolean, default: true },
  diasLibres: [{ type: Date }],
});

const Peluquero = mongoose.model("Peluquero", PeluqueroSchema);
export default Peluquero;
