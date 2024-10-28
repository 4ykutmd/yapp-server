const express = require('express')
const app = express()
const port = 3000

require('dotenv').config()

const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.' + file.mimetype.split('/')[1])
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/jpg') {
            return cb(new Error('Only images are allowed!'))
        }
        cb(null, true)
    },
    limits: {
        fileSize: 1024 * 1024 * 10 // 10MB
    }
})
const upload = multer({ storage: storage });

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GENAI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.get('/api/soru-sor', upload.single('image') , async (req, res) => {
    const textinput = req.query.soru;

    console.log(req.file);
    //console.log(!textinput);
    res.status(200).json({ message: 'Soru alındı' });
})

app.listen(port, () => {
    console.log(`YAPP Server is listening on port ${port}`)
})