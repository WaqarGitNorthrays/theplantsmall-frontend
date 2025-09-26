import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        welcome: "Welcome to my app",
        unit: "Unit",
        add_variant: "Add Variant"
      }
    },
    ur: {
      translation: {
        welcome: "خوش آمدید",
        unit: "یونٹ",
        add_variant: "ویریئنٹ شامل کریں"
      }
    }
  },
  lng: "en", // default language
  fallbackLng: "en",
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
