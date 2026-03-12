const express = require('express');
require('dotenv').config();  // .env faylni o‘qish

const cors = require('cors');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'super_secret_jwt_key_123';

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
}));
app.use(express.json());

// Serve built frontend (Render / single-service deploy)
const frontendDistPath = path.join(__dirname, '..', 'my-app', 'dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
}

// Load API Key (support common env var names)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.API_KEY;
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const gemini =
  GEMINI_API_KEY
    ? new GoogleGenerativeAI(GEMINI_API_KEY).getGenerativeModel({
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      })
    : null;

// Database paths - process.env.VERCEL is set automatically by Vercel
const isVercel = process.env.VERCEL === '1';
const usersDBPath = isVercel ? path.join('/tmp', 'users.json') : path.join(__dirname, 'users.json');
const chatsDBPath = isVercel ? path.join('/tmp', 'chats.json') : path.join(__dirname, 'chats.json');

// File I/O Helpers
const readJSON = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};
const writeJSON = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Failed to write to DB:", err);
  }
};

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token.' });
    req.user = user;
    next();
  });
};

/* ================== AUTH ROUTES ================== */

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' });

  const users = readJSON(usersDBPath);
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    passwordHash
  };
  
  users.push(newUser);
  writeJSON(usersDBPath, users);

  const token = jwt.sign({ id: newUser.id, name: newUser.name, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email } });
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const users = readJSON(usersDBPath);
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

/* ================== CHAT ROUTES ================== */

// GET /api/chats (Get all user's chats)
app.get('/api/chats', authenticateToken, (req, res) => {
  const allChats = readJSON(chatsDBPath);
  const userChats = allChats.filter(c => c.userId === req.user.id).sort((a, b) => b.updatedAt - a.updatedAt);
  // Return just metadata, not full messages list to save bandwidth on sidebar load
  const chatMeta = userChats.map(c => ({ id: c.id, title: c.title, updatedAt: c.updatedAt }));
  res.json(chatMeta);
});

// GET /api/chats/:id (Get specific chat full info)
app.get('/api/chats/:id', authenticateToken, (req, res) => {
  const allChats = readJSON(chatsDBPath);
  const chat = allChats.find(c => c.id === req.params.id && c.userId === req.user.id);
  if (!chat) return res.status(404).json({ error: 'Chat not found' });
  res.json(chat);
});

// POST /api/chats (Create new empty chat)
app.post('/api/chats', authenticateToken, (req, res) => {
  const allChats = readJSON(chatsDBPath);
  const newChat = {
    id: Date.now().toString(),
    userId: req.user.id,
    title: 'New Chat',
    messages: [],
    updatedAt: Date.now()
  };
  allChats.push(newChat);
  writeJSON(chatsDBPath, allChats);
  res.json(newChat);
});

// DELETE /api/chats/:id (Delete chat)
app.delete('/api/chats/:id', authenticateToken, (req, res) => {
  let allChats = readJSON(chatsDBPath);
  const chatIndex = allChats.findIndex(c => c.id === req.params.id && c.userId === req.user.id);
  if (chatIndex === -1) return res.status(404).json({ error: 'Chat not found' });
  
  allChats.splice(chatIndex, 1);
  writeJSON(chatsDBPath, allChats);
  res.json({ message: 'Chat deleted correctly' });
});

// POST /api/chats/:id/messages (Send message to chat)
app.post('/api/chats/:id/messages', authenticateToken, async (req, res) => {
  try {
    if (!openai && !gemini) {
      return res.status(500).json({
        error: 'AI provider is not configured. Set OPENAI_API_KEY (or API_KEY) or GEMINI_API_KEY on the server.',
      });
    }

    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const allChats = readJSON(chatsDBPath);
    const chatIndex = allChats.findIndex(c => c.id === req.params.id && c.userId === req.user.id);
    if (chatIndex === -1) return res.status(404).json({ error: 'Chat not found' });

    const chat = allChats[chatIndex];
    chat.updatedAt = Date.now();
    
    // Auto-generate title based on first message if it's still 'New Chat'
    if (chat.messages.length === 0 && chat.title === 'New Chat') {
      chat.title = message.length > 30 ? message.substring(0, 30) + '...' : message;
    }

    // Add user message to DB
    const userMsg = { role: 'user', text: message };
    chat.messages.push(userMsg);

    // Save DB immediately for user message
    writeJSON(chatsDBPath, allChats);

    // Format history for OpenAI API
    const formattedMessages = chat.messages.map(msg => ({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.text,
    }));

    let responseText;
    const preferredProvider = (process.env.AI_PROVIDER || '').toLowerCase(); // 'openai' | 'gemini'

    const tryOpenAI = async () => {
      if (!openai) return null;
      const completion = await openai.chat.completions.create({
        model: process.env.MODEL || 'gpt-4o-mini',
        messages: formattedMessages,
        max_tokens: 2048,
        temperature: 0.7,
      });
      return completion.choices[0].message.content;
    };

    const tryGemini = async () => {
      if (!gemini) return null;
      const history = chat.messages.slice(0, -1).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));
      const geminiChat = gemini.startChat({
        history,
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.7,
        },
      });
      const result = await geminiChat.sendMessage(message);
      const response = await result.response;
      return response.text();
    };

    try {
      if (preferredProvider === 'gemini') {
        responseText = await tryGemini();
        if (!responseText) responseText = await tryOpenAI();
      } else {
        responseText = await tryOpenAI();
        if (!responseText) responseText = await tryGemini();
      }
    } catch (err) {
      // If OpenAI key is invalid, fall back to Gemini if available
      const openaiCode = err?.code || err?.error?.code;
      if ((openaiCode === 'invalid_api_key' || err?.status === 401) && gemini) {
        responseText = await tryGemini();
      } else {
        throw err;
      }
    }

    if (!responseText) {
      return res.status(500).json({
        error: 'Failed to generate AI response. Check OPENAI_API_KEY/API_KEY or GEMINI_API_KEY.',
      });
    }

    // Add AI response to DB
    const modelMsg = { role: 'model', text: responseText };
    chat.messages.push(modelMsg);
    
    writeJSON(chatsDBPath, allChats);

    res.json({ userMessage: userMsg, modelMessage: modelMsg, title: chat.title });

  } catch (error) {
    console.error("Error generating response:", error);
    const code = error?.code || error?.error?.code;
    const status = error?.status;
    if (code === 'invalid_api_key' || status === 401) {
      return res.status(500).json({
        error: 'Incorrect OpenAI API key. Set a valid OPENAI_API_KEY/API_KEY or configure GEMINI_API_KEY as a fallback.',
      });
    }
    if (status === 403) {
      return res.status(500).json({
        error: 'AI provider rejected the request (403). If using Gemini, your API key may be blocked/leaked—generate a new key and set GEMINI_API_KEY. If using OpenAI, check project/org permissions and key status.',
      });
    }
    res.status(500).json({ error: 'Failed to get response from AI.' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

// SPA fallback (must be after /api routes)
if (fs.existsSync(frontendDistPath)) {
  // Express 5: use a RegExp instead of '*' wildcard
  app.get(/^(?!\/api\/).*/, (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Export app for Vercel serverless deployment
module.exports = app;
