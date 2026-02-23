"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  User,
  MapPin,
  Phone,
  FileText,
  LogOut,
  ChevronRight,
} from "lucide-react";
import ShopHeader from "@/components/shop/ShopHeader";
import { Card, CardContent, Button } from "@/components/ui";
import { useAuthStore } from "@/store/auth";

export default function ProfilePage() {
  const t = useTranslations();
  const router = useRouter();
  const { shop, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleCallAdmin = () => {
    window.location.href = "tel:+919876543210";
  };

  return (
    <div>
      <ShopHeader title={t("profile.title")} />

      <main className="p-4 space-y-4">
        {/* Shop Info Card */}
        <Card className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] text-white">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{shop?.shopName}</h2>
                <p className="opacity-90">{shop?.ownerName}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">{t("profile.myDetails")}</h3>

            <div className="space-y-4">
              {/* Mobile */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--muted)] rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {t("auth.mobileNumber")}
                  </p>
                  <p className="font-medium">{shop?.mobile}</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--muted)] rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {t("shop.address")}
                  </p>
                  <p className="font-medium">
                    {shop?.address.street}, {shop?.address.area},{" "}
                    {shop?.address.city}
                  </p>
                </div>
              </div>

              {/* GST Number */}
              {shop?.gstNumber && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--muted)] rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {t("shop.gstNumber")}
                    </p>
                    <p className="font-medium">{shop.gstNumber}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="p-0">
            <button
              onClick={handleCallAdmin}
              className="w-full flex items-center justify-between p-4 hover:bg-[var(--muted)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[var(--primary)]" />
                <span className="font-medium">{t("profile.callAdmin")}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
            </button>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full text-[var(--error)] border-[var(--error)] hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-2" />
          {t("auth.logout")}
        </Button>

        {/* App Info */}
        <p className="text-center text-sm text-[var(--muted-foreground)] py-4">
          Lakshmi Hot Chips v1.0.0
        </p>
      </main>
    </div>
  );
}
