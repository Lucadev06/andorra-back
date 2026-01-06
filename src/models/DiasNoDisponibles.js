import mongoose from "mongoose";

const DiaNoDisponibleSchema = new mongoose.Schema({
  fecha: { type: Date, required: true, unique: true },
  horarios: [{ type: String }],
});

export default mongoose.model("DiaNoDisponible", DiaNoDisponibleSchema);
