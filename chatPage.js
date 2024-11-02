const express = require('express');
const router = express.Router();
const multer = require('multer');

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GENAI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const fileManager = new GoogleAIFileManager(process.env.GENAI_API_KEY);

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

router.post('/', upload.single('file'), async (req, res) => {
    const body = req.body;
    const manualPrompt = body.prompt;
    const hazirPrompt = body.promptType || '1';
    let history = body.history || [];
    if (history.length > 0) {
        try {
            history = JSON.parse(history);
        } catch (error) {
            console.log(error);
        }
    }
    const file = req.file;

    if (hazirPrompt === '1' && !manualPrompt) 
        res.status(400).json({ error: 'Prompt type 1 requires a manual prompt' });

    //console.log(history)
    const chat = model.startChat({
        history: history,
    })

    if (file) {
        const uploadResponse = await fileManager.uploadFile(req.file.path, {
            mimeType: req.file.mimetype,
            displayName: req.file.filename,
        });
        let result = await chat.sendMessage([{
            text: manualPrompt
            }, {
                fileData: {
                    mimeType: file.mimetype,
                    fileUri: uploadResponse.file.uri,
                }
            }
        ])

        let final_result = result.response.text();
        res.status(200)
        .json({ cevap: final_result, file: {mimeType: file.mimetype, fileUri: uploadResponse.file.uri}, have_file: true });
        return;
    }

    let result = await chat.sendMessage(manualPrompt);
    let final_result = result.response.text();
    
    res.status(200).json({ cevap: final_result });
});

module.exports = router;