"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Mail, Lock, ArrowRight, UserPlus, Phone, MapPin, Building2, Plus, Trash2, Store, Check } from "lucide-react";
import { Button, Input, Card, CardContent, LanguageSwitch } from "@/components/ui";
import { useAuthStore } from "@/store/auth";
import { Shop } from "@/types";

type Mode = "login" | "register" | "selectShop";

interface ShopForm {
  shopName: string;
  ownerName: string;
  mobile: string;
  street: string;
  area: string;
  city: string;
  gstNumber: string;
}

const emptyShopForm: ShopForm = {
  shopName: "",
  ownerName: "",
  mobile: "",
  street: "",
  area: "",
  city: "",
  gstNumber: "",
};

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

  // Shop selection
  const [availableShops, setAvailableShops] = useState<Shop[]>([]);
  const [loginToken, setLoginToken] = useState("");

  // Registration fields - multiple shops support
  const [shops, setShops] = useState<ShopForm[]>([{ ...emptyShopForm }]);
  const [regEmail, setRegEmail] = useState("");
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
          // If multiple shops, show shop selection
          if (data.data.shops && data.data.shops.length > 1) {
            setAvailableShops(data.data.shops);
            setLoginToken(data.data.token);
            setMode("selectShop");
          } else {
            // Single shop - proceed directly
            setShopAuth(data.data.shop, data.data.token, data.data.shops);
            // Check if password change is required
            if (data.data.shop.mustChangePassword) {
              router.push("/change-password");
            } else if (data.data.shop.status === "approved") {
              router.push("/shop");
            } else {
              router.push("/pending-approval");
            }
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

  const handleSelectShop = (selectedShop: Shop) => {
    setShopAuth(selectedShop, loginToken, availableShops);
    // Check if password change is required
    if (selectedShop.mustChangePassword) {
      router.push("/change-password");
    } else if (selectedShop.status === "approved") {
      router.push("/shop");
    } else {
      router.push("/pending-approval");
    }
  };

  const handleAddShop = () => {
    setShops([...shops, { ...emptyShopForm }]);
  };

  const handleRemoveShop = (index: number) => {
    if (shops.length > 1) {
      setShops(shops.filter((_, i) => i !== index));
    }
  };

  const handleShopChange = (index: number, field: keyof ShopForm, value: string) => {
    const updatedShops = [...shops];
    updatedShops[index] = { ...updatedShops[index], [field]: value };
    setShops(updatedShops);
  };

  const handleRegister = async () => {
    // Validate email and password
    if (!regEmail || !regPassword) {
      setError(t("auth.fillAllFields"));
      return;
    }

    // Validate all shops have required fields
    for (let i = 0; i < shops.length; i++) {
      const shop = shops[i];
      if (!shop.shopName || !shop.ownerName || !shop.mobile || !shop.street || !shop.area || !shop.city) {
        setError(`${t("auth.fillAllFields")} (Shop ${i + 1})`);
        return;
      }
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
      // Register all shops with the same email/password
      const registeredShops: Shop[] = [];

      for (const shopData of shops) {
        const response = await fetch("/api/auth/shop/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shopName: shopData.shopName,
            ownerName: shopData.ownerName,
            email: regEmail,
            mobile: shopData.mobile,
            password: regPassword,
            address: {
              street: shopData.street,
              area: shopData.area,
              city: shopData.city
            },
            gstNumber: shopData.gstNumber || undefined,
          }),
        });

        const data = await response.json();

        if (data.success) {
          registeredShops.push(data.data.shop);
        } else {
          setError(data.error || t("auth.registrationFailed"));
          return;
        }
      }

      // Set auth with first shop as selected, all shops in array
      if (registeredShops.length > 0) {
        // Get token from last registration response
        const lastResponse = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: regEmail, password: regPassword }),
        });
        const loginData = await lastResponse.json();

        if (loginData.success) {
          setShopAuth(registeredShops[0], loginData.data.token, registeredShops);
          router.push("/pending-approval");
        }
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
            ) : mode === "selectShop" ? (
              <div className="space-y-5">
                {/* Shop Selection Header */}
                <div className="text-center">
                  <h2 className="text-xl font-bold text-[var(--foreground)]">{t("shop.selectShop")}</h2>
                  <p className="text-[var(--muted-foreground)] text-sm mt-1">{t("shop.selectShopDesc")}</p>
                </div>

                {/* Shop List */}
                <div className="space-y-3">
                  {availableShops.map((shopItem) => (
                    <button
                      key={shopItem._id}
                      onClick={() => handleSelectShop(shopItem)}
                      className="w-full p-4 rounded-xl border-2 border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all text-left flex items-center gap-4"
                    >
                      <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Store className="w-6 h-6 text-[var(--primary)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[var(--foreground)] truncate">{shopItem.shopName}</h3>
                        <p className="text-sm text-[var(--muted-foreground)] truncate">{shopItem.address.area}, {shopItem.address.city}</p>
                        {shopItem.status === "pending" && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                            {t("orders.status.pending")}
                          </span>
                        )}
                      </div>
                      <ArrowRight className="w-5 h-5 text-[var(--muted-foreground)]" />
                    </button>
                  ))}
                </div>

                {/* Back to Login */}
                <div className="text-center pt-4 border-t border-[var(--border)]">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMode("login");
                      setAvailableShops([]);
                      setLoginToken("");
                    }}
                    className="w-full h-12"
                  >
                    {t("auth.backToLogin")}
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

                {/* Account Details - Same for all shops */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[var(--primary)] font-semibold text-sm">
                    <Mail className="w-4 h-4" />
                    <span>{t("shop.accountDetails")}</span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <Input
                      type="email"
                      label={t("auth.email")}
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder={t("auth.enterEmail")}
                      leftIcon={<Mail className="w-4 h-4" />}
                    />
                  </div>
                </div>

                {/* Shops */}
                {shops.map((shopData, index) => (
                  <div key={index} className="space-y-4 p-4 rounded-xl bg-[var(--muted)]/30 border border-[var(--border)]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[var(--primary)] font-semibold text-sm">
                        <Building2 className="w-4 h-4" />
                        <span>{t("shop.shopDetails")} {shops.length > 1 ? `#${index + 1}` : ""}</span>
                      </div>
                      {shops.length > 1 && (
                        <button
                          onClick={() => handleRemoveShop(index)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <Input
                      label={t("shop.shopName")}
                      value={shopData.shopName}
                      onChange={(e) => handleShopChange(index, "shopName", e.target.value)}
                      placeholder={t("shop.enterShopName")}
                    />

                    <Input
                      label={t("shop.ownerName")}
                      value={shopData.ownerName}
                      onChange={(e) => handleShopChange(index, "ownerName", e.target.value)}
                      placeholder={t("shop.enterOwnerName")}
                    />

                    <Input
                      type="tel"
                      label={t("auth.mobileNumber")}
                      value={shopData.mobile}
                      onChange={(e) => handleShopChange(index, "mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder={t("auth.enterMobile")}
                      leftIcon={<Phone className="w-4 h-4" />}
                    />

                    {/* Address */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[var(--muted-foreground)] font-medium text-xs">
                        <MapPin className="w-3 h-3" />
                        <span>{t("shop.address")}</span>
                      </div>

                      <Input
                        label={t("shop.street")}
                        value={shopData.street}
                        onChange={(e) => handleShopChange(index, "street", e.target.value)}
                        placeholder={t("shop.enterStreet")}
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          label={t("shop.area")}
                          value={shopData.area}
                          onChange={(e) => handleShopChange(index, "area", e.target.value)}
                          placeholder={t("shop.enterArea")}
                        />
                        <Input
                          label={t("shop.city")}
                          value={shopData.city}
                          onChange={(e) => handleShopChange(index, "city", e.target.value)}
                          placeholder={t("shop.enterCity")}
                        />
                      </div>

                      <Input
                        label={t("shop.gstOptional")}
                        value={shopData.gstNumber}
                        onChange={(e) => handleShopChange(index, "gstNumber", e.target.value)}
                        placeholder={t("shop.enterGst")}
                      />
                    </div>
                  </div>
                ))}

                {/* Add Another Shop Button */}
                <Button
                  variant="outline"
                  onClick={handleAddShop}
                  className="w-full h-12 border-dashed"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {t("shop.addAnotherShop")}
                </Button>

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
                      setShops([{ ...emptyShopForm }]);
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
