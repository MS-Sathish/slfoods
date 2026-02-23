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
            <p className="text-sm opacity-90">{shop.shopName}</p>
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
