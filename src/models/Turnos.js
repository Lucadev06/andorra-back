// models/Turno.js
import mongoose from "mongoose";

const turnoSchema = new mongoose.Schema({
  peluquero: { type: String, required: true },
  cliente: { type: String, required: true },
  fecha: { type: Date, required: true },
  hora: { type: String, required: true }
});

export default mongoose.model("Turno", turnoSchema);
