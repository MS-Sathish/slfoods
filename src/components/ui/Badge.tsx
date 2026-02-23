"use client";

import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";
import { OrderStatus } from "@/types";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info" | "status";
  status?: OrderStatus;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", status, children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

    const variants = {
      default: "bg-[var(--muted)] text-[var(--muted-foreground)]",
      success: "bg-green-100 text-green-800",
      warning: "bg-yellow-100 text-yellow-800",
      error: "bg-red-100 text-red-800",
      info: "bg-blue-100 text-blue-800",
      status: "", // Will be set based on status prop
    };

    const statusStyles: Record<OrderStatus, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      packed: "bg-purple-100 text-purple-800",
      out_for_delivery: "bg-orange-100 text-orange-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };

    const variantClass =
      variant === "status" && status
        ? statusStyles[status]
        : variants[variant];

    return (
      <span
        ref={ref}
        className={cn(baseStyles, variantClass, className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export default Badge;
