import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Shop, Admin } from "@/types";

type UserType = "shop" | "admin" | null;

interface AuthState {
  userType: UserType;
  shop: Shop | null;
  shops: Shop[]; // All shops for this user
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;

  setShopAuth: (shop: Shop, token: string, allShops?: Shop[]) => void;
  setAdminAuth: (admin: Admin, token: string) => void;
  updateShop: (shop: Shop) => void;
  setShops: (shops: Shop[]) => void;
  switchShop: (shop: Shop) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userType: null,
      shop: null,
      shops: [],
      admin: null,
      token: null,
      isAuthenticated: false,

      setShopAuth: (shop: Shop, token: string, allShops?: Shop[]) => {
        set({
          userType: "shop",
          shop,
          shops: allShops || [shop],
          admin: null,
          token,
          isAuthenticated: true,
        });
      },

      setAdminAuth: (admin: Admin, token: string) => {
        set({
          userType: "admin",
          shop: null,
          shops: [],
          admin,
          token,
          isAuthenticated: true,
        });
      },

      updateShop: (shop: Shop) => {
        set((state) => ({
          shop,
          // Also update the shop in the shops array
          shops: state.shops.map((s) => (s._id === shop._id ? shop : s)),
        }));
      },

      setShops: (shops: Shop[]) => {
        set({ shops });
      },

      switchShop: (shop: Shop) => {
        set({ shop });
      },

      logout: () => {
        set({
          userType: null,
          shop: null,
          shops: [],
          admin: null,
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "lakshmi-auth",
    }
  )
);
