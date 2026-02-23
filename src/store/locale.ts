import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Locale, defaultLocale } from "@/i18n/config";

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: defaultLocale,

      setLocale: (locale: Locale) => {
        // Set cookie for server-side rendering
        document.cookie = `locale=${locale};path=/;max-age=31536000`;
        set({ locale });
        // Reload to apply new locale
        window.location.reload();
      },
    }),
    {
      name: "lakshmi-locale",
    }
  )
);
