"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Mail, Lock, ArrowRight, UserPlus, Phone, MapPin, Building2 } from "lucide-react";
import { Button, Input, Card, CardContent, LanguageSwitch } from "@/components/ui";
import { useAuthStore } from "@/store/auth";

type Mode = "login" | "register";

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const { isAuthenticated, userType, shop, setShopAuth, setAdminAuth } = useAuthStore();

  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Registration fields
  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [street, setStreet] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      if (userType === "admin") {
        router.push("/admin");
      } else if (userType === "shop") {
        if (shop?.status === "approved") {
          router.push("/shop");
        } else {
          router.push("/pending-approval");
        }
      }
    }
  }, [isAuthenticated, userType, shop, router]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError(t("auth.fillAllFields"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.data.type === "admin") {
          setAdminAuth(data.data.admin, data.data.token);
          router.push("/admin");
        } else {
          setShopAuth(data.data.shop, data.data.token);
          // Check if password change is required
          if (data.data.shop.mustChangePassword) {
            router.push("/change-password");
          } else if (data.data.shop.status === "approved") {
            router.push("/shop");
          } else {
            router.push("/pending-approval");
          }
        }
      } else {
        setError(data.error || t("auth.loginFailed"));
      }
    } catch {
      setError(t("auth.somethingWrong"));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!shopName || !ownerName || !email || !mobile || !regPassword || !street || !area || !city) {
      setError(t("auth.fillAllFields"));
      return;
    }

    if (regPassword !== confirmPassword) {
      setError(t("auth.passwordMismatch"));
      return;
    }

    if (regPassword.length < 6) {
      setError(t("auth.passwordTooShort"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/shop/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopName,
          ownerName,
          email,
          mobile,
          password: regPassword,
          address: { street, area, city },
          gstNumber: gstNumber || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShopAuth(data.data.shop, data.data.token);
        router.push("/pending-approval");
      } else {
        setError(data.error || t("auth.registrationFailed"));
      }
    } catch {
      setError(t("auth.somethingWrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Top Banner */}
      <header className="pt-8 pb-6 px-4">
        <div className="flex justify-end mb-6">
          <LanguageSwitch />
        </div>

        {/* God Images with Company Name in Center */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 mb-4">
          {/* Left Image - Perumal & Lakshmi */}
          <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full bg-gradient-to-br from-amber-100 to-amber-50 p-1 sm:p-1.5 shadow-xl border-2 sm:border-3 border-amber-400 overflow-hidden flex-shrink-0">
            <img
              src="/images/lakshmi-perumal.jpg"
              alt="Lord Perumal & Goddess Lakshmi"
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          {/* Center - Company Name */}
          <div className="text-center px-1 sm:px-3">
            <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-green-700 drop-shadow-sm leading-tight">
              {t("common.appName")}
            </h1>
            <p className="text-green-600 text-xs sm:text-sm md:text-base font-semibold mt-1 sm:mt-2">{t("common.tagline")}</p>
            <p className="text-[var(--muted-foreground)] text-xs sm:text-sm mt-0.5 sm:mt-1">
              Prop: SURESH PERUMAL
            </p>
          </div>

          {/* Right Image - Murugan */}
          <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full bg-gradient-to-br from-amber-100 to-amber-50 p-1 sm:p-1.5 shadow-xl border-2 sm:border-3 border-amber-400 overflow-hidden flex-shrink-0">
            <img
              src="/images/ea1c4de85f634eb02f4dae6972b915de.jpg"
              alt="Lord Murugan"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
      </header>

      <main className="px-4 pb-8">
        <Card className="max-w-md mx-auto shadow-xl animate-slideUp border border-[var(--border)] bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            {mode === "login" ? (
              <div className="space-y-5">
                {/* Login Header */}
                <div className="text-center">
                  <h2 className="text-xl font-bold text-[var(--foreground)]">{t("auth.welcomeBack")}</h2>
                  <p className="text-[var(--muted-foreground)] text-sm mt-1">{t("auth.loginToContinue")}</p>
                </div>

                {/* Login Form */}
                <div className="space-y-4">
                  <Input
                    type="email"
                    label={t("auth.email")}
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    leftIcon={<Mail className="w-5 h-5 text-[var(--primary)]" />}
                  />

                  <Input
                    type="password"
                    label={t("auth.password")}
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    leftIcon={<Lock className="w-5 h-5 text-[var(--primary)]" />}
                  />

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm text-center">
                      {error}
                    </div>
                  )}

                  <Button
                    onClick={handleLogin}
                    isLoading={loading}
                    className="w-full h-14 text-lg font-semibold rounded-xl"
                    size="lg"
                  >
                    {t("auth.login")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>

                {/* Register Link */}
                <div className="text-center pt-4 border-t border-[var(--border)]">
                  <p className="text-[var(--muted-foreground)] mb-3 text-sm">{t("auth.noAccount")}</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMode("register");
                      setError("");
                    }}
                    className="w-full h-12"
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    {t("auth.registerShop")}
                  </Button>
                </div>

              </div>
            ) : (
              <div className="space-y-5">
                {/* Register Header */}
                <div className="text-center">
                  <h2 className="text-xl font-bold text-[var(--foreground)]">{t("auth.registerShop")}</h2>
                  <p className="text-[var(--muted-foreground)] text-sm mt-1">{t("auth.createAccount")}</p>
                </div>

                {/* Shop Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[var(--primary)] font-semibold text-sm">
                    <Building2 className="w-4 h-4" />
                    <span>{t("shop.shopDetails")}</span>
                  </div>

                  <Input
                    label={t("shop.shopName")}
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder={t("shop.enterShopName")}
                  />

                  <Input
                    label={t("shop.ownerName")}
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder={t("shop.enterOwnerName")}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="email"
                      label={t("auth.email")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("auth.enterEmail")}
                      leftIcon={<Mail className="w-4 h-4" />}
                    />
                    <Input
                      type="tel"
                      label={t("auth.mobileNumber")}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder={t("auth.enterMobile")}
                      leftIcon={<Phone className="w-4 h-4" />}
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[var(--primary)] font-semibold text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{t("shop.address")}</span>
                  </div>

                  <Input
                    label={t("shop.street")}
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder={t("shop.enterStreet")}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label={t("shop.area")}
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder={t("shop.enterArea")}
                    />
                    <Input
                      label={t("shop.city")}
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder={t("shop.enterCity")}
                    />
                  </div>

                  <Input
                    label={t("shop.gstOptional")}
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder={t("shop.enterGst")}
                  />
                </div>

                {/* Password */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[var(--primary)] font-semibold text-sm">
                    <Lock className="w-4 h-4" />
                    <span>{t("auth.setPassword")}</span>
                  </div>

                  <Input
                    type="password"
                    label={t("auth.password")}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder={t("auth.enterPassword")}
                  />

                  <Input
                    type="password"
                    label={t("auth.confirmPassword")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t("auth.enterConfirmPassword")}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm text-center">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleRegister}
                  isLoading={loading}
                  className="w-full h-14 text-lg font-semibold rounded-xl"
                  size="lg"
                >
                  {t("shop.submitRegistration")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                {/* Back to Login */}
                <div className="text-center pt-4 border-t border-[var(--border)]">
                  <p className="text-[var(--muted-foreground)] mb-3 text-sm">{t("auth.alreadyHaveAccount")}</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMode("login");
                      setError("");
                    }}
                    className="w-full h-12"
                  >
                    {t("auth.backToLogin")}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-[var(--muted-foreground)]">
        <p className="font-semibold">&copy; 2024 Shree Laxmi Foods</p>
        <p className="text-xs mt-1">Gat No 30, Rautwadi, Dattanagar</p>
        <p className="text-xs">Mulshi, Pune - 412115</p>
      </footer>
    </div>
  );
}
