import { createContext, useContext, useState, useEffect } from 'react';
import { UI_TEXT } from '../utils/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  // Default to Hindi ('hi') for rural accessibility, or respect saved preference
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('agriedge_lang') || 'hi';
  });

  useEffect(() => {
    localStorage.setItem('agriedge_lang', lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'hi' ? 'en' : 'hi'));
  };

  const t = (key) => {
    return UI_TEXT[lang]?.[key] || UI_TEXT['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
