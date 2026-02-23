"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Search, ShoppingCart, Plus, Minus, Package, CheckCircle } from "lucide-react";
import ShopHeader from "@/components/shop/ShopHeader";
import { Card, CardContent, Input, Button, Badge } from "@/components/ui";
import { useCartStore } from "@/store/cart";
import { Product, ProductCategory } from "@/types";
import { cn } from "@/lib/utils/cn";

const categories: ProductCategory[] = [
  "mixture",
  "bhel",
  "chevda",
  "dhal",
  "chips",
  "murukku",
  "boondi",
  "papdi",
  "sabudana",
  "sweets",
  "biscuits",
  "others",
];

export default function ProductsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { items, addItem, updateQuantity, getTotal } = useCartStore();

  // Get product name based on current locale
  const getProductName = (product: Product) => {
    if (locale === "ta" && product.nameTamil) {
      return product.nameTamil;
    }
    return product.name;
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [addedProduct, setAddedProduct] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCartQuantity = (productId: string): number => {
    const item = items.find((i) => i.product._id === productId);
    return item?.quantity || 0;
  };

  const handleAddToCart = (product: Product) => {
    addItem(product, 1); // Always add 1 initially
    setAddedProduct(getProductName(product));
    setTimeout(() => setAddedProduct(null), 2000);
  };

  const handleUpdateQuantity = (productId: string, change: number) => {
    const currentQty = getCartQuantity(productId);
    const newQty = currentQty + change;
    if (newQty >= 0) {
      updateQuantity(productId, newQty);
    }
  };

  const filteredProducts = products.filter((product) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      search === "" ||
      product.name.toLowerCase().includes(searchLower) ||
      (product.nameTamil && product.nameTamil.includes(search));
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cartTotal = getTotal();
  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

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

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 hero-gradient text-white z-40 shadow-lg">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold mb-3">{t("products.title")}</h1>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder={t("common.search") + "..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-xl bg-white text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
      </header>

      {/* Added to Cart Toast */}
      {addedProduct && (
        <div className="fixed top-20 left-4 right-4 bg-green-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-slideUp z-50">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium truncate">{addedProduct} {t("products.addedToCart")}</span>
        </div>
      )}

      <main className="pb-40">
        {/* Categories */}
        <div className="sticky top-[116px] bg-[var(--background)] z-30 px-4 py-3 shadow-sm">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-semibold transition-all shadow-sm",
                selectedCategory === "all"
                  ? "bg-[var(--primary)] text-white shadow-md"
                  : "bg-white text-[var(--foreground)] hover:bg-[var(--muted)]"
              )}
            >
              {t("common.all")}
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-semibold transition-all shadow-sm",
                  selectedCategory === category
                    ? "bg-[var(--primary)] text-white shadow-md"
                    : "bg-white text-[var(--foreground)] hover:bg-[var(--muted)]"
                )}
              >
                {t(`products.categories.${category}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full mb-4" />
              <p className="text-[var(--muted-foreground)]">{t("common.loading")}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-[var(--muted)] rounded-full flex items-center justify-center mb-4">
                <Package className="w-10 h-10 text-[var(--muted-foreground)]" />
              </div>
              <p className="text-xl font-semibold text-[var(--foreground)] mb-2">{t("products.noProductsFound")}</p>
              <p className="text-[var(--muted-foreground)]">{t("products.tryDifferentSearch")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((product, index) => {
                const cartQty = getCartQuantity(product._id);
                const isInCart = cartQty > 0;

                return (
                  <Card
                    key={product._id}
                    className="product-card overflow-hidden shadow-md animate-fadeIn"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-bold text-lg text-[var(--foreground)] pr-2">
                              {getProductName(product)}
                            </h3>
                          </div>

                          <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-2xl font-bold text-[var(--primary)]">
                              ₹{product.rate}
                            </span>
                            <span className="text-sm text-[var(--muted-foreground)]">
                              / {getUnitLabel(product.unitType)}
                            </span>
                          </div>

                          <Badge
                            variant="default"
                            className="bg-[var(--accent-light)] text-[var(--foreground)] font-medium"
                          >
                            {t(`products.categories.${product.category}`)}
                          </Badge>
                        </div>

                        {/* Add to Cart Controls */}
                        <div className="flex-shrink-0">
                          {isInCart ? (
                            <div className="flex flex-col items-center gap-2 bg-[var(--primary)] rounded-xl p-2">
                              <button
                                onClick={() => handleUpdateQuantity(product._id, 1)}
                                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                              >
                                <Plus className="w-5 h-5" />
                              </button>
                              <span className="text-white font-bold text-lg min-w-[2ch] text-center">
                                {cartQty}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(product._id, -1)}
                                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                              >
                                <Minus className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="w-14 h-14 flex items-center justify-center rounded-xl bg-[var(--primary)] text-white shadow-md hover:shadow-lg transition-all active:scale-95"
                            >
                              <Plus className="w-7 h-7" />
                            </button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Floating Cart Button */}
      {items.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 p-4 z-40">
          <Button
            onClick={() => router.push("/shop/cart")}
            className="w-full h-16 shadow-xl rounded-2xl text-lg"
            size="lg"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm opacity-80">{items.length} {t("products.items")}</p>
                  <p className="font-bold">{t("cart.viewCart")}</p>
                </div>
              </div>
              <span className="text-xl font-bold">₹{cartTotal.toLocaleString()}</span>
            </div>
          </Button>
        </div>
      )}
    </div>
  );
}
