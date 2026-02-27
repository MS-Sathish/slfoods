"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Wallet, TrendingDown, TrendingUp, Calendar, ArrowLeft, IndianRupee, CreditCard } from "lucide-react";
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
  const router = useRouter();
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
      <div className="min-h-screen bg-[var(--background)]">
        {/* Hero Header */}
        <header className="hero-gradient text-white pt-6 pb-16 px-4 rounded-b-3xl shadow-lg">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold">{t("balance.title")}</h1>
              <p className="text-white/80 text-sm">{t("balance.paymentHistory")}</p>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Header with Balance */}
      <header className="hero-gradient text-white pt-6 pb-20 px-4 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold">{t("balance.title")}</h1>
            <p className="text-white/80 text-sm">{t("balance.paymentHistory")}</p>
          </div>
        </div>

        {/* Pending Balance Display */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <IndianRupee className="w-6 h-6" />
            </div>
            <span className="text-white/90">{t("balance.totalPendingDue")}</span>
          </div>
          <p className="text-5xl font-bold ml-15">
            ₹{data?.pendingBalance.toLocaleString() || 0}
          </p>
        </div>
      </header>

      <main className="px-4 -mt-8 pb-24 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="shadow-lg border-0 overflow-hidden animate-fadeIn">
            <div className="h-1.5 bg-gradient-to-r from-red-400 to-red-600" />
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-red-500" />
                <span className="text-xs text-[var(--muted-foreground)]">
                  {t("balance.totalOrdersValue")}
                </span>
              </div>
              <p className="text-2xl font-bold text-red-600">
                ₹{data?.totalOrdersValue.toLocaleString() || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 overflow-hidden animate-fadeIn" style={{ animationDelay: "0.1s" }}>
            <div className="h-1.5 bg-gradient-to-r from-green-400 to-green-600" />
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-green-500" />
                <span className="text-xs text-[var(--muted-foreground)]">
                  {t("balance.totalPaid")}
                </span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                ₹{data?.totalPayments.toLocaleString() || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Last Payment */}
        {data?.lastPayment && (
          <Card className="shadow-lg border-0 bg-gradient-to-r from-green-50 to-emerald-50 animate-fadeIn" style={{ animationDelay: "0.2s" }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-green-700 font-medium">{t("balance.lastPaymentUpdated")}</p>
                    <p className="text-2xl font-bold text-green-700">
                      ₹{data.lastPayment.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-green-600">{formatDate(data.lastPayment.date)}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-green-200 text-green-800 text-xs rounded-full font-medium">
                    {data.lastPayment.mode.toUpperCase()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ledger */}
        <Card className="shadow-lg border-0 animate-fadeIn" style={{ animationDelay: "0.3s" }}>
          <CardContent className="p-4">
            <h3 className="font-bold text-lg mb-4">{t("balance.ledger")}</h3>

            {data?.ledger && data.ledger.length > 0 ? (
              <div className="space-y-3">
                {data.ledger.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          entry.type === "order"
                            ? "bg-red-100"
                            : "bg-green-100"
                        )}
                      >
                        {entry.type === "order" ? (
                          <TrendingUp className="w-5 h-5 text-red-600" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--foreground)]">
                          {entry.description}
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {formatDate(entry.date)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "font-bold text-lg",
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
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-[var(--muted)] rounded-full flex items-center justify-center mb-4">
                  <Wallet className="w-8 h-8 text-[var(--muted-foreground)]" />
                </div>
                <p className="text-[var(--muted-foreground)]">{t("balance.noTransactions")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
