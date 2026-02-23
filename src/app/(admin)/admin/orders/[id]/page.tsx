"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  IndianRupee,
  X,
  CreditCard,
  Banknote,
  Smartphone,
} from "lucide-react";
import { Card, CardContent, Button, Badge, Input } from "@/components/ui";
import { useAuthStore } from "@/store/auth";
import { OrderStatus } from "@/types";
import { cn } from "@/lib/utils/cn";

interface OrderItem {
  productName: string;
  quantity: number;
  rate: number;
  unitType: string;
  total: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  shop: {
    _id: string;
    shopName: string;
    ownerName: string;
    mobile: string;
    address: {
      street: string;
      area: string;
      city: string;
    };
  };
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  notes?: string;
  deliveryAddress: {
    street: string;
    area: string;
    city: string;
  };
  createdAt: string;
  confirmedAt?: string;
  packedAt?: string;
  outForDeliveryAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
}

const statusFlow: OrderStatus[] = [
  "pending",
  "confirmed",
  "packed",
  "out_for_delivery",
  "delivered",
];

type PaymentMode = "cash" | "upi" | "bank_transfer" | "credit";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const token = useAuthStore((state) => state.token);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("cash");
  const [collectPayment, setCollectPayment] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setOrder(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: OrderStatus) => {
    // If marking as delivered, show payment modal first
    if (newStatus === "delivered") {
      setPaymentAmount(order?.totalAmount.toString() || "");
      setPaymentMode("cash");
      setCollectPayment(true);
      setShowPaymentModal(true);
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(`/api/orders/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        setOrder(data.data);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeliveryWithPayment = async () => {
    if (!order) return;

    const shopId = order.shop?._id || (order.shop as unknown as string);

    if (!shopId) {
      alert("Shop information is missing. Cannot process delivery.");
      return;
    }

    setUpdating(true);
    try {
      // First update order status to delivered
      const orderResponse = await fetch(`/api/orders/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "delivered" }),
      });

      const orderData = await orderResponse.json();
      if (!orderData.success) {
        alert("Failed to mark order as delivered: " + (orderData.error || "Unknown error"));
        return;
      }

      setOrder(orderData.data);

      // If payment collected, record it
      if (collectPayment && paymentAmount && parseFloat(paymentAmount) > 0) {
        const paymentResponse = await fetch("/api/admin/payments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            shopId: shopId,
            amount: parseFloat(paymentAmount),
            mode: paymentMode,
            notes: `Payment for order #${order.orderNumber}`,
          }),
        });

        const paymentData = await paymentResponse.json();
        if (!paymentData.success) {
          alert("Order marked as delivered, but payment recording failed: " + (paymentData.error || "Unknown error"));
        }
      }

      setShowPaymentModal(false);
    } catch (error) {
      console.error("Failed to update:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors: Record<OrderStatus, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      packed: "bg-purple-100 text-purple-800",
      out_for_delivery: "bg-orange-100 text-orange-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status];
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === statusFlow.length - 1)
      return null;
    return statusFlow[currentIndex + 1];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Order not found</p>
      </div>
    );
  }

  const nextStatus = getNextStatus(order.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">#{order.orderNumber}</h1>
          <p className="text-gray-500">{formatDate(order.createdAt)}</p>
        </div>
        <Badge className={cn("ml-auto", getStatusColor(order.status))}>
          {order.status.replace("_", " ").toUpperCase()}
        </Badge>
      </div>

      {/* Actions */}
      {order.status !== "delivered" && order.status !== "cancelled" && (
        <Card className="bg-blue-50 border border-blue-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-800">Update Order Status</p>
              <p className="text-sm text-blue-600">
                {nextStatus
                  ? `Move to: ${nextStatus.replace("_", " ")}`
                  : "Order completed"}
              </p>
            </div>
            <div className="flex gap-2">
              {nextStatus && (
                <Button
                  onClick={() => updateStatus(nextStatus)}
                  isLoading={updating}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as {nextStatus.replace("_", " ")}
                </Button>
              )}
              <Button
                variant="danger"
                onClick={() => updateStatus("cancelled")}
                isLoading={updating}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shop Details */}
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-[var(--primary)]" />
              Shop Details
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Shop Name</p>
                <p className="font-medium">{order.shop?.shopName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Owner</p>
                <p className="font-medium">{order.shop?.ownerName}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <a
                  href={`tel:${order.shop?.mobile}`}
                  className="text-[var(--primary)] font-medium"
                >
                  {order.shop?.mobile}
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Address */}
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[var(--primary)]" />
              Delivery Address
            </h2>
            <p className="text-gray-600">
              {order.deliveryAddress.street}, {order.deliveryAddress.area},{" "}
              {order.deliveryAddress.city}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardContent className="p-4">
          <h2 className="font-semibold mb-4">Order Items</h2>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-gray-500">
                    {item.quantity} {item.unitType} × ₹{item.rate}
                  </p>
                </div>
                <span className="font-semibold">
                  ₹{item.total.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-4 mt-4 border-t-2 border-[var(--primary)]">
            <span className="text-lg font-bold">Total</span>
            <span className="text-xl font-bold text-[var(--primary)]">
              ₹{order.totalAmount.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardContent className="p-4">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[var(--primary)]" />
            Order Timeline
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium">Order Placed</p>
                <p className="text-sm text-gray-500">
                  {formatDate(order.createdAt)}
                </p>
              </div>
            </div>

            {order.confirmedAt && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium">Confirmed</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(order.confirmedAt)}
                  </p>
                </div>
              </div>
            )}

            {order.packedAt && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium">Packed</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(order.packedAt)}
                  </p>
                </div>
              </div>
            )}

            {order.outForDeliveryAt && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <Truck className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium">Out for Delivery</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(order.outForDeliveryAt)}
                  </p>
                </div>
              </div>
            )}

            {order.deliveredAt && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium">Delivered</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(order.deliveredAt)}
                  </p>
                </div>
              </div>
            )}

            {order.cancelledAt && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium">Cancelled</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(order.cancelledAt)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {order.notes && (
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold mb-2">Notes</h2>
            <p className="text-gray-600">{order.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Payment Collection Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl animate-slideUp">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-[var(--primary)]" />
                <h2 className="text-lg font-bold">Payment Collection</h2>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Order Summary */}
              <div className="bg-[var(--muted)] rounded-xl p-4">
                <p className="text-sm text-[var(--muted-foreground)]">Order #{order.orderNumber}</p>
                <p className="text-2xl font-bold text-[var(--primary)]">
                  ₹{order.totalAmount.toLocaleString()}
                </p>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  {order.shop.shopName}
                </p>
              </div>

              {/* Payment Option Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Payment Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setCollectPayment(true)}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all text-left",
                      collectPayment
                        ? "border-[var(--primary)] bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Banknote className={cn("w-5 h-5", collectPayment ? "text-[var(--primary)]" : "text-gray-400")} />
                      <span className={cn("font-semibold", collectPayment ? "text-[var(--primary)]" : "text-gray-600")}>
                        Paid
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Collect payment now</p>
                  </button>
                  <button
                    onClick={() => setCollectPayment(false)}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all text-left",
                      !collectPayment
                        ? "border-amber-500 bg-amber-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className={cn("w-5 h-5", !collectPayment ? "text-amber-600" : "text-gray-400")} />
                      <span className={cn("font-semibold", !collectPayment ? "text-amber-600" : "text-gray-600")}>
                        Credit
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Add to pending balance</p>
                  </button>
                </div>
              </div>

              {collectPayment && (
                <>
                  {/* Payment Amount */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Payment Amount (₹)
                    </label>
                    <Input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Enter amount"
                    />
                    {parseFloat(paymentAmount) < order.totalAmount && paymentAmount && (
                      <p className="text-sm text-amber-600 mt-1">
                        Partial payment: ₹{(order.totalAmount - parseFloat(paymentAmount)).toLocaleString()} will remain pending
                      </p>
                    )}
                  </div>

                  {/* Payment Mode */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Payment Mode
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMode("cash")}
                        className={cn(
                          "flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all font-medium",
                          paymentMode === "cash"
                            ? "border-[var(--primary)] bg-green-50 text-[var(--primary)]"
                            : "border-gray-200 bg-white hover:border-gray-300 text-gray-600"
                        )}
                      >
                        <Banknote className="w-5 h-5" />
                        <span>Cash</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMode("upi")}
                        className={cn(
                          "flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all font-medium",
                          paymentMode === "upi"
                            ? "border-[var(--primary)] bg-green-50 text-[var(--primary)]"
                            : "border-gray-200 bg-white hover:border-gray-300 text-gray-600"
                        )}
                      >
                        <Smartphone className="w-5 h-5" />
                        <span>UPI</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMode("bank_transfer")}
                        className={cn(
                          "flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all font-medium",
                          paymentMode === "bank_transfer"
                            ? "border-[var(--primary)] bg-green-50 text-[var(--primary)]"
                            : "border-gray-200 bg-white hover:border-gray-300 text-gray-600"
                        )}
                      >
                        <CreditCard className="w-5 h-5" />
                        <span>Bank</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMode("credit")}
                        className={cn(
                          "flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all font-medium",
                          paymentMode === "credit"
                            ? "border-[var(--primary)] bg-green-50 text-[var(--primary)]"
                            : "border-gray-200 bg-white hover:border-gray-300 text-gray-600"
                        )}
                      >
                        <Clock className="w-5 h-5" />
                        <span>Credit</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {!collectPayment && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-amber-800 text-sm">
                    Order amount of ₹{order.totalAmount.toLocaleString()} will be added to shop's pending balance.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 p-4 border-t bg-gray-50 rounded-b-2xl">
              <Button
                variant="outline"
                onClick={() => setShowPaymentModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeliveryWithPayment}
                isLoading={updating}
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark Delivered
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
