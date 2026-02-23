"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Clock, Phone, RefreshCw } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import { useAuthStore } from "@/store/auth";

export default function PendingApprovalPage() {
  const t = useTranslations();
  const router = useRouter();
  const { isAuthenticated, shop, token, updateShop, logout } = useAuthStore();
  const [checking, setChecking] = useState(false);

  const checkStatus = async () => {
    if (!token) return;

    setChecking(true);
    try {
      const response = await fetch("/api/shop/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success && data.data.status === "approved") {
        updateShop(data.data);
        router.push("/shop");
      } else if (data.success && data.data.status === "blocked") {
        logout();
        router.push("/login");
      }
    } catch (error) {
      console.error("Failed to check status:", error);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (shop?.status === "approved") {
      router.push("/shop");
      return;
    }

    // Check status on mount and every 30 seconds
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, shop, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-yellow-600" />
          </div>

          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
            {t("auth.waitingApproval")}
          </h1>

          <p className="text-[var(--muted-foreground)] mb-6">
            {t("auth.shopPending")}
          </p>

          {shop && (
            <div className="bg-[var(--muted)] rounded-lg p-4 mb-6 text-left">
              <p className="font-medium">{shop.shopName}</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                {shop.ownerName}
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">
                {shop.mobile}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              className="w-full"
              onClick={checkStatus}
              disabled={checking}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${checking ? "animate-spin" : ""}`} />
              {checking ? t("dashboard.checking") : t("dashboard.checkStatus")}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = "tel:+919876543210"}
            >
              <Phone className="w-4 h-4 mr-2" />
              Call Admin
            </Button>

            <Button
              variant="ghost"
              className="w-full text-[var(--muted-foreground)]"
              onClick={handleLogout}
            >
              {t("auth.logout")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
