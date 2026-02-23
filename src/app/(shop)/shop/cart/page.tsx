"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, ShoppingCart, CheckCircle } from "lucide-react";
import ShopHeader from "@/components/shop/ShopHeader";
import { Card, CardContent, Button, Input } from "@/components/ui";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";

export default function CartPage() {
  const t = useTranslations();
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart, getTotal } =
    useCartStore();
  const { shop, token } = useAuthStore();

  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = getTotal();

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            product: item.product._id,
            quantity: item.quantity,
          })),
          notes: notes || undefined,
          deliveryAddress: shop?.address,
        }),
      });

      const data = await response.json();

      if (data.success) {
        clearCart();
        router.push(`/shop/orders/${data.data._id}?success=true`);
      } else {
        setError(data.error || "Failed to place order");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <ShopHeader title={t("cart.title")} />
        <main className="p-4 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-24 h-24 bg-[var(--muted)] rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-12 h-12 text-[var(--muted-foreground)]" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{t("cart.emptyCart")}</h2>
          <p className="text-[var(--muted-foreground)] mb-6 text-center">
            {t("cart.emptyCartSubtitle")}
          </p>
          <Button
            onClick={() => router.push("/shop/products")}
            className="h-14 px-8 text-lg"
            size="lg"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            {t("cart.continueShopping")}
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 hero-gradient text-white z-40 shadow-lg">
        <div className="flex items-center gap-4 px-4 py-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold">{t("cart.title")}</h1>
            <p className="text-white/80 text-sm">{items.length} {t("cart.itemsInCart")}</p>
          </div>
        </div>
      </header>

      <main className="p-4 pb-80">
        {/* Cart Items */}
        <div className="space-y-4">
          {items.map((item, index) => (
            <Card
              key={item.product._id}
              className="shadow-md animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-[var(--foreground)]">{item.product.name}</h3>
                    <p className="text-[var(--primary)] font-semibold mt-1">
                      ₹{item.product.rate} / {item.product.unitType}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.product._id)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-red-50 text-[var(--error)] hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border)]">
                  <div className="flex items-center gap-3 bg-[var(--muted)] rounded-xl p-1">
                    <button
                      onClick={() =>
                        updateQuantity(item.product._id, item.quantity - 1)
                      }
                      className="w-10 h-10 flex items-center justify-center rounded-lg bg-white shadow-sm hover:shadow transition-shadow"
                    >
                      <Minus className="w-5 h-5 text-[var(--primary)]" />
                    </button>
                    <span className="w-16 text-center font-bold text-lg">
                      {item.quantity} {item.product.unitType}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product._id, item.quantity + 1)
                      }
                      className="w-10 h-10 flex items-center justify-center rounded-lg bg-white shadow-sm hover:shadow transition-shadow"
                    >
                      <Plus className="w-5 h-5 text-[var(--primary)]" />
                    </button>
                  </div>
                  <span className="text-xl font-bold text-[var(--primary)]">
                    ₹{(item.product.rate * item.quantity).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Notes */}
        <Card className="mt-6 shadow-md">
          <CardContent className="p-4">
            <Input
              label={t("orders.notes")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("cart.orderNotesPlaceholder")}
            />
          </CardContent>
        </Card>

        {/* Delivery Address */}
        {shop?.address && (
          <Card className="mt-4 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-[var(--success)]" />
                <h4 className="font-bold">{t("orders.deliveryAddress")}</h4>
              </div>
              <p className="text-[var(--muted-foreground)] ml-7">
                {shop.address.street}, {shop.address.area}, {shop.address.city}
              </p>
            </CardContent>
          </Card>
        )}

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-center">
            {error}
          </div>
        )}
      </main>

      {/* Fixed Bottom - Big Order Button (above bottom nav) */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t-2 border-[var(--primary)] p-4 z-40 shadow-2xl">
        {/* Total */}
        <div className="flex items-center justify-between mb-4 px-2">
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">{t("cart.totalAmount")}</p>
            <p className="text-3xl font-bold text-[var(--primary)]">
              ₹{total.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-[var(--muted-foreground)]">{items.length} {t("cart.items")}</p>
          </div>
        </div>

        {/* Big Order Button */}
        <Button
          onClick={handlePlaceOrder}
          isLoading={loading}
          className="w-full h-16 text-xl font-bold rounded-2xl shadow-lg"
          size="lg"
        >
          <ShoppingBag className="w-6 h-6 mr-3" />
          {t("cart.placeOrder")}
        </Button>
      </div>
    </div>
  );
}
