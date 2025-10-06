import mongoose from "mongoose";

const TurnoSchema = new mongoose.Schema({
  peluquero: { type: mongoose.Schema.Types.ObjectId, ref: "Peluquero", required: true },
  cliente: { type: String, required: true },
  mail: { type: String, required: true },
  fecha: { type: Date, required: true },
  hora: { type: String, required: true },
  servicio: { type: String, required: true },
});

TurnoSchema.index({ peluquero: 1, fecha: 1, hora: 1 }, { unique: true });

export default mongoose.model("Turno", TurnoSchema);
