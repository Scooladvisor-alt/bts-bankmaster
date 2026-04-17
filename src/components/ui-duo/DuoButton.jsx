import React from "react";
import { cn } from "@/lib/utils";

export default function DuoButton({
  children,
  onClick,
  className = "",
  variant = "primary",
  disabled = false,
  type = "button",
  ...rest
}) {
  const variants = {
    primary: "bg-primary text-primary-foreground border-b-green-700",
    secondary: "bg-secondary text-secondary-foreground border-b-yellow-600",
    accent: "bg-accent text-accent-foreground border-b-blue-700",
    voges: "bg-voges text-white border-b-purple-900",
    cesbf: "bg-cesbf text-white border-b-orange-800",
    ghost: "bg-white text-foreground border-b-stone-300 border border-stone-200",
    danger: "bg-destructive text-destructive-foreground border-b-red-800",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "font-display font-bold uppercase tracking-wide rounded-2xl px-6 py-3 border-b-4 transition-all duration-100 active:border-b-0 active:translate-y-[3px] disabled:opacity-50 disabled:cursor-not-allowed select-none",
        variants[variant],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}