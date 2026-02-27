"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  User,
  MapPin,
  Phone,
  FileText,
  LogOut,
  ChevronRight,
  ArrowLeft,
  Mail,
  Store,
  Settings,
} from "lucide-react";
import { Card, CardContent, Button } from "@/components/ui";
import { useAuthStore } from "@/store/auth";

export default function ProfilePage() {
  const t = useTranslations();
  const router = useRouter();
  const { shop, logout } = useAuthStore();
  const [adminMobile, setAdminMobile] = useState("");

  useEffect(() => {
    async function fetchAdminContact() {
      try {
        const response = await fetch("/api/admin/contact");
        const data = await response.json();
        if (data.success && data.data.mobile) {
          setAdminMobile(data.data.mobile);
        }
      } catch (error) {
        console.error("Failed to fetch admin contact:", error);
      }
    }
    fetchAdminContact();
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleCallAdmin = () => {
    if (adminMobile) {
      window.location.href = `tel:${adminMobile}`;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Header */}
      <header className="hero-gradient text-white pt-6 pb-24 px-4 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold">{t("profile.title")}</h1>
            <p className="text-white/80 text-sm">{t("profile.manageAccount")}</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Store className="w-8 h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold truncate">{shop?.shopName}</h2>
              <p className="text-white/80 truncate">{shop?.ownerName}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 -mt-10 pb-24 space-y-4">
        {/* Contact Info Card */}
        <Card className="shadow-lg border-0 animate-fadeIn">
          <CardContent className="p-5">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-[var(--primary)]" />
              {t("profile.myDetails")}
            </h3>

            <div className="space-y-4">
              {/* Mobile */}
              <div className="flex items-center gap-4 p-3 bg-[var(--muted)]/50 rounded-xl">
                <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center">
                  <Phone className="w-6 h-6 text-[var(--primary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wide">
                    {t("auth.mobileNumber")}
                  </p>
                  <p className="font-semibold text-lg">{shop?.mobile}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-4 p-3 bg-[var(--muted)]/50 rounded-xl">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wide">
                    {t("auth.email")}
                  </p>
                  <p className="font-semibold truncate">{shop?.email}</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-center gap-4 p-3 bg-[var(--muted)]/50 rounded-xl">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wide">
                    {t("shop.address")}
                  </p>
                  <p className="font-semibold">
                    {shop?.address.street}, {shop?.address.area}, {shop?.address.city}
                  </p>
                </div>
              </div>

              {/* GST Number */}
              {shop?.gstNumber && (
                <div className="flex items-center gap-4 p-3 bg-[var(--muted)]/50 rounded-xl">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wide">
                      {t("shop.gstNumber")}
                    </p>
                    <p className="font-semibold">{shop.gstNumber}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Call Admin Action */}
        {adminMobile && (
          <Card className="shadow-lg border-0 overflow-hidden animate-fadeIn" style={{ animationDelay: "0.1s" }}>
            <button
              onClick={handleCallAdmin}
              className="w-full flex items-center justify-between p-5 hover:bg-[var(--muted)]/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-[var(--foreground)]">{t("profile.callAdmin")}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">{t("profile.needHelp")}</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-[var(--muted-foreground)]" />
            </button>
          </Card>
        )}

        {/* Logout Button */}
        <Card className="shadow-lg border-0 overflow-hidden animate-fadeIn" style={{ animationDelay: "0.2s" }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-5 hover:bg-red-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-red-600">{t("auth.logout")}</p>
                <p className="text-sm text-[var(--muted-foreground)]">{t("profile.signOutAccount")}</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-red-400" />
          </button>
        </Card>

        {/* App Info */}
        <div className="text-center py-6">
          <p className="text-sm font-semibold text-[var(--foreground)]">Shree Laxmi Foods</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">v1.0.0</p>
        </div>
      </main>
    </div>
  );
}
