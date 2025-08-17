import "dotenv/config";
import express from "express";
// import multer from "multer";
import fs from "fs/promises";
import { GoogleGenAI } from "@google/genai";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// const upload = multer();
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// **Set your default Gemini model here: **
const GEMINI_MODEL = "gemini-2.5-flash";

//tambahan middleware untuk serve file static content
app.use(express.static(path.join(__dirname, "public")));

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));

function extractText(resp) {
  try {
    const text =
      resp?.response?.candidates?.[0]?.content?.parts?.[0]?.text ??
      resp?.candidates?.[0]?.content?.parts?.[0]?.text ??
      resp?.response?.candidates?.[0]?.content?.text;
    return text ?? JSON.stringify(resp, null, 2);
  } catch (error) {
    console.error("Error extracting text:", error);
    return JSON.stringify(resp, null, 2);
  }
}

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages)) throw new Error("Messages must be an array");
    const contents = messages.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    const resp = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
    });

    res.json({ result: extractText(resp) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});