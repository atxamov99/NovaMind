import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = "AIzaSyDOkH58Hh9cJ6LQZTOaCs8c0dXncgxHPLo";
const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
  try {
    // Note: The SDK might not expose listModels directly on genAI instance, 
    // we can fallback to fetch if needed. Let's check if the raw fetch works better
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    const data = await response.json();
    console.log("Available models:");
    data.models.forEach(model => {
      console.log(`- ${model.name} (${model.displayName})`);
    });
  } catch (err) {
    console.error("Error listing models:", err);
  }
}

listModels();
