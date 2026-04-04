import React, { useEffect, useMemo, useState } from "react";
import { LanguageContext } from "./languageContext";

const STORAGE_KEY = "nihon-no-ryori-language";
const SUPPORTED_LANGUAGES = ["ja", "ru"];

const getInitialLanguage = () => {
  if (typeof window === "undefined") {
    return "ja";
  }

  const savedLanguage = window.localStorage.getItem(STORAGE_KEY);

  if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
    return savedLanguage;
  }

  const browserLanguage = window.navigator.language?.slice(0, 2).toLowerCase();

  if (browserLanguage && SUPPORTED_LANGUAGES.includes(browserLanguage)) {
    return browserLanguage;
  }

  return "ja";
};

const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(getInitialLanguage);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language === "ja" ? "ja" : "ru";
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      isJapanese: language === "ja",
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export default LanguageProvider;
