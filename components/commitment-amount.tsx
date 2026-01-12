import { View, Text, TextInput, Switch, Platform } from "react-native";
import { cn } from "@/lib/utils";

interface CommitmentAmountProps {
  enabled: boolean;
  amount: string;
  onEnabledChange: (enabled: boolean) => void;
  onAmountChange: (amount: string) => void;
  className?: string;
}

/**
 * CommitmentAmount - Financial commitment UI for errands requiring upfront money
 * 
 * Implements the blueprint requirement:
 * "For errands requiring an upfront purchase, the Customer MUST commit to 
 * the estimated cost during the booking process."
 * 
 * Design: Matches Figma patterns with teal primary color, rounded inputs
 * 
 * Usage:
 * ```tsx
 * <CommitmentAmount
 *   enabled={requiresMoney}
 *   amount={commitmentAmount}
 *   onEnabledChange={setRequiresMoney}
 *   onAmountChange={setCommitmentAmount}
 * />
 * ```
 */
export function CommitmentAmount({
  enabled,
  amount,
  onEnabledChange,
  onAmountChange,
  className,
}: CommitmentAmountProps) {
  return (
    <View className={cn("bg-surface rounded-2xl p-5 border border-border", className)}>
      {/* Toggle header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-4">
          <Text className="text-base font-semibold text-foreground mb-1">
            This errand requires money
          </Text>
          <Text className="text-sm text-muted leading-5">
            Enable if the tasker needs to make a purchase on your behalf
          </Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={onEnabledChange}
          trackColor={{ false: "#E5E7EB", true: "#00BFA6" }}
          thumbColor={Platform.OS === "ios" ? "#FFFFFF" : enabled ? "#FFFFFF" : "#f4f3f4"}
          ios_backgroundColor="#E5E7EB"
        />
      </View>

      {/* Commitment amount input (shown when enabled) */}
      {enabled && (
        <View className="mt-4 pt-4 border-t border-border">
          <Text className="text-sm font-semibold text-foreground mb-2">
            Commitment Amount
          </Text>
          <Text className="text-xs text-muted mb-4 leading-4">
            Enter the estimated cost of items to be purchased. This amount will be held and
            released to the tasker upon completion.
          </Text>
          
          {/* Amount input - Figma style */}
          <View className="flex-row items-center bg-background rounded-xl px-4 py-3.5 border border-border">
            <Text className="text-lg font-bold text-foreground mr-3">ZMW</Text>
            <TextInput
              value={amount}
              onChangeText={onAmountChange}
              placeholder="0.00"
              keyboardType="decimal-pad"
              className="flex-1 text-xl font-semibold text-foreground"
              placeholderTextColor="#9CA3AF"
              returnKeyType="done"
            />
          </View>

          {/* Info box - Teal accent */}
          <View className="mt-4 bg-primary/10 rounded-xl p-4 border border-primary/20">
            <View className="flex-row">
              <Text className="text-base mr-2">💡</Text>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-primary mb-1">Tip</Text>
                <Text className="text-xs text-foreground leading-4">
                  Add a small buffer (10-15%) to cover price variations. Any unused amount will be refunded.
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
