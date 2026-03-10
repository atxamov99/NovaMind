import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider, useSelector } from 'react-redux'
import { store } from './store/store.js'
import './index.css'
import './i18n/index.js'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'

// Applies dark/light class to <html> based on Redux settings + system preference
const ThemeProvider = ({ children }) => {
  const theme = useSelector(state => state.settings.theme);

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (isDark) => {
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    if (theme === 'dark') {
      applyTheme(true);
    } else if (theme === 'light') {
      applyTheme(false);
    } else {
      // system
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches);
      const handler = (e) => applyTheme(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);

  return children;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)
