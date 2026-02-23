"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import BottomNav from "@/components/shop/BottomNav";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, userType, shop } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      // Redirect to login if not authenticated
      if (!isAuthenticated || userType !== "shop") {
        router.push("/login");
        return;
      }

      // Redirect to pending page if shop is not approved
      if (shop?.status === "pending") {
        router.push("/pending-approval");
        return;
      }

      // Redirect to blocked page if shop is blocked
      if (shop?.status === "blocked") {
        router.push("/blocked");
        return;
      }
    }
  }, [mounted, isAuthenticated, userType, shop, router]);

  // Show nothing while checking auth
  if (!mounted || !isAuthenticated || userType !== "shop" || shop?.status !== "approved") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-20">
      {children}
      <BottomNav />
    </div>
  );
}
