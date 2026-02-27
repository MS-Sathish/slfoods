"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Clock,
  Calendar,
  FileText,
  ShoppingBag,
} from "lucide-react";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { useAuthStore } from "@/store/auth";
import { OrderStatus } from "@/types";
import { cn } from "@/lib/utils/cn";

interface OrderItem {
  productName: string;
  quantity: number;
  rate: number;
  unitType: string;
  total: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  notes?: string;
  deliveryAddress: {
    street: string;
    area: string;
    city: string;
  };
  createdAt: string;
  confirmedAt?: string;
  packedAt?: string;
  outForDeliveryAt?: string;
  deliveredAt?: string;
}

const statusSteps: { status: OrderStatus; icon: React.ElementType }[] = [
  { status: "pending", icon: Clock },
  { status: "confirmed", icon: CheckCircle2 },
  { status: "packed", icon: Package },
  { status: "out_for_delivery", icon: Truck },
  { status: "delivered", icon: CheckCircle2 },
];

export default function OrderDetailsPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const token = useAuthStore((state) => state.token);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const isSuccess = searchParams.get("success") === "true";

  useEffect(() => {
    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setOrder(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIndex = (status: OrderStatus) => {
    return statusSteps.findIndex((s) => s.status === status);
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors: Record<OrderStatus, { bg: string; text: string; icon: string }> = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", icon: "text-yellow-600" },
      confirmed: { bg: "bg-blue-100", text: "text-blue-800", icon: "text-blue-600" },
      packed: { bg: "bg-purple-100", text: "text-purple-800", icon: "text-purple-600" },
      out_for_delivery: { bg: "bg-orange-100", text: "text-orange-800", icon: "text-orange-600" },
      delivered: { bg: "bg-green-100", text: "text-green-800", icon: "text-green-600" },
      cancelled: { bg: "bg-red-100", text: "text-red-800", icon: "text-red-600" },
    };
    return colors[status];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <header className="hero-gradient text-white pt-6 pb-16 px-4 rounded-b-3xl shadow-lg">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">{t("orders.orderDetails")}</h1>
          </div>
        </header>
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <header className="hero-gradient text-white pt-6 pb-16 px-4 rounded-b-3xl shadow-lg">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">{t("orders.orderDetails")}</h1>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center py-16">
          <Package className="w-16 h-16 text-[var(--muted-foreground)] mb-4" />
          <p className="text-lg font-medium">{t("orders.orderNotFound")}</p>
        </div>
      </div>
    );
  }

  const currentStatusIndex = getStatusIndex(order.status);
  const statusColor = getStatusColor(order.status);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Header */}
      <header className="hero-gradient text-white pt-6 pb-20 px-4 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold">{t("orders.orderDetails")}</h1>
            <p className="text-white/80 text-sm">#{order.orderNumber}</p>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white/80 text-sm">{t("cart.totalAmount")}</p>
                <p className="text-3xl font-bold">₹{order.totalAmount.toLocaleString()}</p>
              </div>
            </div>
            <Badge className={cn("font-semibold px-3 py-1.5", statusColor.bg, statusColor.text)}>
              {t(`orders.status.${order.status}`)}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <Calendar className="w-4 h-4" />
            {formatDate(order.createdAt)}
          </div>
        </div>
      </header>

      <main className="px-4 -mt-8 pb-24 space-y-4">
        {/* Success Message */}
        {isSuccess && (
          <Card className="shadow-lg border-0 bg-gradient-to-r from-green-50 to-emerald-50 animate-fadeIn">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-green-800 text-lg">
                  {t("orders.orderPlaced")}
                </h3>
                <p className="text-sm text-green-600">
                  {t("orders.orderSubmitted")}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Tracker */}
        {order.status !== "cancelled" && (
          <Card className="shadow-lg border-0 animate-fadeIn">
            <CardContent className="p-5">
              <h3 className="font-bold text-lg mb-4">{t("orders.trackOrder")}</h3>
              <div className="relative">
                {statusSteps.map((step, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  const Icon = step.icon;

                  return (
                    <div key={step.status} className="flex items-start mb-5 last:mb-0">
                      <div className="relative">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                            isCompleted
                              ? "bg-green-500 text-white shadow-md"
                              : "bg-gray-100 text-gray-400"
                          )}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        {index < statusSteps.length - 1 && (
                          <div
                            className={cn(
                              "absolute left-5 top-10 w-0.5 h-6 -translate-x-1/2",
                              index < currentStatusIndex
                                ? "bg-green-500"
                                : "bg-gray-200"
                            )}
                          />
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <p
                          className={cn(
                            "font-semibold",
                            isCompleted ? "text-[var(--foreground)]" : "text-gray-400",
                            isCurrent && "text-[var(--primary)]"
                          )}
                        >
                          {t(`orders.status.${step.status}`)}
                        </p>
                        {isCurrent && (
                          <Badge className="mt-1 bg-[var(--primary)] text-white text-xs">
                            {t("orders.currentStatus")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cancelled Status */}
        {order.status === "cancelled" && (
          <Card className="shadow-lg border-0 bg-gradient-to-r from-red-50 to-red-100 animate-fadeIn">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-14 h-14 bg-red-200 rounded-xl flex items-center justify-center">
                <Package className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <Badge className="bg-red-200 text-red-800 font-semibold">
                  {t("orders.status.cancelled")}
                </Badge>
                <p className="text-sm text-red-600 mt-1">{t("orders.orderCancelled")}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Items */}
        <Card className="shadow-lg border-0 animate-fadeIn" style={{ animationDelay: "0.1s" }}>
          <CardContent className="p-5">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-[var(--primary)]" />
              {t("orders.orderItems")}
            </h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 px-3 bg-[var(--muted)]/50 rounded-xl"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-[var(--foreground)]">{item.productName}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {item.quantity} {item.unitType} × ₹{item.rate}
                    </p>
                  </div>
                  <span className="font-bold text-lg text-[var(--primary)]">
                    ₹{item.total.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-4 mt-4 border-t-2 border-[var(--primary)]">
              <span className="font-bold text-lg">{t("cart.totalAmount")}</span>
              <span className="font-bold text-2xl text-[var(--primary)]">
                ₹{order.totalAmount.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Address */}
        <Card className="shadow-lg border-0 animate-fadeIn" style={{ animationDelay: "0.2s" }}>
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold mb-1">{t("orders.deliveryAddress")}</h3>
                <p className="text-[var(--muted-foreground)]">
                  {order.deliveryAddress.street}, {order.deliveryAddress.area}, {order.deliveryAddress.city}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {order.notes && (
          <Card className="shadow-lg border-0 animate-fadeIn" style={{ animationDelay: "0.3s" }}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">{t("orders.notes")}</h3>
                  <p className="text-[var(--muted-foreground)]">{order.notes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Back to Orders Button */}
        <Button
          variant="outline"
          className="w-full h-14 text-lg font-semibold"
          onClick={() => router.push("/shop/orders")}
        >
          {t("orders.viewOrders")}
        </Button>
      </main>
    </div>
  );
}
