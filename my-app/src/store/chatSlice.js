import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  chatSessions: [], // List of { id, title, updatedAt }
  activeChatId: null,
  messages: [], // Current active chat messages
  isLoading: false,
  error: null,
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChatSessions: (state, action) => {
      state.chatSessions = action.payload;
    },
    setActiveChat: (state, action) => {
      state.activeChatId = action.payload.id;
      state.messages = action.payload.messages || [];
      state.error = null;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    updateChatTitle: (state, action) => {
      const { id, title } = action.payload;
      const chat = state.chatSessions.find(c => c.id === id);
      if (chat) chat.title = title;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
      state.activeChatId = null;
      state.error = null;
    },
    removeChatSession: (state, action) => {
      state.chatSessions = state.chatSessions.filter(c => c.id !== action.payload);
      if (state.activeChatId === action.payload) {
        state.activeChatId = null;
        state.messages = [];
      }
    }
  },
});

export const { 
  addMessage, 
  setLoading, 
  setError, 
  clearMessages,
  setChatSessions,
  setActiveChat,
  updateChatTitle,
  removeChatSession
} = chatSlice.actions;

export default chatSlice.reducer;
