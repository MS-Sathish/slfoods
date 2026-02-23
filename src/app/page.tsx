"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, userType, shop } = useAuthStore();

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Redirect based on user type
    if (userType === "admin") {
      router.push("/admin");
    } else if (userType === "shop") {
      // Check shop status
      if (shop?.status === "approved") {
        router.push("/shop");
      } else if (shop?.status === "pending") {
        router.push("/pending-approval");
      } else {
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
  }, [isAuthenticated, userType, shop, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-[var(--muted-foreground)]">Loading...</p>
      </div>
    </div>
  );
}
