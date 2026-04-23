import { useEffect, useMemo, useState } from "react";
import { LanguageContext } from "./languageContext";
import { getInitialLanguage, LANGUAGE_STORAGE_KEY } from "./languageStorage";
import type { Language, ProviderProps } from "../types";

const LanguageProvider = ({ children }: ProviderProps) => {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
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
