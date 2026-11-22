import axios from "axios";

export default async function handler(req, res) {
  try {
    const response = await axios.get("https://stoic.tekloon.net/stoic-quote");
    res.status(200).json(response.data); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener la cita." });
  }
}
