import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sparkles, Bot } from 'lucide-react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatInput from './components/ChatInput';
import MessageBubble from './components/MessageBubble';
import Login from './pages/Login';
import Register from './pages/Register';
import { motion, AnimatePresence } from 'framer-motion';
import { addMessage, setLoading, setError, setActiveChat, updateChatTitle, setChatSessions } from './store/chatSlice';
import { generateChatResponse, createNewChat, getAllChats } from './services/api';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
};

const ChatInterface = () => {
  const { t } = useTranslation();
  const { messages, isLoading, error, activeChatId } = useSelector(state => state.chat);
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSuggestionClick = async (suggestion) => {
    if (isLoading) return;
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
        const sessions = await getAllChats();
        dispatch(setChatSessions(sessions));
      }

      // Optimistically add user message
      dispatch(addMessage({ role: 'user', text: suggestion }));

      const data = await generateChatResponse(currentChatId, suggestion);
      dispatch(addMessage(data.modelMessage));
      if (data.title) {
        dispatch(updateChatTitle({ id: currentChatId, title: data.title }));
      }
    } catch (err) {
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const suggestions = [
    t('suggestion1'),
    t('suggestion2'),
    t('suggestion3'),
    t('suggestion4'),
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-bg overflow-hidden text-gray-900 dark:text-gray-100 transition-colors">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col h-full relative">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-y-auto w-full relative">
          <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col min-h-full">
            {messages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4 animate-in fade-in duration-700">
                <div className="w-20 h-20 bg-primary-100 dark:bg-dark-panel rounded-full flex items-center justify-center mb-6 shadow-sm border border-primary-200 dark:border-dark-border">
                  <Bot size={40} className="text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight mb-2 text-gray-900 dark:text-gray-100">
                  Salom, <span className="bg-clip-text text-transparent bg-linear-to-r from-primary-500 to-indigo-500">{user?.name || 'Foydalanuvchi'}</span>! 👋
                </h2>
                <p className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('appTagline')}
                </p>
                <p className="text-gray-500 dark:text-gray-400 max-w-md text-base">
                  {t('appDescription')}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 w-full max-w-2xl">
                  {suggestions.map((suggestion, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-left p-4 rounded-2xl bg-white dark:bg-dark-panel border border-gray-200 dark:border-dark-border hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-md transition-all group"
                    >
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400">{suggestion}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.length > 0 && (
              <div className="flex-1 pb-4">
                <AnimatePresence>
                  {messages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MessageBubble message={msg} />
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start mb-6"
                  >
                    <div className="flex gap-4 max-w-[85%] md:max-w-[75%]">
                      <div className="shrink-0 mt-1">
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                          <Sparkles size={16} className="animate-pulse" />
                        </div>
                      </div>
                      <div className="bg-white dark:bg-dark-panel border border-gray-100 dark:border-dark-border px-5 py-3.5 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2 h-12">
                        <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {error && (
                  <div className="mx-auto max-w-md p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm text-center my-4 flex flex-col items-center">
                  <p className="font-medium mb-1">{t('errorOccurred')}</p>
                    <p className="opacity-80">{error}</p>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            )}
          </div>
        </main>
        <div className="shrink-0 z-10 w-full">
          <ChatInput />
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/*" 
        element={
          <ProtectedRoute>
            <ChatInterface />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;

