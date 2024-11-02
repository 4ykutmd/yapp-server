const express = require('express');
const router = express.Router();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GENAI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

router.post('/', async (req, res) => {
    const body = req.body;
    const manualPrompt = body.prompt;
    const hazirPrompt = body.promptType || '1';
    const history = body.history || [];

    if (hazirPrompt === '1' && !manualPrompt) 
        res.status(400).json({ error: 'Prompt type 1 requires a manual prompt' });

    //console.log(history)
    const chat = model.startChat({
        history: history,
    })
    let result = await chat.sendMessage(manualPrompt);
    let final_result = result.response.text();
    
    res.status(200).json({ cevap: final_result });
});

module.exports = router;