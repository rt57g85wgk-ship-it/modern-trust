import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/locales/en.json";
import th from "@/locales/th.json";

function initialLanguage(): "en" | "th" {
  // Always return "en" during SSR and initial hydration to prevent hydration mismatch.
  // The client-side AppProvider will switch to the user's preferred language after mounting.
  return "en";
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    th: { translation: th },
  },
  lng: initialLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

i18n.on("languageChanged", (lng) => {
  if (typeof document !== "undefined") {
    document.documentElement.lang = lng === "th" ? "th" : "en";
  }
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("mt_lang", lng === "th" ? "th" : "en");
  }
});

if (typeof document !== "undefined") {
  document.documentElement.lang = i18n.language === "th" ? "th" : "en";
}

export default i18n;
