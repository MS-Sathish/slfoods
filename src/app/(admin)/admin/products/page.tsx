"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Plus, Edit2, ToggleLeft, ToggleRight, X, Save } from "lucide-react";
import { Card, CardContent, Input, Badge, Button } from "@/components/ui";
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

export default function AdminProductsPage() {
  const t = useTranslations("admin");
  const tProducts = useTranslations("products");
  const tCommon = useTranslations("common");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editRate, setEditRate] = useState("");
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  // Add product modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newNameTamil, setNewNameTamil] = useState("");
  const [newRate, setNewRate] = useState("");
  const [newCategory, setNewCategory] = useState<ProductCategory>("mixture");
  const [newUnitType, setNewUnitType] = useState<"kg" | "packet" | "box">("kg");
  const [newDefaultQty, setNewDefaultQty] = useState("1");
  const [editNameTamil, setEditNameTamil] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products?active=all");
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

  const toggleProductStatus = async (productId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });

      const data = await response.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p._id === productId ? { ...p, isActive } : p))
        );
      }
    } catch (error) {
      console.error("Failed to update product:", error);
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setEditRate(product.rate.toString());
    setEditName(product.name);
    setEditNameTamil(product.nameTamil || "");
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingProduct(null);
    setEditRate("");
    setEditName("");
    setEditNameTamil("");
  };

  const saveProduct = async () => {
    if (!editingProduct) return;

    const rate = parseFloat(editRate);
    if (isNaN(rate) || rate <= 0) {
      alert("Please enter a valid price");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/products/${editingProduct._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          nameTamil: editNameTamil,
          rate: rate
        }),
      });

      const data = await response.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p._id === editingProduct._id
              ? { ...p, name: editName, nameTamil: editNameTamil, rate: rate }
              : p
          )
        );
        closeEditModal();
      } else {
        alert("Failed to update product");
      }
    } catch (error) {
      console.error("Failed to update product:", error);
      alert("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  const resetAddModal = () => {
    setNewName("");
    setNewNameTamil("");
    setNewRate("");
    setNewCategory("mixture");
    setNewUnitType("kg");
    setNewDefaultQty("1");
    setShowAddModal(false);
  };

  const createProduct = async () => {
    if (!newName || !newRate) {
      alert("Please fill in all required fields");
      return;
    }

    const rate = parseFloat(newRate);
    if (isNaN(rate) || rate <= 0) {
      alert("Please enter a valid price");
      return;
    }

    const defaultQty = parseFloat(newDefaultQty);
    if (isNaN(defaultQty) || defaultQty <= 0) {
      alert("Please enter a valid default quantity");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          nameTamil: newNameTamil,
          rate: rate,
          category: newCategory,
          unitType: newUnitType,
          defaultQuantity: defaultQty,
          isActive: true,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setProducts((prev) => [...prev, data.data]);
        resetAddModal();
      } else {
        alert(data.error || "Failed to create product");
      }
    } catch (error) {
      console.error("Failed to create product:", error);
      alert("Failed to create product");
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      search === "" ||
      product.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const productsByCategory = categories.reduce((acc, category) => {
    acc[category] = filteredProducts.filter((p) => p.category === category);
    return acc;
  }, {} as Record<ProductCategory, Product[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("products")}</h1>
        <div className="flex items-center gap-4">
          <p className="text-gray-500">{products.length} {t("items")}</p>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t("addProduct")}
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder={t("searchProducts")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-5 h-5" />}
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        >
          <option value="all">{t("allCategories")}</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {tProducts(`categories.${cat}`)}
            </option>
          ))}
        </select>
      </div>

      {/* Products List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-6">
          {selectedCategory === "all" ? (
            // Grouped by category
            categories.map((category) => {
              const categoryProducts = productsByCategory[category];
              if (categoryProducts.length === 0) return null;

              return (
                <Card key={category}>
                  <CardContent className="p-4">
                    <h2 className="font-semibold text-lg mb-4 flex items-center justify-between">
                      <span>
                        {tProducts(`categories.${category}`)}
                      </span>
                      <Badge variant="default">
                        {categoryProducts.length} {t("items")}
                      </Badge>
                    </h2>
                    <div className="divide-y divide-gray-100">
                      {categoryProducts.map((product) => (
                        <ProductRow
                          key={product._id}
                          product={product}
                          onToggle={toggleProductStatus}
                          onEdit={openEditModal}
                          inactiveLabel={t("inactive")}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            // Single category
            <Card>
              <CardContent className="p-4">
                <div className="divide-y divide-gray-100">
                  {filteredProducts.map((product) => (
                    <ProductRow
                      key={product._id}
                      product={product}
                      onToggle={toggleProductStatus}
                      onEdit={openEditModal}
                      inactiveLabel={t("inactive")}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl animate-slideUp">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">{t("editProduct")}</h2>
              <button
                onClick={closeEditModal}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("productName")} (English)
                </label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder={t("productName")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("productNameTamil")} (தமிழ்)
                </label>
                <Input
                  value={editNameTamil}
                  onChange={(e) => setEditNameTamil(e.target.value)}
                  placeholder="தமிழில் பெயர்"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("price")} (₹ / {editingProduct.unitType})
                </label>
                <Input
                  type="number"
                  value={editRate}
                  onChange={(e) => setEditRate(e.target.value)}
                  placeholder={t("price")}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>{t("category")}:</strong> {tProducts(`categories.${editingProduct.category}`)}
                </p>
                <p className="text-sm text-amber-800 mt-1">
                  <strong>{t("unitType")}:</strong> {editingProduct.unitType}
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-4 border-t bg-gray-50 rounded-b-2xl">
              <Button
                variant="outline"
                onClick={closeEditModal}
                className="flex-1"
              >
                {tCommon("cancel")}
              </Button>
              <Button
                onClick={saveProduct}
                isLoading={saving}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                {t("saveChanges")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl animate-slideUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">{t("addNewProduct")}</h2>
              <button
                onClick={resetAddModal}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("productName")} (English) *
                </label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Product name in English"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("productNameTamil")} (தமிழ்)
                </label>
                <Input
                  value={newNameTamil}
                  onChange={(e) => setNewNameTamil(e.target.value)}
                  placeholder="தமிழில் பெயர்"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("category")} *
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as ProductCategory)}
                  className="w-full px-4 py-2 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {tProducts(`categories.${cat}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("unitType")} *
                </label>
                <select
                  value={newUnitType}
                  onChange={(e) => setNewUnitType(e.target.value as "kg" | "packet" | "box")}
                  className="w-full px-4 py-2 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="kg">{t("kilogram")}</option>
                  <option value="packet">{t("packet")}</option>
                  <option value="box">{t("box")}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("price")} (₹ / {newUnitType}) *
                </label>
                <Input
                  type="number"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  placeholder={t("price")}
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("defaultQuantity")}
                </label>
                <Input
                  type="number"
                  value={newDefaultQty}
                  onChange={(e) => setNewDefaultQty(e.target.value)}
                  placeholder={t("defaultQuantity")}
                  min="0.1"
                  step="0.1"
                />
              </div>
            </div>

            <div className="flex gap-3 p-4 border-t bg-gray-50 rounded-b-2xl">
              <Button
                variant="outline"
                onClick={resetAddModal}
                className="flex-1"
              >
                {tCommon("cancel")}
              </Button>
              <Button
                onClick={createProduct}
                isLoading={saving}
                className="flex-1"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t("addProduct")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductRow({
  product,
  onToggle,
  onEdit,
  inactiveLabel,
}: {
  product: Product;
  onToggle: (id: string, isActive: boolean) => void;
  onEdit: (product: Product) => void;
  inactiveLabel: string;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={cn("font-medium", !product.isActive && "text-gray-400")}>
            {product.name}
          </span>
          {!product.isActive && (
            <Badge className="bg-gray-100 text-gray-600">{inactiveLabel}</Badge>
          )}
        </div>
        <p className="text-sm text-gray-500">
          ₹{product.rate} / {product.unitType}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(product)}
          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
          title="Edit product"
        >
          <Edit2 className="w-5 h-5" />
        </button>
        <button
          onClick={() => onToggle(product._id, !product.isActive)}
          className={cn(
            "p-2 rounded-lg transition-colors",
            product.isActive
              ? "text-green-600 hover:bg-green-50"
              : "text-gray-400 hover:bg-gray-50"
          )}
          title={product.isActive ? "Disable" : "Enable"}
        >
          {product.isActive ? (
            <ToggleRight className="w-6 h-6" />
          ) : (
            <ToggleLeft className="w-6 h-6" />
          )}
        </button>
      </div>
    </div>
  );
}
