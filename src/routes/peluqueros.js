import express from "express";
import peluquerosData from "../data/peluqueros.json" assert { type: "json" };

const router = express.Router();

router.get("/", (req, res) => {
  res.json(peluquerosData);
});

export default router;
