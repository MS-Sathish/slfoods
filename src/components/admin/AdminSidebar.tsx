"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  ShoppingCart,
  Store,
  Package,
  CreditCard,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/store/auth";
import { useState } from "react";
import { LanguageSwitch } from "@/components/ui";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const { admin, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { href: "/admin", icon: LayoutDashboard, label: t("dashboard") },
    { href: "/admin/orders", icon: ShoppingCart, label: t("orders") },
    { href: "/admin/shops", icon: Store, label: t("shops") },
    { href: "/admin/products", icon: Package, label: t("products") },
    { href: "/admin/payments", icon: CreditCard, label: t("payments") },
    { href: "/admin/reports", icon: BarChart3, label: t("reports") },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[var(--primary)]">
              {tCommon("appName")}
            </h1>
            <p className="text-xs text-gray-400">{t("panel")}</p>
          </div>
          <LanguageSwitch />
        </div>
        {admin && (
          <p className="text-sm text-gray-500 mt-2">{admin.name}</p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-[var(--primary)] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">{t("logout")}</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {mobileOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
