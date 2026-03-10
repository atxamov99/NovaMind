// Base URL for our new Express backend
const API_BASE_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

/* --- AUTH --- */
export const registerUser = async (name, email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to register');
  }
  return await response.json();
};

export const loginUser = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to login');
  }
  return await response.json();
};

/* --- CHATS --- */
export const getAllChats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/chats`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch chats');
    return await response.json();
  } catch (error) {
    console.error("Error fetching chats:", error);
    return [];
  }
};

export const getChatHistory = async (chatId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch history');
    return await response.json();
  } catch (error) {
    console.error("Error fetching chat history from backend:", error);
    return null;
  }
};

export const createNewChat = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/chats`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to create new chat');
    return await response.json();
  } catch (error) {
    console.error("Error creating chat:", error);
    return null;
  }
};

export const deleteChat = async (chatId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete chat');
    return true;
  } catch (error) {
    console.error("Error deleting chat:", error);
    return false;
  }
};

export const generateChatResponse = async (chatId, newMessage) => {
  if (!chatId) throw new Error("No active chat session.");
  try {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message: newMessage }),
    });

    if (!response.ok) {
        throw new Error("Failed to get response from AI server.");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error generating response from backend:", error);
    throw new Error("Failed to get response from AI. Please try again.");
  }
};
