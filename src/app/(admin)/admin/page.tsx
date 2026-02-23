"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  TrendingUp,
  ShoppingCart,
  CreditCard,
  Wallet,
  Users,
  Clock,
  Package,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, Badge } from "@/components/ui";
import { useAuthStore } from "@/store/auth";
import { OrderStatus } from "@/types";

interface DashboardStats {
  totalSalesThisMonth: number;
  totalOrdersThisMonth: number;
  totalPaymentsThisMonth: number;
  pendingBalance: number;
  pendingOrders: number;
  activeShops: number;
  todayOrders: number;
  pendingShops: number;
  recentOrders: Array<{
    _id: string;
    orderNumber: string;
    totalAmount: number;
    status: OrderStatus;
    shop: { shopName: string };
    createdAt: string;
  }>;
}

export default function AdminDashboard() {
  const t = useTranslations("admin");
  const tOrders = useTranslations("orders");
  const token = useAuthStore((state) => state.token);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors: Record<OrderStatus, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      packed: "bg-purple-100 text-purple-800",
      out_for_delivery: "bg-orange-100 text-orange-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("dashboard")}</h1>
        <p className="text-gray-500">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Alert for pending shops */}
      {stats?.pendingShops ? (
        <Card className="bg-yellow-50 border border-yellow-200">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
            <p className="text-yellow-800">
              <strong>{stats.pendingShops}</strong> {t("pendingShopsAlert")}
            </p>
            <Link
              href="/admin/shops?status=pending"
              className="ml-auto text-yellow-700 font-medium hover:underline"
            >
              {t("reviewNow")}
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-green-50 border border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-600">{t("salesThisMonth")}</p>
                <p className="text-2xl font-bold text-green-700">
                  ₹{stats?.totalSalesThisMonth.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-600">{t("ordersThisMonth")}</p>
                <p className="text-2xl font-bold text-blue-700">
                  {stats?.totalOrdersThisMonth || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-600">{t("paymentsThisMonth")}</p>
                <p className="text-2xl font-bold text-purple-700">
                  ₹{stats?.totalPaymentsThisMonth.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-red-600">{t("pendingBalance")}</p>
                <p className="text-2xl font-bold text-red-700">
                  ₹{stats?.pendingBalance.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-[var(--primary)] rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t("todayOrders")}</p>
              <p className="text-xl font-bold">{stats?.todayOrders || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t("pendingOrders")}</p>
              <p className="text-xl font-bold">{stats?.pendingOrders || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t("activeShops")}</p>
              <p className="text-xl font-bold">{stats?.activeShops || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t("recentOrders")}</h2>
            <Link
              href="/admin/orders"
              className="text-[var(--primary)] font-medium hover:underline"
            >
              {t("viewAll")}
            </Link>
          </div>

          {stats?.recentOrders && stats.recentOrders.length > 0 ? (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <Link
                  key={order._id}
                  href={`/admin/orders/${order._id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium">#{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">
                      {order.shop?.shopName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ₹{order.totalAmount.toLocaleString()}
                    </p>
                    <Badge className={getStatusColor(order.status)}>
                      {tOrders(`status.${order.status}`)}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">{t("noOrders")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
