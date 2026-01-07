import express from "express";
const router = express.Router();

// Contraseña de admin (en producción, usar variable de entorno)
const ADMIN_PASSWORD = "1234";

// POST: Verificar contraseña de admin
router.post("/verify", (req, res) => {
  try {
    const { password } = req.body;

    console.log("Intento de login admin. Contraseña recibida:", password ? "***" : "vacía");
    console.log("Contraseña esperada:", ADMIN_PASSWORD);

    if (!password) {
      return res.status(400).json({ error: "Contraseña requerida" });
    }

    if (password === ADMIN_PASSWORD) {
      console.log("✅ Contraseña correcta");
      return res.json({ valid: true });
    } else {
      console.log("❌ Contraseña incorrecta");
      return res.json({ valid: false });
    }
  } catch (err) {
    console.error("Error verificando contraseña:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
});

export default router;

