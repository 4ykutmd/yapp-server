const express = require('express')
const app = express()
const port = 3000

require('dotenv').config()

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GENAI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.listen(port, () => {
    console.log(`YAPP Server is listening on port ${port}`)
})