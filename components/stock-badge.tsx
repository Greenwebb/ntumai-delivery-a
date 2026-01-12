import { View, Text } from "react-native";
import { cn } from "@/lib/utils";

interface StockBadgeProps {
  inStock: boolean;
  variant?: "default" | "compact" | "pill";
  className?: string;
}

/**
 * StockBadge - Visual indicator for product stock status
 * 
 * Implements the blueprint requirement:
 * "The UI will only show items marked as 'In Stock' by the vendor"
 * 
 * Design: Matches Figma patterns with success/error colors
 * 
 * Usage:
 * ```tsx
 * <StockBadge inStock={product.inStock} />
 * <StockBadge inStock={false} variant="compact" />
 * <StockBadge inStock={true} variant="pill" />
 * ```
 */
export function StockBadge({ inStock, variant = "default", className }: StockBadgeProps) {
  // Compact variant - small pill
  if (variant === "compact") {
    return (
      <View
        className={cn(
          "rounded-full px-2.5 py-1",
          inStock ? "bg-success/15" : "bg-error/15",
          className
        )}
      >
        <Text
          className={cn(
            "text-xs font-semibold",
            inStock ? "text-success" : "text-error"
          )}
        >
          {inStock ? "In Stock" : "Out of Stock"}
        </Text>
      </View>
    );
  }

  // Pill variant - just the dot and text inline
  if (variant === "pill") {
    return (
      <View className={cn("flex-row items-center", className)}>
        <View
          className={cn(
            "w-2 h-2 rounded-full mr-1.5",
            inStock ? "bg-success" : "bg-error"
          )}
        />
        <Text
          className={cn(
            "text-xs font-medium",
            inStock ? "text-success" : "text-error"
          )}
        >
          {inStock ? "In Stock" : "Out of Stock"}
        </Text>
      </View>
    );
  }

  // Default variant - card style
  return (
    <View
      className={cn(
        "rounded-xl px-4 py-2.5 flex-row items-center",
        inStock 
          ? "bg-success/10 border border-success/20" 
          : "bg-error/10 border border-error/20",
        className
      )}
    >
      <View
        className={cn(
          "w-2.5 h-2.5 rounded-full mr-2.5",
          inStock ? "bg-success" : "bg-error"
        )}
      />
      <Text
        className={cn(
          "text-sm font-semibold",
          inStock ? "text-success" : "text-error"
        )}
      >
        {inStock ? "In Stock" : "Out of Stock"}
      </Text>
    </View>
  );
}
