"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ClipboardList, ChevronRight, Package, ArrowLeft, Calendar } from "lucide-react";
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
  const router = useRouter();
  const { token, shop } = useAuthStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (shop?._id) {
      fetchOrders();
    }
  }, [filter, shop?._id]);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (shop?._id) params.set("shopId", shop._id);
      if (filter !== "all") params.set("status", filter);

      const url = `/api/orders?${params.toString()}`;

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
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Header */}
      <header className="sticky top-0 hero-gradient text-white z-40 shadow-lg">
        <div className="px-4 py-4">
          <div className="flex items-center gap-4 mb-3">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold">{t("orders.title")}</h1>
              <p className="text-white/80 text-sm">{t("orders.trackYourOrders")}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Filters - Sticky below header */}
      <div className="sticky top-[72px] bg-[var(--background)] z-30 px-4 py-3 shadow-sm">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-semibold transition-all shadow-sm",
                filter === f.value
                  ? "bg-[var(--primary)] text-white shadow-md"
                  : "bg-white text-[var(--foreground)] hover:bg-[var(--muted)]"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <main className="p-4 pb-24">
        {/* Orders List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full mb-4" />
            <p className="text-[var(--muted-foreground)]">{t("common.loading")}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-[var(--muted)] rounded-full flex items-center justify-center mb-4">
              <ClipboardList className="w-10 h-10 text-[var(--muted-foreground)]" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">{t("orders.noOrders")}</h3>
            <p className="text-[var(--muted-foreground)]">{t("orders.noOrdersDesc")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order, index) => (
              <Link key={order._id} href={`/shop/orders/${order._id}`}>
                <Card
                  className="hover:shadow-lg transition-all cursor-pointer animate-fadeIn overflow-hidden border-0 shadow-md"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className={cn(
                    "h-1",
                    order.status === "delivered" ? "bg-green-500" :
                    order.status === "cancelled" ? "bg-red-500" :
                    order.status === "pending" ? "bg-yellow-500" :
                    "bg-blue-500"
                  )} />
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center",
                          order.status === "delivered" ? "bg-green-100" :
                          order.status === "cancelled" ? "bg-red-100" :
                          order.status === "pending" ? "bg-yellow-100" :
                          "bg-blue-100"
                        )}>
                          <Package className={cn(
                            "w-6 h-6",
                            order.status === "delivered" ? "text-green-600" :
                            order.status === "cancelled" ? "text-red-600" :
                            order.status === "pending" ? "text-yellow-600" :
                            "text-blue-600"
                          )} />
                        </div>
                        <div>
                          <span className="font-bold text-lg text-[var(--foreground)]">
                            #{order.orderNumber}
                          </span>
                          <div className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)]">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(order.createdAt)}
                          </div>
                        </div>
                      </div>
                      <Badge className={cn("font-semibold", getStatusColor(order.status))}>
                        {t(`orders.status.${order.status}`)}
                      </Badge>
                    </div>

                    <p className="text-sm text-[var(--muted-foreground)] line-clamp-1 mb-3">
                      {order.items
                        .map(
                          (item) =>
                            `${item.productName} (${item.quantity} ${item.unitType})`
                        )
                        .join(", ")}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                      <span className="text-2xl font-bold text-[var(--primary)]">
                        ₹{order.totalAmount.toLocaleString()}
                      </span>
                      <div className="flex items-center gap-2 text-[var(--primary)] font-medium">
                        <span className="text-sm">{t("common.viewDetails")}</span>
                        <ChevronRight className="w-5 h-5" />
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
