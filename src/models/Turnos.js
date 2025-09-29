import mongoose from "mongoose";

const TurnoSchema = new mongoose.Schema({
  peluquero: { type: mongoose.Schema.Types.ObjectId, ref: "Peluquero", required: true },
  cliente: { type: String, required: true },
  fecha: { type: String, required: true }, // guardamos "YYYY-MM-DD"
  hora: { type: String, required: true },  // guardamos "HH:mm"
  servicio: { type: String }, // opcional
});

export default mongoose.model("Turno", TurnoSchema);
