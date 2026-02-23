"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Search, Store, Phone, MapPin, ChevronRight, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, Input, Badge, Button } from "@/components/ui";
import { useAuthStore } from "@/store/auth";
import { ShopStatus } from "@/types";
import { cn } from "@/lib/utils/cn";

interface Shop {
  _id: string;
  shopName: string;
  ownerName: string;
  mobile: string;
  address: {
    street: string;
    area: string;
    city: string;
  };
  status: ShopStatus;
  orderCount: number;
  pendingBalance: number;
  createdAt: string;
}

export default function AdminShopsPage() {
  const t = useTranslations("admin");
  const searchParams = useSearchParams();
  const token = useAuthStore((state) => state.token);

  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get("status") || "all");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchShops();
  }, [filter]);

  const fetchShops = async () => {
    try {
      const url =
        filter === "all"
          ? "/api/admin/shops"
          : `/api/admin/shops?status=${filter}`;

      const response = await fetch(url, {
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
    } finally {
      setLoading(false);
    }
  };

  const updateShopStatus = async (shopId: string, newStatus: ShopStatus) => {
    setUpdating(shopId);
    try {
      const response = await fetch(`/api/admin/shops/${shopId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        setShops((prev) =>
          prev.map((shop) =>
            shop._id === shopId ? { ...shop, status: newStatus } : shop
          )
        );
      }
    } catch (error) {
      console.error("Failed to update shop:", error);
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: ShopStatus) => {
    const colors: Record<ShopStatus, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      blocked: "bg-red-100 text-red-800",
    };
    return colors[status];
  };

  const filteredShops = shops.filter(
    (shop) =>
      search === "" ||
      shop.shopName.toLowerCase().includes(search.toLowerCase()) ||
      shop.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      shop.mobile.includes(search)
  );

  const statusLabels: Record<string, string> = {
    all: t("all"),
    pending: t("pending"),
    approved: t("approved"),
    blocked: t("blocked"),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("shops")}</h1>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder={t("searchShops")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-5 h-5" />}
          />
        </div>
        <div className="flex gap-2">
          {["all", "pending", "approved", "blocked"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-colors",
                filter === status
                  ? "bg-[var(--primary)] text-white"
                  : "bg-white border border-gray-200 hover:bg-gray-50"
              )}
            >
              {statusLabels[status]}
            </button>
          ))}
        </div>
      </div>

      {/* Shops List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" />
        </div>
      ) : filteredShops.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            {t("noShops")}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredShops.map((shop) => (
            <Card key={shop._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[var(--primary)] rounded-lg flex items-center justify-center">
                      <Store className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{shop.shopName}</h3>
                      <p className="text-sm text-gray-500">{shop.ownerName}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(shop.status)}>
                    {statusLabels[shop.status]}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    {shop.mobile}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {shop.address.area}, {shop.address.city}
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-t border-gray-100">
                  <div>
                    <p className="text-sm text-gray-500">{t("orders")}</p>
                    <p className="font-semibold">{shop.orderCount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{t("pendingBalance")}</p>
                    <p className="font-semibold text-red-600">
                      ₹{shop.pendingBalance.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  {shop.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateShopStatus(shop._id, "approved")}
                        isLoading={updating === shop._id}
                        className="flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {t("approve")}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => updateShopStatus(shop._id, "blocked")}
                        isLoading={updating === shop._id}
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        {t("reject")}
                      </Button>
                    </>
                  )}
                  {shop.status === "approved" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateShopStatus(shop._id, "blocked")}
                      isLoading={updating === shop._id}
                      className="flex-1"
                    >
                      {t("blockShop")}
                    </Button>
                  )}
                  {shop.status === "blocked" && (
                    <Button
                      size="sm"
                      onClick={() => updateShopStatus(shop._id, "approved")}
                      isLoading={updating === shop._id}
                      className="flex-1"
                    >
                      {t("unblock")}
                    </Button>
                  )}
                  <Link href={`/admin/shops/${shop._id}`} className="flex-1">
                    <Button size="sm" variant="ghost" className="w-full">
                      {t("view")} <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
