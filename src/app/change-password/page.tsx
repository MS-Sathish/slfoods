"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Lock, Key, CheckCircle, AlertTriangle } from "lucide-react";
import { Button, Input, Card, CardContent, LanguageSwitch } from "@/components/ui";
import { useAuthStore } from "@/store/auth";

export default function ChangePasswordPage() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { isAuthenticated, userType, shop, token, updateShop } = useAuthStore();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Redirect if not authenticated or not a shop owner
    if (!isAuthenticated || userType !== "shop") {
      router.push("/login");
      return;
    }

    // Redirect if password change is not required
    if (!shop?.mustChangePassword) {
      router.push("/shop");
    }
  }, [isAuthenticated, userType, shop, router]);

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError(t("fillAllFields"));
      return;
    }

    if (newPassword.length < 6) {
      setError(t("passwordTooShort"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // Update local shop state
        if (shop) {
          updateShop({ ...shop, mustChangePassword: false });
        }
        // Redirect to shop dashboard after 2 seconds
        setTimeout(() => {
          router.push("/shop");
        }, 2000);
      } else {
        setError(data.error || t("somethingWrong"));
      }
    } catch {
      setError(t("somethingWrong"));
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !shop?.mustChangePassword) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-[var(--primary)]">{tCommon("appName")}</h1>
        <LanguageSwitch />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-8">
        <Card className="w-full max-w-md shadow-xl animate-slideUp">
          <CardContent className="p-6">
            {success ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-green-800 mb-2">
                  {t("passwordChanged")}
                </h2>
                <p className="text-gray-600">
                  {t("passwordChangedDesc")}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Warning Banner */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">{t("changePassword")}</p>
                    <p className="text-sm text-amber-600 mt-1">
                      {t("tempPasswordNotice")}
                    </p>
                  </div>
                </div>

                {/* Shop Info */}
                <div className="bg-gray-50 rounded-xl p-3 border">
                  <p className="text-sm text-gray-500">Shop</p>
                  <p className="font-semibold">{shop.shopName}</p>
                  <p className="text-sm text-gray-500">{shop.email}</p>
                </div>

                {/* Password Form */}
                <div className="space-y-4">
                  <Input
                    type="password"
                    label={t("newPassword")}
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    leftIcon={<Key className="w-5 h-5 text-[var(--primary)]" />}
                  />

                  <Input
                    type="password"
                    label={t("confirmNewPassword")}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    leftIcon={<Lock className="w-5 h-5 text-[var(--primary)]" />}
                  />

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm text-center">
                      {error}
                    </div>
                  )}

                  <Button
                    onClick={handleChangePassword}
                    isLoading={loading}
                    className="w-full h-14 text-lg font-semibold rounded-xl"
                    size="lg"
                  >
                    {t("updatePassword")}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
