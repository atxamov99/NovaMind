import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './chatSlice';
import authReducer from './authSlice';
import settingsReducer from './settingsSlice';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    auth: authReducer,
    settings: settingsReducer,
  },
});

