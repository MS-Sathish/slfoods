"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Store,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Package,
  CheckCircle,
  XCircle,
  IndianRupee,
  Key,
  X,
} from "lucide-react";
import { Card, CardContent, Button, Badge, Input } from "@/components/ui";
import { useAuthStore } from "@/store/auth";
import { ShopStatus, OrderStatus } from "@/types";
import { cn } from "@/lib/utils/cn";

interface Shop {
  _id: string;
  shopName: string;
  ownerName: string;
  email: string;
  mobile: string;
  address: {
    street: string;
    area: string;
    city: string;
  };
  gstNumber?: string;
  status: ShopStatus;
  creditLimit: number;
  pendingBalance: number;
  createdAt: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}

interface Payment {
  _id: string;
  amount: number;
  mode: string;
  createdAt: string;
}

export default function ShopDetailPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const params = useParams();
  const router = useRouter();
  const token = useAuthStore((state) => state.token);

  const [shop, setShop] = useState<Shop | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Reset password states
  const [showResetModal, setShowResetModal] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState("");

  useEffect(() => {
    if (params.id) {
      fetchShopDetails();
    }
  }, [params.id]);

  const fetchShopDetails = async () => {
    try {
      // Fetch shop details
      const shopResponse = await fetch(`/api/admin/shops/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const shopData = await shopResponse.json();
      if (shopData.success) {
        setShop(shopData.data);
      }

      // Fetch shop orders
      const ordersResponse = await fetch(`/api/orders?shop=${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const ordersData = await ordersResponse.json();
      if (ordersData.success) {
        setOrders(ordersData.data.slice(0, 10));
      }

      // Fetch shop payments
      const paymentsResponse = await fetch(`/api/admin/payments?shop=${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const paymentsData = await paymentsResponse.json();
      if (paymentsData.success) {
        setPayments(paymentsData.data.slice(0, 10));
      }
    } catch (error) {
      console.error("Failed to fetch shop details:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateShopStatus = async (newStatus: ShopStatus) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/shops/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        setShop((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (error) {
      console.error("Failed to update shop:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleResetPassword = async () => {
    if (!tempPassword || tempPassword.length < 6) {
      setResetError("Password must be at least 6 characters");
      return;
    }

    setResettingPassword(true);
    setResetError("");

    try {
      const response = await fetch(`/api/admin/shops/${params.id}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tempPassword }),
      });

      const data = await response.json();
      if (data.success) {
        setResetSuccess(true);
      } else {
        setResetError(data.error || "Failed to reset password");
      }
    } catch (error) {
      console.error("Failed to reset password:", error);
      setResetError("Something went wrong");
    } finally {
      setResettingPassword(false);
    }
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setTempPassword("");
    setResetSuccess(false);
    setResetError("");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status: ShopStatus) => {
    const colors: Record<ShopStatus, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      blocked: "bg-red-100 text-red-800",
    };
    return colors[status];
  };

  const getOrderStatusColor = (status: OrderStatus) => {
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

  if (!shop) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Shop not found</p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{shop.shopName}</h1>
          <p className="text-gray-500">{shop.ownerName}</p>
        </div>
        <Badge className={cn("text-sm", getStatusColor(shop.status))}>
          {shop.status.toUpperCase()}
        </Badge>
      </div>

      {/* Status Actions */}
      <Card className="bg-blue-50 border border-blue-200">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-blue-800">Shop Status</p>
            <p className="text-sm text-blue-600">
              Change shop approval status
            </p>
          </div>
          <div className="flex gap-2">
            {shop.status === "pending" && (
              <>
                <Button
                  onClick={() => updateShopStatus("approved")}
                  isLoading={updating}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="danger"
                  onClick={() => updateShopStatus("blocked")}
                  isLoading={updating}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
            {shop.status === "approved" && (
              <Button
                variant="danger"
                onClick={() => updateShopStatus("blocked")}
                isLoading={updating}
              >
                Block Shop
              </Button>
            )}
            {shop.status === "blocked" && (
              <Button
                onClick={() => updateShopStatus("approved")}
                isLoading={updating}
              >
                {t("unblock")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reset Password Card */}
      <Card className="bg-amber-50 border border-amber-200">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-amber-800">{t("resetPassword")}</p>
            <p className="text-sm text-amber-600">
              {t("enterTempPassword")}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowResetModal(true)}
            className="border-amber-400 text-amber-700 hover:bg-amber-100"
          >
            <Key className="w-4 h-4 mr-2" />
            {t("resetPassword")}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shop Info */}
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Store className="w-5 h-5 text-[var(--primary)]" />
              Shop Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Mobile</p>
                  <a href={`tel:${shop.mobile}`} className="font-medium text-[var(--primary)]">
                    {shop.mobile}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{shop.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">
                    {shop.address.street}, {shop.address.area}, {shop.address.city}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Registered On</p>
                  <p className="font-medium">{formatDate(shop.createdAt)}</p>
                </div>
              </div>
              {shop.gstNumber && (
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">GST Number</p>
                    <p className="font-medium">{shop.gstNumber}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Balance Info */}
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-[var(--primary)]" />
              Balance Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <p className="text-sm text-red-600">Pending Balance</p>
                <p className="text-2xl font-bold text-red-700">
                  ₹{shop.pendingBalance.toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-sm text-blue-600">Credit Limit</p>
                <p className="text-2xl font-bold text-blue-700">
                  ₹{shop.creditLimit.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Package className="w-5 h-5 text-[var(--primary)]" />
              Recent Orders
            </h2>
          </div>
          {orders.length > 0 ? (
            <div className="space-y-3">
              {orders.map((order) => (
                <Link
                  key={order._id}
                  href={`/admin/orders/${order._id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium">#{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{order.totalAmount.toLocaleString()}</p>
                    <Badge className={getOrderStatusColor(order.status)}>
                      {order.status.replace("_", " ")}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No orders yet</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[var(--primary)]" />
              Recent Payments
            </h2>
          </div>
          {payments.length > 0 ? (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{payment.mode.toUpperCase()}</p>
                    <p className="text-sm text-gray-500">{formatDate(payment.createdAt)}</p>
                  </div>
                  <p className="font-semibold text-green-600">
                    ₹{payment.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No payments yet</p>
          )}
        </CardContent>
      </Card>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl animate-slideUp">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">{t("resetShopPassword")}</h2>
              <button
                onClick={closeResetModal}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4">
              {resetSuccess ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    {t("passwordResetSuccess")}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {t("shopCanLogin")}
                  </p>
                  <div className="bg-gray-100 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-500">{t("tempPassword")}</p>
                    <p className="text-xl font-mono font-bold">{tempPassword}</p>
                  </div>
                  <Button onClick={closeResetModal} className="w-full">
                    {tCommon("confirm")}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                    <p className="text-sm text-amber-800">
                      <strong>{shop.shopName}</strong> - {shop.ownerName}
                    </p>
                    <p className="text-sm text-amber-600">{shop.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("tempPassword")} *
                    </label>
                    <Input
                      type="text"
                      value={tempPassword}
                      onChange={(e) => setTempPassword(e.target.value)}
                      placeholder="Enter temporary password"
                      leftIcon={<Key className="w-5 h-5" />}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum 6 characters
                    </p>
                  </div>

                  {resetError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                      {resetError}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={closeResetModal}
                      className="flex-1"
                    >
                      {tCommon("cancel")}
                    </Button>
                    <Button
                      onClick={handleResetPassword}
                      isLoading={resettingPassword}
                      className="flex-1"
                    >
                      {t("resetPassword")}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
