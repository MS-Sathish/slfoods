"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Wallet, TrendingDown, TrendingUp, Calendar } from "lucide-react";
import ShopHeader from "@/components/shop/ShopHeader";
import { Card, CardContent } from "@/components/ui";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils/cn";

interface LedgerEntry {
  type: "order" | "payment";
  date: string;
  description: string;
  amount: number;
  reference: string;
}

interface BalanceData {
  pendingBalance: number;
  totalOrdersValue: number;
  totalPayments: number;
  lastPayment: {
    amount: number;
    date: string;
    mode: string;
  } | null;
  ledger: LedgerEntry[];
}

export default function BalancePage() {
  const t = useTranslations();
  const { token, shop } = useAuthStore();

  const [data, setData] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (shop?._id) {
      fetchBalance();
    }
  }, [shop?._id]);

  const fetchBalance = async () => {
    try {
      const response = await fetch(`/api/shop/balance?shopId=${shop?._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div>
        <ShopHeader title={t("balance.title")} />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <ShopHeader title={t("balance.title")} />

      <main className="p-4 space-y-4">
        {/* Pending Balance Card */}
        <Card className="bg-gradient-to-r from-[var(--secondary)] to-red-600 text-white">
          <CardContent className="py-6">
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="w-6 h-6" />
              <span className="text-sm opacity-90">
                {t("balance.totalPendingDue")}
              </span>
            </div>
            <p className="text-4xl font-bold">
              ₹{data?.pendingBalance.toLocaleString() || 0}
            </p>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-sm text-[var(--muted-foreground)]">
                  {t("balance.totalOrdersValue")}
                </span>
              </div>
              <p className="text-xl font-bold text-green-600">
                ₹{data?.totalOrdersValue.toLocaleString() || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-[var(--muted-foreground)]">
                  {t("balance.totalPaid")}
                </span>
              </div>
              <p className="text-xl font-bold text-blue-600">
                ₹{data?.totalPayments.toLocaleString() || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Last Payment */}
        {data?.lastPayment && (
          <Card className="bg-green-50 border border-green-200">
            <CardContent className="py-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-700">
                  {t("balance.lastPaymentUpdated")}
                </span>
              </div>
              <p className="text-xl font-bold text-green-700">
                ₹{data.lastPayment.amount.toLocaleString()}
              </p>
              <p className="text-sm text-green-600 mt-1">
                {formatDate(data.lastPayment.date)} ({data.lastPayment.mode.toUpperCase()})
              </p>
            </CardContent>
          </Card>
        )}

        {/* Ledger */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">{t("balance.ledger")}</h3>

            {data?.ledger && data.ledger.length > 0 ? (
              <div className="space-y-3">
                {data.ledger.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          entry.type === "order"
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-600"
                        )}
                      >
                        {entry.type === "order" ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {entry.description}
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {formatDate(entry.date)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "font-semibold",
                        entry.type === "order"
                          ? "text-red-600"
                          : "text-green-600"
                      )}
                    >
                      {entry.type === "order" ? "+" : "-"}₹
                      {Math.abs(entry.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-[var(--muted-foreground)] py-8">
                {t("balance.noTransactions")}
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
