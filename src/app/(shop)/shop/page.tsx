"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ShoppingCart,
  ClipboardList,
  Wallet,
  Package,
  ArrowRight,
  Store,
  IndianRupee,
  Clock,
} from "lucide-react";
import { Card, CardContent, Button, LanguageSwitch } from "@/components/ui";
import { Badge } from "@/components/ui";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils/cn";
import { OrderStatus } from "@/types";

interface DashboardStats {
  pendingBalance: number;
  lastOrderStatus?: OrderStatus;
  lastOrderDate?: string;
  totalOrders: number;
}

export default function ShopDashboard() {
  const t = useTranslations();
  const shop = useAuthStore((state) => state.shop);
  const [stats, setStats] = useState<DashboardStats>({
    pendingBalance: 0,
    totalOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = useAuthStore.getState().token;
        const response = await fetch("/api/shop/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStats(data.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const getStatusBadgeClass = (status?: OrderStatus) => {
    if (!status) return "bg-gray-100 text-gray-600";
    const colors: Record<OrderStatus, string> = {
      pending: "badge-pending",
      confirmed: "badge-confirmed",
      packed: "badge-packed",
      out_for_delivery: "badge-pending",
      delivered: "badge-delivered",
      cancelled: "badge-cancelled",
    };
    return colors[status];
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Header */}
      <header className="hero-gradient text-white pt-6 pb-12 px-4 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Store className="w-7 h-7" />
            </div>
            <div>
              <p className="text-white/80 text-sm">{t("dashboard.welcome")}</p>
              <h1 className="text-2xl font-bold">{shop?.shopName || "Shop"}</h1>
            </div>
          </div>
          <LanguageSwitch />
        </div>

        {/* Big Order Button */}
        <Link href="/shop/products">
          <div className="bg-white rounded-2xl p-5 shadow-xl flex items-center justify-between hover:shadow-2xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[var(--primary)] rounded-xl flex items-center justify-center shadow-md">
                <ShoppingCart className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-[var(--foreground)] text-lg font-bold">
                  {t("dashboard.placeNewOrder")}
                </p>
                <p className="text-[var(--muted-foreground)] text-sm">
                  {t("dashboard.browseAndOrder")}
                </p>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 text-[var(--primary)]" />
          </div>
        </Link>
      </header>

      <main className="px-4 -mt-6 pb-24 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Pending Balance Card */}
          <Card className="shadow-lg border-0 overflow-hidden animate-fadeIn">
            <div className="h-2 bg-gradient-to-r from-[var(--warning)] to-[var(--accent)]" />
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <IndianRupee className="w-5 h-5 text-[var(--warning)]" />
                <span className="text-sm font-medium text-[var(--muted-foreground)]">
                  {t("dashboard.pendingBalance")}
                </span>
              </div>
              {loading ? (
                <div className="h-8 w-24 bg-[var(--muted)] rounded animate-pulse" />
              ) : (
                <p className="text-3xl font-bold text-[var(--foreground)]">
                  ₹{stats.pendingBalance.toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Total Orders Card */}
          <Card className="shadow-lg border-0 overflow-hidden animate-fadeIn" style={{ animationDelay: "0.1s" }}>
            <div className="h-2 bg-gradient-to-r from-[var(--info)] to-[var(--primary)]" />
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-[var(--info)]" />
                <span className="text-sm font-medium text-[var(--muted-foreground)]">
                  {t("dashboard.totalOrders")}
                </span>
              </div>
              {loading ? (
                <div className="h-8 w-16 bg-[var(--muted)] rounded animate-pulse" />
              ) : (
                <p className="text-3xl font-bold text-[var(--foreground)]">
                  {stats.totalOrders}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Last Order Status */}
        {stats.lastOrderStatus && (
          <Card className="shadow-lg border-0 animate-fadeIn" style={{ animationDelay: "0.2s" }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--muted)] rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[var(--muted-foreground)]" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {t("dashboard.lastOrderStatus")}
                    </p>
                    <Badge className={cn("mt-1 px-3 py-1 text-sm font-semibold", getStatusBadgeClass(stats.lastOrderStatus))}>
                      {t(`orders.status.${stats.lastOrderStatus}`)}
                    </Badge>
                  </div>
                </div>
                <Link href="/shop/orders">
                  <Button variant="outline" size="sm">
                    {t("common.view")}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="space-y-3 mt-6">
          <h3 className="text-lg font-bold text-[var(--foreground)] px-1">
            {t("dashboard.quickActions")}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* My Orders */}
            <Link href="/shop/orders">
              <Card className="shadow-md hover:shadow-lg transition-all cursor-pointer animate-fadeIn border-0" style={{ animationDelay: "0.3s" }}>
                <CardContent className="p-5">
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--info)] to-blue-600 rounded-xl flex items-center justify-center mb-3 shadow-md">
                    <ClipboardList className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-bold text-[var(--foreground)]">{t("dashboard.myOrders")}</p>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    {t("dashboard.trackOrders")}
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* My Balance */}
            <Link href="/shop/balance">
              <Card className="shadow-md hover:shadow-lg transition-all cursor-pointer animate-fadeIn border-0" style={{ animationDelay: "0.4s" }}>
                <CardContent className="p-5">
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--success)] to-green-600 rounded-xl flex items-center justify-center mb-3 shadow-md">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-bold text-[var(--foreground)]">{t("dashboard.myBalance")}</p>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    {t("dashboard.paymentHistory")}
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Browse Products */}
            <Link href="/shop/products">
              <Card className="shadow-md hover:shadow-lg transition-all cursor-pointer animate-fadeIn border-0" style={{ animationDelay: "0.5s" }}>
                <CardContent className="p-5">
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] rounded-xl flex items-center justify-center mb-3 shadow-md">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-bold text-[var(--foreground)]">{t("products.title")}</p>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    {t("dashboard.allCategories")}
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Profile */}
            <Link href="/shop/profile">
              <Card className="shadow-md hover:shadow-lg transition-all cursor-pointer animate-fadeIn border-0" style={{ animationDelay: "0.6s" }}>
                <CardContent className="p-5">
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-light)] rounded-xl flex items-center justify-center mb-3 shadow-md">
                    <Store className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-bold text-[var(--foreground)]">{t("dashboard.profile")}</p>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    {t("dashboard.shopDetails")}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
