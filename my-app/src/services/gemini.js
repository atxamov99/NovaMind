import { GoogleGenerativeAI } from '@google/generative-ai';

// API KEY from user request
const API_KEY = "AIzaSyDOkH58Hh9cJ6LQZTOaCs8c0dXncgxHPLo";

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(API_KEY);

// We use gemini-2.5-flash since the provided API key supports it
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const generateChatResponse = async (history, newMessage) => {
  try {
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
