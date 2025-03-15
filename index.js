const express = require('express');
const path = require('path');
const axios = require('axios');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const upload = multer({ dest: 'uploads/' });

// Servirea fișierelor statice
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Ruta pentru pagina principală
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta pentru trimiterea mesajelor WhatsApp
app.post('/send-message', upload.single('creds'), async (req, res) => {
    try {
        const { targets, message, delay } = req.body;

        // Citim token-ul din creds.json
        const credsPath = req.file.path;
        const credsData = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
        const token = credsData.token;
        const phone_number_id = credsData.phone_number_id;

        // Trimitem mesajele cu întârziere
        for (const target of targets.split(',')) {
            await new Promise(resolve => setTimeout(resolve, delay * 1000));
            await axios.post(`https://graph.facebook.com/v18.0/${phone_number_id}/messages`, {
                messaging_product: "whatsapp",
                to: target.trim(),
                type: "text",
                text: { body: message }
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        }

        res.json({ success: true, message: "Mesajele au fost trimise!" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Pornirea serverului
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
