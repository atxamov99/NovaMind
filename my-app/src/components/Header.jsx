import React from 'react';
import { Menu, User, Sparkles } from 'lucide-react';

const Header = ({ onMenuClick }) => {
  return (
    <header className="h-16 border-b border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg flex items-center justify-between px-4 sticky top-0 z-10 transition-colors">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="bg-linear-to-br from-primary-500 to-indigo-600 p-1.5 rounded-lg text-white">
            <Sparkles size={18} />
          </div>
          <h1 className="font-semibold text-lg tracking-tight bg-clip-text text-transparent bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
            NovaMind
          </h1>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <button className="w-8 h-8 rounded-full bg-primary-100 dark:bg-dark-border flex items-center justify-center text-primary-600 dark:text-primary-400 hover:ring-2 ring-primary-500/50 transition-all">
          <User size={16} />
        </button>
      </div>
    </header>
  );
};

export default Header;
