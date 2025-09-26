import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

import turnosRoutes from "./routes/turnos.js";
import peluquerosRoutes from "./routes/peluqueros.js";

dotenv.config();

const app = express();
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => console.error("❌ Error de conexión:", err));

app.use("/api/turnos", turnosRoutes);
app.use("/api/peluqueros", peluquerosRoutes);

export default app;
