"use client";

import { useLocaleStore } from "@/store/locale";
import { Locale, localeNames } from "@/i18n/config";
import { Globe } from "lucide-react";

export default function LanguageSwitch() {
  const { locale, setLocale } = useLocaleStore();

  const toggleLocale = () => {
    const newLocale: Locale = locale === "en" ? "ta" : "en";
    setLocale(newLocale);
  };

  return (
    <button
      onClick={toggleLocale}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
      title="Switch Language"
    >
      <Globe className="w-4 h-4 text-[var(--primary)]" />
      <span className="text-sm font-medium text-gray-900">{localeNames[locale]}</span>
    </button>
  );
}
