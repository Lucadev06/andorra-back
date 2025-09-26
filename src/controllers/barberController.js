import Barber from "../models/Barber.js";

export const getBarbers = async (req, res) => {
  try {
    const barbers = await Barber.find();
    res.json(barbers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createBarber = async (req, res) => {
  try {
    const newBarber = new Barber(req.body);
    await newBarber.save();
    res.status(201).json(newBarber);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
