import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Shop, Admin } from "@/types";

type UserType = "shop" | "admin" | null;

interface AuthState {
  userType: UserType;
  shop: Shop | null;
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;

  setShopAuth: (shop: Shop, token: string) => void;
  setAdminAuth: (admin: Admin, token: string) => void;
  updateShop: (shop: Shop) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userType: null,
      shop: null,
      admin: null,
      token: null,
      isAuthenticated: false,

      setShopAuth: (shop: Shop, token: string) => {
        set({
          userType: "shop",
          shop,
          admin: null,
          token,
          isAuthenticated: true,
        });
      },

      setAdminAuth: (admin: Admin, token: string) => {
        set({
          userType: "admin",
          shop: null,
          admin,
          token,
          isAuthenticated: true,
        });
      },

      updateShop: (shop: Shop) => {
        set({ shop });
      },

      logout: () => {
        set({
          userType: null,
          shop: null,
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
