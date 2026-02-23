"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ClipboardList, ChevronRight, Package } from "lucide-react";
import ShopHeader from "@/components/shop/ShopHeader";
import { Card, CardContent, Badge } from "@/components/ui";
import { useAuthStore } from "@/store/auth";
import { OrderStatus } from "@/types";
import { cn } from "@/lib/utils/cn";

interface OrderItem {
  productName: string;
  quantity: number;
  unitType: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}

export default function OrdersPage() {
  const t = useTranslations();
  const token = useAuthStore((state) => state.token);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      const url = filter === "all"
        ? "/api/orders"
        : `/api/orders?status=${filter}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
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

  const filters = [
    { value: "all", label: t("common.all") },
    { value: "pending", label: t("orders.status.pending") },
    { value: "confirmed", label: t("orders.status.confirmed") },
    { value: "out_for_delivery", label: t("orders.status.out_for_delivery") },
    { value: "delivered", label: t("orders.status.delivered") },
  ];

  return (
    <div>
      <ShopHeader title={t("orders.title")} />

      <main className="p-4">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors",
                filter === f.value
                  ? "bg-[var(--primary)] text-white"
                  : "bg-white border border-[var(--border)] text-[var(--foreground)]"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList className="w-16 h-16 text-[var(--muted-foreground)] mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{t("orders.noOrders")}</h3>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link key={order._id} href={`/shop/orders/${order._id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-[var(--primary)]" />
                          <span className="font-semibold">
                            #{order.orderNumber}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--muted-foreground)] mt-1">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {t(`orders.status.${order.status}`)}
                      </Badge>
                    </div>

                    <div className="border-t border-[var(--border)] pt-3 mt-3">
                      <p className="text-sm text-[var(--muted-foreground)] line-clamp-1">
                        {order.items
                          .map(
                            (item) =>
                              `${item.productName} (${item.quantity} ${item.unitType})`
                          )
                          .join(", ")}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-[var(--primary)]">
                          ₹{order.totalAmount.toLocaleString()}
                        </span>
                        <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
