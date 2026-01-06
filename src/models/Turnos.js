import mongoose from "mongoose";

const TurnoSchema = new mongoose.Schema({
  cliente: { type: String, required: true },
  mail: { type: String, required: true },
  fecha: { type: Date, required: true },
  hora: { type: String, required: true },
  servicio: { type: String, required: true },
});

TurnoSchema.index({ fecha: 1, hora: 1 }, { unique: true });

export default mongoose.model("Turno", TurnoSchema);
