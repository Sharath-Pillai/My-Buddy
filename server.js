require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allows your frontend to communicate with this backend
app.use(express.json({ limit: '50mb' })); // Increased limit to allow uploading image data

const API_KEY = process.env.GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

// Create an endpoint that the frontend can POST to
app.post('/api/chat', async (req, res) => {
    try {
        const { contents } = req.body;
        
        // The backend securely makes the request to Google
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        
        // Send Google's response back to the frontend
        res.json(data);
    } catch (error) {
        console.error("Error connecting to Gemini API:", error);
        res.status(500).json({ error: { message: "Internal server error connecting to AI" } });
    }
});

app.listen(PORT, () => {
    console.log(`Server is secretly running on http://localhost:${PORT} 🚀`);
});
