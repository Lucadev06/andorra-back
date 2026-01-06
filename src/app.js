import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import turnosRoutes from "./routes/turnos.js";
import diasNoDisponiblesRoutes from "./routes/diasNoDisponibles.js";


dotenv.config();

const app = express();
app.use(
  cors({
    origin: "*", // 👈 Permite cualquier origen (ideal para pruebas)
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());

// 👇 Conexión a Mongo
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB:", process.env.MONGO_URI))
  .catch((err) => console.error("❌ Error de conexión:", err));


app.use("/api/turnos", turnosRoutes);
app.use("/api/dias-no-disponibles", diasNoDisponiblesRoutes);


export default app;
