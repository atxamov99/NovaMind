import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize the Gemini API client
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// We use gemini-2.5-flash since the provided API key supports it
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-2.5-flash" }) : null;

export const generateChatResponse = async (history, newMessage) => {
  try {
    if (!model) throw new Error("Missing VITE_GEMINI_API_KEY");
    // Format history for Gemini API
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    // Start a chat session with history
    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    });

    // Send the message and await the response
    const result = await chat.sendMessage(newMessage);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating response from Gemini API:", error);
    throw new Error("Failed to get response from AI. Please try again.");
  }
};
