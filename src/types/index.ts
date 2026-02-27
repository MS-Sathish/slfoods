// User Types
export type UserRole = "shop_owner" | "admin" | "staff";

export type ShopStatus = "pending" | "approved" | "blocked";

export interface Shop {
  _id: string;
  shopName: string;
  ownerName: string;
  email: string;
  mobile: string;
  address: {
    street: string;
    area: string;
    city: string;
  };
  gstNumber?: string;
  status: ShopStatus;
  creditLimit?: number;
  pendingBalance?: number;
  mustChangePassword?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Admin {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  role: "owner" | "staff";
  createdAt: Date;
}

// Product Types
export type ProductCategory =
  | "mixture"
  | "bhel"
  | "chevda"
  | "dhal"
  | "chips"
  | "murukku"
  | "boondi"
  | "papdi"
  | "sabudana"
  | "sweets"
  | "biscuits"
  | "others";

export type UnitType = "kg" | "packet" | "box";

export interface Product {
  _id: string;
  name: string;
  nameTamil?: string;
  category: ProductCategory;
  rate: number;
  unitType: UnitType;
  defaultQuantity: number;
  isActive: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Order Types
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  product: Product;
  quantity: number;
  rate: number;
  total: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  shop: Shop;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  notes?: string;
  preferredDeliveryDate?: Date;
  deliveryAddress: {
    street: string;
    area: string;
    city: string;
  };
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  packedAt?: Date;
  outForDeliveryAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
}

// Payment Types
export type PaymentMode = "cash" | "upi" | "bank" | "bank_transfer" | "credit";

export interface Payment {
  _id: string;
  shop: Shop;
  amount: number;
  mode: PaymentMode;
  reference?: string;
  notes?: string;
  receivedBy: Admin;
  createdAt: Date;
}

// Ledger Entry
export type LedgerEntryType = "order" | "payment";

export interface LedgerEntry {
  _id: string;
  shop: Shop;
  type: LedgerEntryType;
  order?: Order;
  payment?: Payment;
  amount: number;
  runningBalance: number;
  createdAt: Date;
}

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Dashboard Stats
export interface ShopDashboardStats {
  pendingBalance: number;
  lastOrderStatus?: OrderStatus;
  lastOrderDate?: Date;
  totalOrders: number;
}

export interface AdminDashboardStats {
  totalSalesThisMonth: number;
  totalOrdersThisMonth: number;
  totalPaymentsThisMonth: number;
  pendingBalance: number;
  pendingOrders: number;
  activeShops: number;
}
