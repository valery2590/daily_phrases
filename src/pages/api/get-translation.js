import axios from "axios";

export default async function handler(req, res) {
  let textToTranslate = req.body.text;
  console.log(textToTranslate, "texto....");
  let dataSend = JSON.stringify({
    q: textToTranslate,
    source: "auto",
    target: "es",
    format: "text",
    alternatives: 3,
  });

  try {
    const res = await fetch("https://libretranslate.com/translate", {
        method: "POST",
        body: JSON.stringify({
          q: textToTranslate,
          source: "en",
          target: "es",
        }),
        headers: { "Content-Type": "application/json" },
      });
      console.log(await res.json());


    //res.status(200).json(response.data);
  } catch (error) {
    console.error(error, "Error en la solicitud");

    res.status(500).json({ error: "Error al obtener la traducción." });
  }
}
