import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  setChatSessions, 
  setActiveChat, 
  clearMessages, 
  removeChatSession, 
  setLoading,
  setError 
} from '../store/chatSlice';
import { logout } from '../store/authSlice';
import { MessageSquarePlus, Trash2, Settings, MessageSquare, LogOut, Menu } from 'lucide-react';
import { getAllChats, getChatHistory, createNewChat, deleteChat } from '../services/api';
import SettingsModal from './SettingsModal';

const Sidebar = () => {
  const { t } = useTranslation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { chatSessions, activeChatId } = useSelector(state => state.chat);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const sessions = await getAllChats();
        dispatch(setChatSessions(sessions));
      } catch (err) {
        console.error("Failed to fetch sessions", err);
      }
    };
    fetchSessions();
  }, [dispatch]);

  const handleNewChat = async () => {
    try {
      const chat = await createNewChat();
      if (chat) {
        dispatch(setActiveChat(chat));
        const sessions = await getAllChats();
        dispatch(setChatSessions(sessions));
      }
    } catch (err) {
       console.error(err);
    }
  };

  const loadChat = async (id) => {
    if (activeChatId === id) return;
    dispatch(setLoading(true));
    try {
      const chatData = await getChatHistory(id);
      if (chatData) {
        dispatch(setActiveChat(chatData));
      }
    } catch (err) {
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleDeleteActiveChat = async () => {
    if (!activeChatId) return;
    if (window.confirm(t('deleteChat') + '?')) {
      const success = await deleteChat(activeChatId);
      if (success) {
        dispatch(removeChatSession(activeChatId));
      }
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearMessages());
    navigate('/login');
  };

  return (
    <div className="w-64 bg-dark-panel border-r border-dark-border flex flex-col h-full hidden md:flex">
      <div className="p-4 border-b border-dark-border">
        <button
          onClick={handleNewChat}
          className="flex items-center justify-center gap-2 w-full bg-primary-600 hover:bg-primary-500 text-white py-2 px-4 rounded-lg transition-colors font-medium shadow-md shadow-primary-500/20"
        >
          <MessageSquarePlus size={18} />
          <span>{t('newChat')}</span>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3">
        <div className="text-xs uppercase text-gray-400 font-semibold mb-3 px-2 mt-2">{t('chats')}</div>
        
        <div className="space-y-1">
          {chatSessions.length === 0 ? (
            <p className="px-2 text-sm text-gray-500 italic">{t('noChats')}</p>
          ) : (
             chatSessions.map((session) => (
              <button 
                key={session.id}
                onClick={() => loadChat(session.id)}
                className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg transition-colors group relative ${
                  activeChatId === session.id 
                    ? 'bg-primary-500/10 text-primary-400 font-medium' 
                    : 'text-gray-300 hover:bg-dark-border'
                }`}
              >
                <MessageSquare size={16} className={activeChatId === session.id ? 'text-primary-400' : 'text-gray-500 group-hover:text-gray-300'} />
                <span className="truncate text-sm pr-2">{session.title}</span>
              </button>
             ))
          )}
        </div>
      </div>

      <div className="p-4 border-t border-dark-border flex flex-col gap-2">
        <div className="px-3 py-2 mb-2 bg-dark-bg rounded-lg">
          <p className="text-xs text-gray-500">{t('general')}</p>
          <p className="text-sm font-medium text-gray-200 truncate">{user?.name || t('defaultUser')}</p>
        </div>

        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-gray-300 hover:bg-dark-border transition-colors text-sm"
        >
          <Settings size={18} />
          <span>{t('settings')}</span>
        </button>
        
        {activeChatId && (
          <button 
            onClick={handleDeleteActiveChat}
            className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-sm"
          >
            <Trash2 size={18} />
            <span>{t('deleteChat')}</span>
          </button>
        )}
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full text-left px-3 py-2 mt-2 border-t border-dark-border/50 pt-3 rounded-none text-gray-400 hover:text-gray-200 transition-colors text-sm"
        >
          <LogOut size={18} />
          <span>{t('logout')}</span>
        </button>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
};

export default Sidebar;
