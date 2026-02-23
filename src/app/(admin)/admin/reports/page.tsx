"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { TrendingUp, ShoppingCart, CreditCard, Wallet, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui";
import { useAuthStore } from "@/store/auth";

interface MonthlyStats {
  month: string;
  sales: number;
  orders: number;
  payments: number;
}

export default function AdminReportsPage() {
  const t = useTranslations("admin");
  const token = useAuthStore((state) => state.token);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalPayments: 0,
    pendingBalance: 0,
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyStats[]>([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch("/api/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setStats({
          totalSales: data.data.totalSalesThisMonth,
          totalOrders: data.data.totalOrdersThisMonth,
          totalPayments: data.data.totalPaymentsThisMonth,
          pendingBalance: data.data.pendingBalance,
        });
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentMonth = new Date().toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

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
        <h1 className="text-2xl font-bold">{t("reports")}</h1>
        <div className="flex items-center gap-2 text-gray-500">
          <Calendar className="w-5 h-5" />
          {currentMonth}
        </div>
      </div>

      {/* Monthly Summary */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-6">{t("monthlySummary")}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-green-600 mb-1">{t("totalSales")}</p>
              <p className="text-2xl font-bold text-green-700">
                ₹{stats.totalSales.toLocaleString()}
              </p>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-blue-600 mb-1">{t("totalOrders")}</p>
              <p className="text-2xl font-bold text-blue-700">
                {stats.totalOrders}
              </p>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-purple-600 mb-1">{t("paymentsReceived")}</p>
              <p className="text-2xl font-bold text-purple-700">
                ₹{stats.totalPayments.toLocaleString()}
              </p>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-xl">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-red-600 mb-1">{t("pendingBalance")}</p>
              <p className="text-2xl font-bold text-red-700">
                ₹{stats.pendingBalance.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">{t("collectionRate")}</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-[var(--primary)]">
                  {stats.totalSales > 0
                    ? Math.round((stats.totalPayments / stats.totalSales) * 100)
                    : 0}
                  %
                </p>
                <p className="text-sm text-gray-500">{t("ofSalesCollected")}</p>
              </div>
              <div className="w-24 h-24 relative">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="8"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="8"
                    strokeDasharray={`${
                      stats.totalSales > 0
                        ? (stats.totalPayments / stats.totalSales) * 251.2
                        : 0
                    } 251.2`}
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">{t("averageOrderValue")}</h3>
            <div>
              <p className="text-3xl font-bold text-[var(--primary)]">
                ₹
                {stats.totalOrders > 0
                  ? Math.round(stats.totalSales / stats.totalOrders).toLocaleString()
                  : 0}
              </p>
              <p className="text-sm text-gray-500">{t("perOrderThisMonth")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Note */}
      <Card className="bg-gray-50">
        <CardContent className="p-4 text-center text-gray-500">
          <p>
            {t("detailedReportsNote")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
