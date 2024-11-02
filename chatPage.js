const express = require('express');
const router = express.Router();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GENAI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

router.get('/', (req, res) => {
    const manualPrompt = req.query.mesaj;
    const hazirPrompt = req.query.promptType || '1';

    if (hazirPrompt === '1' && !manualPrompt) {

    }
});

module.exports = router;