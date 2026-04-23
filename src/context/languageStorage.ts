import type { Language } from "../types";

export const LANGUAGE_STORAGE_KEY = "nihon-no-ryori-language";
const SUPPORTED_LANGUAGES: Language[] = ["ja", "ru"];

export const getInitialLanguage = (): Language => {
  if (typeof window === "undefined") {
    return "ja";
  }

  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

  if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage as Language)) {
    return savedLanguage as Language;
  }

  const browserLanguage = window.navigator.language?.slice(0, 2).toLowerCase() as
    | Language
    | undefined;

  if (browserLanguage && SUPPORTED_LANGUAGES.includes(browserLanguage)) {
    return browserLanguage;
  }

  return "ja";
};
