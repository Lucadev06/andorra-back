import mongoose from "mongoose";

const TurnoSchema = new mongoose.Schema({
  cliente: { type: String, required: true },
  fecha: { type: Date, required: true },
  servicio: { type: String, required: true },
  peluquero: { type: mongoose.Schema.Types.ObjectId, ref: "Peluquero", required: true },
});

const Turno = mongoose.model("Turno", TurnoSchema);
export default Turno;
