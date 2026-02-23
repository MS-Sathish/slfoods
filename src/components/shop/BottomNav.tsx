"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingCart, ClipboardList, Wallet, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";
import { useCartStore } from "@/store/cart";

export default function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const itemCount = useCartStore((state) => state.items.length);

  const navItems = [
    { href: "/shop", icon: Home, label: t("home") },
    { href: "/shop/products", icon: ShoppingCart, label: t("order"), badge: itemCount },
    { href: "/shop/orders", icon: ClipboardList, label: t("orders") },
    { href: "/shop/balance", icon: Wallet, label: t("balance") },
    { href: "/shop/profile", icon: User, label: t("profile") },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--border)] safe-bottom z-50 shadow-lg">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/shop" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full relative",
                "transition-colors",
                isActive
                  ? "text-[var(--primary)]"
                  : "text-[var(--muted-foreground)]"
              )}
            >
              <div className="relative">
                <item.icon className="w-5 h-5" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[var(--primary)] text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
