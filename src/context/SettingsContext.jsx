import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import translations from '../i18n';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [theme, setTheme]     = useState(() => localStorage.getItem('sama_theme') || 'dark');
  const [language, setLanguage] = useState(() => localStorage.getItem('sama_lang') || 'ar');

  // Apply theme class and direction to <html>
  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'light') {
      html.classList.add('light');
    } else {
      html.classList.remove('light');
    }
    localStorage.setItem('sama_theme', theme);
  }, [theme]);

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('lang', language);
    html.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    document.body.style.direction = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('sama_lang', language);
  }, [language]);

  const toggleTheme   = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  const toggleLanguage = () => setLanguage((l) => (l === 'ar' ? 'en' : 'ar'));

  const t = useCallback(
    (key) => translations[language]?.[key] ?? translations['ar'][key] ?? key,
    [language]
  );

  return (
    <SettingsContext.Provider value={{ theme, language, toggleTheme, toggleLanguage, t }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
