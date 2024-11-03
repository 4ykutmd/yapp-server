const express = require("express");
const app = express();
const port = 3000;

require("dotenv").config();

// const bodyParser = require('body-parser')
// app.use(bodyParser.json()) // for parsing application/json
// app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// for parsing multipart/form-data
// app.use(upload.array());
// app.use(express.static('public'));

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GENAI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.get("/api/soru-sor", async (req, res) => {
  const manualPrompt = req.query.soru;
  const type = req.query.type || "1";
  const number = req.query.number || "15";

  // 1: soru cozdur
  // 2: sorudaki konuyu anlatmasini iste(foto secerse caliscak)
  // 3: belirtilen konuyu anlatmasini iste
  // 4: test hazirlamasini iste cevap JSON seklinde gelir.

  const prompt =
    type === "1"
      ? "Görseldeki soruyu çözer misin?"
      : type === "2"
      ? "Sorudaki konuyu anlatır mısın?"
      : type === "3"
      ? "Belirttiğim konuyu anlatır mısın?"
      : type === "4"
      ? `Bana belirttigim konu hakkında 5er şıktan oluşan ${number} soru hazırlar mısın? Soru numaralarını belirtme, başta bir açıklama yapma. Format: {soru:string,secenekler:string[],cevap:string},`
      : type === "5"
      ? "Bana belirttiğim konu hakkında 7 günlük bir ders planı hazırlar msısın? Başta bir açıklama yapma. Format: {gün:string, konu:string}"
      : "Naber";
  if (!manualPrompt) {
    res.status(400).json({ error: "Soru parametresi zorunludur." });
    return;
  }

  const result = await model.generateContent([
    {
      text: manualPrompt + prompt,
    },
  ]);

  const final_result = result.response
    .text()
    //.replaceAll(/\n|\r/g,'')
    .replaceAll("**", "")
    .replaceAll("```json", "")
    .replaceAll("```", "");
  //console.log(final_result)

  res.status(200).json({ cevap: final_result });
});

const importChatPage = require("./chatPage.js");
app.use("/api/chat", importChatPage);

app.listen(port, () => {
  console.log(`YAPP Server is listening on port ${port}`);
});
