"use client";

import { useTranslations } from "next-intl";
import { LanguageSwitch } from "@/components/ui";
import { useAuthStore } from "@/store/auth";

interface ShopHeaderProps {
  title?: string;
  showLanguageSwitch?: boolean;
}

export default function ShopHeader({
  title,
  showLanguageSwitch = true,
}: ShopHeaderProps) {
  const t = useTranslations("common");
  const shop = useAuthStore((state) => state.shop);

  return (
    <header className="sticky top-0 hero-gradient text-white z-40 shadow-md">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <h1 className="text-lg font-bold">
            {title || t("appName")}
          </h1>
          {shop && (
            <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-0.5 mt-1 cursor-pointer hover:bg-white/30 transition-colors">
              <svg className="w-4 h-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-sm opacity-90">{shop.shopName}</p>
              <svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}
        </div>
        {showLanguageSwitch && (
          <div className="flex items-center gap-2">
            <LanguageSwitch />
          </div>
        )}
      </div>
    </header>
  );
}
