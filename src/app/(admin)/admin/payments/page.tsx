"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Plus, CreditCard, Banknote, Building } from "lucide-react";
import { Card, CardContent, Input, Badge, Button } from "@/components/ui";
import { useAuthStore } from "@/store/auth";
import { PaymentMode } from "@/types";

interface Shop {
  _id: string;
  shopName: string;
  ownerName: string;
  mobile: string;
}

interface Payment {
  _id: string;
  shop: Shop;
  amount: number;
  mode: PaymentMode;
  reference?: string;
  notes?: string;
  receivedBy: { name: string };
  createdAt: string;
}

export default function AdminPaymentsPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const token = useAuthStore((state) => state.token);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [selectedShop, setSelectedShop] = useState("");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<PaymentMode>("cash");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPayments();
    fetchShops();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/admin/payments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setPayments(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShops = async () => {
    try {
      const response = await fetch("/api/admin/shops?status=approved", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setShops(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch shops:", error);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedShop || !amount || !mode) {
      setError("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/admin/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shopId: selectedShop,
          amount: parseFloat(amount),
          mode,
          reference: reference || undefined,
          notes: notes || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPayments((prev) => [data.data, ...prev]);
        setShowAddModal(false);
        resetForm();
      } else {
        setError(data.error || "Failed to add payment");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedShop("");
    setAmount("");
    setMode("cash");
    setReference("");
    setNotes("");
    setError("");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getModeIcon = (paymentMode: PaymentMode) => {
    switch (paymentMode) {
      case "cash":
        return <Banknote className="w-4 h-4" />;
      case "upi":
        return <CreditCard className="w-4 h-4" />;
      case "bank":
        return <Building className="w-4 h-4" />;
    }
  };

  const getModeColor = (paymentMode: PaymentMode) => {
    switch (paymentMode) {
      case "cash":
        return "bg-green-100 text-green-800";
      case "upi":
        return "bg-purple-100 text-purple-800";
      case "bank":
        return "bg-blue-100 text-blue-800";
    }
  };

  const filteredPayments = payments.filter(
    (payment) =>
      search === "" ||
      payment.shop?.shopName.toLowerCase().includes(search.toLowerCase()) ||
      payment.reference?.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate totals
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("payments")}</h1>
          <p className="text-gray-500">
            {t("total")}: ₹{totalAmount.toLocaleString()}
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t("addPayment")}
        </Button>
      </div>

      {/* Search */}
      <div className="flex-1">
        <Input
          placeholder={t("searchPayments")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-5 h-5" />}
        />
      </div>

      {/* Payments List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" />
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {t("noPayments")}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <div
                  key={payment._id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50"
                >
                  <div className="space-y-1">
                    <p className="font-semibold">
                      {payment.shop?.shopName || "Unknown Shop"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(payment.createdAt)}
                    </p>
                    {payment.reference && (
                      <p className="text-xs text-gray-400">
                        Ref: {payment.reference}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">
                      ₹{payment.amount.toLocaleString()}
                    </p>
                    <Badge className={getModeColor(payment.mode)}>
                      {getModeIcon(payment.mode)}
                      <span className="ml-1">{payment.mode.toUpperCase()}</span>
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Payment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">{t("addPayment")}</h2>

              <form onSubmit={handleAddPayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("shop")} *
                  </label>
                  <select
                    value={selectedShop}
                    onChange={(e) => setSelectedShop(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    required
                  >
                    <option value="">{t("selectShop")}</option>
                    {shops.map((shop) => (
                      <option key={shop._id} value={shop._id}>
                        {shop.shopName} - {shop.ownerName}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  type="number"
                  label={`${t("amount")} (₹) *`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={t("amount")}
                  required
                />

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("paymentMode")} *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["cash", "upi", "bank"] as PaymentMode[]).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMode(m)}
                        className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                          mode === m
                            ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                            : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        {t(m)}
                      </button>
                    ))}
                  </div>
                </div>

                <Input
                  label={t("reference")}
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder={t("optional")}
                />

                <Input
                  label={t("notes")}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t("optional")}
                />

                {error && (
                  <p className="text-sm text-[var(--error)]">{error}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="flex-1"
                  >
                    {tCommon("cancel")}
                  </Button>
                  <Button
                    type="submit"
                    isLoading={submitting}
                    className="flex-1"
                  >
                    {t("addPayment")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
