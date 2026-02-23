"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Search, Filter, ChevronRight } from "lucide-react";
import { Card, CardContent, Input, Badge, Button } from "@/components/ui";
import { useAuthStore } from "@/store/auth";
import { OrderStatus } from "@/types";
import { cn } from "@/lib/utils/cn";

interface Order {
  _id: string;
  orderNumber: string;
  shop: {
    _id: string;
    shopName: string;
    mobile: string;
  };
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const t = useTranslations("admin");
  const tOrders = useTranslations("orders");
  const token = useAuthStore((state) => state.token);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      const url =
        filter === "all" ? "/api/orders" : `/api/orders?status=${filter}`;

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

  const filteredOrders = orders.filter(
    (order) =>
      search === "" ||
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.shop?.shopName.toLowerCase().includes(search.toLowerCase())
  );

  const statusFilters = [
    { value: "all", label: t("all") },
    { value: "pending", label: tOrders("status.pending") },
    { value: "confirmed", label: tOrders("status.confirmed") },
    { value: "packed", label: tOrders("status.packed") },
    { value: "out_for_delivery", label: tOrders("status.out_for_delivery") },
    { value: "delivered", label: tOrders("status.delivered") },
    { value: "cancelled", label: tOrders("status.cancelled") },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("orders")}</h1>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder={t("searchOrders")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-5 h-5" />}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            {statusFilters.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {t("noOrders")}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <Link
                  key={order._id}
                  href={`/admin/orders/${order._id}`}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">#{order.orderNumber}</span>
                      <Badge className={getStatusColor(order.status)}>
                        {tOrders(`status.${order.status}`)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      {order.shop?.shopName || "Unknown Shop"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-lg">
                      ₹{order.totalAmount.toLocaleString()}
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
