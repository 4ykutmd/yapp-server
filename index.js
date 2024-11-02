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

const { GoogleAIFileManager } = require("@google/generative-ai/server");
const fileManager = new GoogleAIFileManager(process.env.GENAI_API_KEY);

app.get('/api/soru-sor', upload.single('image') , async (req, res) => {
    const manualPrompt = req.query.soru;
    const type = req.query.type || '1';
    const number = req.query.number || '15';

    // 1: soru cozdur
    // 2: sorudaki konuyu anlatmasini iste(foto secerse caliscak)
    // 3: belirtilen konuyu anlatmasini iste
    // 4: test hazirlamasini iste cevap JSON seklinde gelir.

    const prompt = type === '1' ? 'Görseldeki soruyu çözer misin?' : 
                    type === '2' ? "Sorudaki konuyu anlatır mısın?" :
                    type === '3' ? "Belirttiğim konuyu anlatır mısın?" :
                    type === '4' ? `Bana belirttigim konu hakkında 5er şıktan oluşan ${number} soru hazırlar mısın? Soru numaralarını belirtme, başta bir açıklama yapma. Format: {soru:string,secenekler:string[],cevap:string},`
                    type ==="5" ? "Bana belirttiğim konu hakkında 7 günlük bir ders planı hazırlar msısın? Başta bir açıklama yapma. Format: {gün:string, konu:string}" : 'Naber'
                    ;

    if (!manualPrompt) {
        const uploadResponse = await fileManager.uploadFile(req.file.path, {
            mimeType: req.file.mimetype,
            displayName: req.file.filename,
        });
        console.log(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`);

        //const getResponse = await fileManager.getFile(uploadResponse.file.name);

        //console.log(`Retrieved file ${getResponse.displayName} as ${getResponse.uri}`);

        const result = await model.generateContent([
            {
                fileData: {
                    mimeType: uploadResponse.file.mimeType,
                    fileUri: uploadResponse.file.uri
                }
            },
            {
                text: prompt
            }
        ]);

        const final_result = result.response.text();

        res.status(200).json({ cevap: final_result });
    } else {

        const result = await model.generateContent([
            {
                text: manualPrompt + prompt
            },
        ])
    
        const final_result = result.response.text()
        //.replaceAll(/\n|\r/g,'')
        .replaceAll('**', '')
        .replaceAll('```json', '')
        .replaceAll('```', '')
        console.log(final_result)

        res.status(200).json({ cevap: final_result });
    }

    //console.log(req.file);
    //console.log(!textinput);
    
})

app.get('/gecici', async (req, res) => {
    const prompt = req.query.soru;
    const result = await model.generateContent([
        {
            text: prompt
        },
    ])
    const final_result = result.response.text()
    res.status(200).json({ cevap: final_result });
});

app.listen(port, () => {
    console.log(`YAPP Server is listening on port ${port}`)
})