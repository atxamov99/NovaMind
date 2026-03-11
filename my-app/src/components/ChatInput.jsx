import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Send, Loader2 } from 'lucide-react';
import { addMessage, setLoading, setError, setActiveChat, updateChatTitle, setChatSessions } from '../store/chatSlice';
import { generateChatResponse, createNewChat, getAllChats } from '../services/api';

const ChatInput = () => {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);
  const dispatch = useDispatch();
  const { isLoading, activeChatId } = useSelector(state => state.chat);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessageText = input.trim();
    setInput('');
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      let currentChatId = activeChatId;

      // Create new chat if none is active
      if (!currentChatId) {
        const newChat = await createNewChat();
        if (!newChat || !newChat.id) {
          throw new Error("Server bilan ulanishda xato. Iltimos, qayta urinib ko'ring.");
        }
        currentChatId = newChat.id;
        dispatch(setActiveChat(newChat));
        // Refresh sessions list
        const sessions = await getAllChats();
        dispatch(setChatSessions(sessions));
      }

      // Strict guard — never call API with invalid chatId
      if (!currentChatId || typeof currentChatId !== 'string') {
        throw new Error("Chat ID topilmadi.");
      }

      // Optimistically add user message to DOM
      dispatch(addMessage({ role: 'user', text: userMessageText }));

      // Call Backend API
      const data = await generateChatResponse(currentChatId, userMessageText);
      
      // Add model response to state
      dispatch(addMessage(data.modelMessage));
      if (data.title) {
         dispatch(updateChatTitle({ id: currentChatId, title: data.title }));
      }
    } catch (err) {
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-dark-bg border-t border-gray-200 dark:border-dark-border">
      <div className="max-w-3xl mx-auto relative">
        <form 
          onSubmit={handleSubmit}
          className="relative flex items-end gap-2 bg-gray-50 dark:bg-dark-panel border border-gray-200 dark:border-dark-border rounded-2xl p-2 shadow-sm focus-within:ring-2 ring-primary-500/50 focus-within:border-primary-500 transition-all"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('chatPlaceholder')}
            className="w-full max-h-[200px] min-h-[44px] bg-transparent resize-none outline-none py-3 px-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 text-base"
            rows="1"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`p-3 rounded-xl flex items-center justify-center transition-all ${
              input.trim() && !isLoading
                ? 'bg-primary-600 hover:bg-primary-500 text-white shadow-md'
                : 'bg-gray-200 dark:bg-dark-border text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} className={input.trim() ? "translate-x-0.5" : ""} />
            )}
          </button>
        </form>
        <div className="text-center mt-2 pb-1">
          <span className="text-xs text-gray-400 dark:text-gray-500">{t('appName')} {t('errorOccurred').toLowerCase()}... muhim ma'lumotlarni tekshiring.</span>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
