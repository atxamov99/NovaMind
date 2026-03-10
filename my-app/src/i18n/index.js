import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import uz from './uz';
import en from './en';
import ru from './ru';

const savedLanguage = localStorage.getItem('language') || 'uz';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      uz: { translation: uz },
      en: { translation: en },
      ru: { translation: ru },
    },
    lng: savedLanguage,
    fallbackLng: 'uz',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
