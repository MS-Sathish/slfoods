"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Plus,
  Minus,
  ShoppingCart,
  Package,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, Button, Badge } from "@/components/ui";
import { useCartStore } from "@/store/cart";
import { Product } from "@/types";

export default function ProductDetailPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const { items, addItem, updateQuantity, getTotal } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showAdded, setShowAdded] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`);
      const data = await response.json();
      if (data.success) {
        setProduct(data.data);
        setQuantity(data.data.defaultQuantity || 1);
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCartQuantity = (): number => {
    if (!product) return 0;
    const item = items.find((i) => i.product._id === product._id);
    return item?.quantity || 0;
  };

  const cartQty = getCartQuantity();
  const isInCart = cartQty > 0;
  const cartTotal = getTotal();

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    setShowAdded(true);
    setTimeout(() => setShowAdded(false), 2000);
  };

  const handleUpdateQuantity = (change: number) => {
    if (!product) return;
    const newQty = cartQty + change;
    if (newQty >= 0) {
      updateQuantity(product._id, newQty);
    }
  };

  const getUnitLabel = (unitType: string) => {
    switch (unitType) {
      case "kg":
        return t("products.perKg");
      case "packet":
        return t("products.perPacket");
      case "box":
        return t("products.perBox");
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-[var(--muted-foreground)]">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-[var(--muted-foreground)] mx-auto mb-4" />
          <p className="text-xl font-semibold">Product not found</p>
          <Button onClick={() => router.back()} className="mt-4">
            {t("common.back")}
          </Button>
        </div>
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
          <h1 className="text-xl font-bold">{t("products.productDetails")}</h1>
        </div>
      </header>

      <main className="p-4 pb-48">
        {/* Product Card */}
        <Card className="shadow-xl overflow-hidden animate-slideUp">
          {/* Product Image Placeholder */}
          <div className="h-48 bg-gradient-to-br from-[var(--accent-light)] to-[var(--accent)] flex items-center justify-center">
            <Package className="w-24 h-24 text-[var(--primary)] opacity-50" />
          </div>

          <CardContent className="p-6">
            {/* Category Badge */}
            <Badge
              variant="default"
              className="bg-[var(--accent-light)] text-[var(--foreground)] font-semibold mb-3"
            >
              {t(`products.categories.${product.category}`)}
            </Badge>

            {/* Product Name */}
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
              {product.name}
            </h2>

            {/* Tamil Name if available */}
            {product.nameTamil && (
              <p className="text-lg text-[var(--muted-foreground)] mb-4">
                {product.nameTamil}
              </p>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold text-[var(--primary)]">
                ₹{product.rate}
              </span>
              <span className="text-lg text-[var(--muted-foreground)]">
                / {getUnitLabel(product.unitType)}
              </span>
            </div>

            {/* Quantity Selector (for adding new items) */}
            {!isInCart && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-[var(--muted-foreground)] mb-3">
                  {t("products.selectQuantity")}
                </p>
                <div className="flex items-center gap-4 bg-[var(--muted)] rounded-2xl p-2 w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-white shadow-sm hover:shadow transition-shadow"
                  >
                    <Minus className="w-6 h-6 text-[var(--primary)]" />
                  </button>
                  <span className="w-16 text-center font-bold text-2xl">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-white shadow-sm hover:shadow transition-shadow"
                  >
                    <Plus className="w-6 h-6 text-[var(--primary)]" />
                  </button>
                </div>
                <p className="text-sm text-[var(--muted-foreground)] mt-2">
                  Total: ₹{(product.rate * quantity).toLocaleString()}
                </p>
              </div>
            )}

            {/* In Cart Controls */}
            {isInCart && (
              <div className="mb-6 p-4 bg-green-50 rounded-2xl border border-green-200">
                <div className="flex items-center gap-2 text-[var(--success)] mb-3">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">In your cart</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 bg-[var(--primary)] rounded-xl p-2">
                    <button
                      onClick={() => handleUpdateQuantity(-1)}
                      className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="text-white font-bold text-xl min-w-[3ch] text-center">
                      {cartQty}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(1)}
                      className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <span className="text-xl font-bold text-[var(--primary)]">
                    ₹{(product.rate * cartQty).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Success Message */}
        {showAdded && (
          <div className="fixed top-24 left-4 right-4 bg-[var(--success)] text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 animate-slideUp z-50">
            <CheckCircle className="w-6 h-6" />
            <span className="font-semibold">{t("products.addedToCart")}</span>
          </div>
        )}
      </main>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[var(--primary)] p-4 z-40 shadow-2xl safe-bottom">
        {isInCart ? (
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/shop/products")}
              className="flex-1 h-14 text-lg font-semibold rounded-xl"
            >
              {t("products.continueShopping")}
            </Button>
            <Button
              onClick={() => router.push("/shop/cart")}
              className="flex-1 h-14 text-lg font-semibold rounded-xl"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {t("products.goToCart")}
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleAddToCart}
            className="w-full h-16 text-xl font-bold rounded-2xl shadow-lg"
            size="lg"
          >
            <ShoppingCart className="w-6 h-6 mr-3" />
            {t("products.addToCart")} - ₹{(product.rate * quantity).toLocaleString()}
          </Button>
        )}
      </div>

      {/* Floating Cart Badge */}
      {items.length > 0 && !isInCart && (
        <button
          onClick={() => router.push("/shop/cart")}
          className="fab"
        >
          <ShoppingCart className="w-7 h-7" />
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-[var(--secondary)] text-white text-sm font-bold rounded-full flex items-center justify-center">
            {items.length}
          </span>
        </button>
      )}
    </div>
  );
}
