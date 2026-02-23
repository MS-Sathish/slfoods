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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t("orders.orderNotFound")}</p>
      </div>
    );
  }

  const currentStatusIndex = getStatusIndex(order.status);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 bg-[var(--primary)] text-white z-40">
        <div className="flex items-center gap-4 px-4 py-3">
          <button onClick={() => router.back()}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-lg font-bold">#{order.orderNumber}</h1>
            <p className="text-sm opacity-90">{formatDate(order.createdAt)}</p>
          </div>
        </div>
      </header>

      <main className="p-4 pb-24 space-y-4">
        {/* Success Message */}
        {isSuccess && (
          <Card className="bg-green-50 border border-green-200">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">
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
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">{t("orders.trackOrder")}</h3>
              <div className="relative">
                {statusSteps.map((step, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  const Icon = step.icon;

                  return (
                    <div key={step.status} className="flex items-start mb-4 last:mb-0">
                      <div className="relative">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            isCompleted
                              ? "bg-green-500 text-white"
                              : "bg-gray-200 text-gray-400"
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        {index < statusSteps.length - 1 && (
                          <div
                            className={cn(
                              "absolute left-4 top-8 w-0.5 h-8 -translate-x-1/2",
                              index < currentStatusIndex
                                ? "bg-green-500"
                                : "bg-gray-200"
                            )}
                          />
                        )}
                      </div>
                      <div className="ml-3">
                        <p
                          className={cn(
                            "font-medium",
                            isCompleted ? "text-green-700" : "text-gray-400",
                            isCurrent && "text-[var(--primary)]"
                          )}
                        >
                          {t(`orders.status.${step.status}`)}
                        </p>
                        {isCurrent && (
                          <Badge className="mt-1 bg-[var(--primary)] text-white">
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
          <Card className="bg-red-50 border border-red-200">
            <CardContent className="p-4">
              <Badge className="bg-red-100 text-red-800">
                {t("orders.status.cancelled")}
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Order Items */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">{t("orders.orderItems")}</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0"
                >
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {item.quantity} {item.unitType} × ₹{item.rate}
                    </p>
                  </div>
                  <span className="font-semibold">
                    ₹{item.total.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-3 mt-3 border-t-2 border-[var(--primary)]">
              <span className="font-bold text-lg">{t("cart.totalAmount")}</span>
              <span className="font-bold text-lg text-[var(--primary)]">
                ₹{order.totalAmount.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Address */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[var(--primary)] mt-1" />
              <div>
                <h3 className="font-semibold mb-1">{t("orders.deliveryAddress")}</h3>
                <p className="text-[var(--muted-foreground)]">
                  {order.deliveryAddress.street}, {order.deliveryAddress.area},{" "}
                  {order.deliveryAddress.city}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {order.notes && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-1">{t("orders.notes")}</h3>
              <p className="text-[var(--muted-foreground)]">{order.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Back to Orders Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push("/shop/orders")}
        >
          {t("orders.viewOrders")}
        </Button>
      </main>
    </div>
  );
}
