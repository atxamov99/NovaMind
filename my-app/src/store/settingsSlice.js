import { createSlice } from '@reduxjs/toolkit';

const savedTheme = localStorage.getItem('theme') || 'dark';
const savedLanguage = localStorage.getItem('language') || 'uz';
const savedNotifications = localStorage.getItem('notifications');
const defaultNotifications = { chat: true, updates: true, security: true };
const notifications = savedNotifications 
  ? JSON.parse(savedNotifications) 
  : defaultNotifications;

const initialState = {
  theme: savedTheme,   // 'light' | 'dark' | 'system'
  language: savedLanguage, // 'uz' | 'en' | 'ru'
  notifications,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
      localStorage.setItem('language', action.payload);
    },
    setNotification: (state, action) => {
      const { key, value } = action.payload;
      state.notifications[key] = value;
      localStorage.setItem('notifications', JSON.stringify(state.notifications));
    },
  },
});

export const { setTheme, setLanguage, setNotification } = settingsSlice.actions;
export default settingsSlice.reducer;
