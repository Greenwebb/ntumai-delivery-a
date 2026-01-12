import { View, Text, TouchableOpacity, Share, Alert, Linking, Platform } from "react-native";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ShareTrackingLinkProps {
  deliveryId: string;
  recipientPhone?: string;
  className?: string;
}

/**
 * ShareTrackingLink - Share tracking link with non-users
 * 
 * Implements the blueprint requirement:
 * "After booking, the user is presented with a 'Share Tracking Link' button
 * to send to the recipient via SMS, WhatsApp, etc."
 * 
 * Design: Matches Figma patterns with teal primary, success states
 * 
 * Usage:
 * ```tsx
 * <ShareTrackingLink 
 *   deliveryId="DEL123456" 
 *   recipientPhone="+260971234567"
 * />
 * ```
 */
export function ShareTrackingLink({
  deliveryId,
  recipientPhone,
  className,
}: ShareTrackingLinkProps) {
  const [isSharing, setIsSharing] = useState(false);

  // Generate tracking link (this would be a real URL in production)
  const trackingLink = `https://track.ntumai.com/${deliveryId}`;
  const trackingMessage = `Track your Ntumai delivery: ${trackingLink}`;

  const handleShareViaWhatsApp = async () => {
    try {
      setIsSharing(true);
      
      // Format phone number for WhatsApp (remove + and spaces)
      const formattedPhone = recipientPhone?.replace(/[\s+]/g, "") || "";
      
      // WhatsApp deep link
      const whatsappUrl = `whatsapp://send?phone=${formattedPhone}&text=${encodeURIComponent(trackingMessage)}`;
      
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        Alert.alert(
          "WhatsApp Not Available",
          "WhatsApp is not installed on this device. Please use another sharing method.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error sharing via WhatsApp:", error);
      Alert.alert("Error", "Failed to open WhatsApp. Please try another method.");
    } finally {
      setIsSharing(false);
    }
  };

  const handleShareViaSMS = async () => {
    try {
      setIsSharing(true);
      
      // SMS deep link
      const smsUrl = Platform.select({
        ios: `sms:${recipientPhone || ""}&body=${encodeURIComponent(trackingMessage)}`,
        android: `sms:${recipientPhone || ""}?body=${encodeURIComponent(trackingMessage)}`,
        default: `sms:${recipientPhone || ""}`,
      });
      
      const canOpen = await Linking.canOpenURL(smsUrl);
      
      if (canOpen) {
        await Linking.openURL(smsUrl);
      } else {
        Alert.alert("Error", "Failed to open SMS app.");
      }
    } catch (error) {
      console.error("Error sharing via SMS:", error);
      Alert.alert("Error", "Failed to open SMS app.");
    } finally {
      setIsSharing(false);
    }
  };

  const handleShareGeneric = async () => {
    try {
      setIsSharing(true);
      
      const result = await Share.share({
        message: trackingMessage,
        title: "Track Your Ntumai Delivery",
      });

      if (result.action === Share.sharedAction) {
        console.log("Tracking link shared successfully");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      Alert.alert("Error", "Failed to share tracking link.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <View className={cn("bg-success/10 rounded-2xl p-5 border border-success/30", className)}>
      {/* Success header */}
      <View className="flex-row items-start mb-4">
        <View className="w-12 h-12 rounded-full bg-success items-center justify-center mr-4">
          <Text className="text-2xl">✓</Text>
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-success mb-1">
            Delivery Booked!
          </Text>
          <Text className="text-sm text-foreground">
            Share the tracking link with your recipient
          </Text>
        </View>
      </View>

      {/* Tracking link display */}
      <View className="bg-background rounded-xl p-4 mb-4 border border-border">
        <Text className="text-xs text-muted mb-1 font-medium">TRACKING LINK</Text>
        <Text className="text-sm text-primary font-mono" numberOfLines={1}>
          {trackingLink}
        </Text>
      </View>

      {/* Share buttons - Figma style */}
      <View className="gap-3">
        {/* WhatsApp */}
        {recipientPhone && (
          <TouchableOpacity
            onPress={handleShareViaWhatsApp}
            disabled={isSharing}
            className="bg-[#25D366] rounded-xl py-4 px-5 flex-row items-center justify-center active:opacity-80"
          >
            <Text className="text-xl mr-3">💬</Text>
            <Text className="text-white font-semibold text-base">
              Share via WhatsApp
            </Text>
          </TouchableOpacity>
        )}

        {/* SMS */}
        {recipientPhone && (
          <TouchableOpacity
            onPress={handleShareViaSMS}
            disabled={isSharing}
            className="bg-primary rounded-xl py-4 px-5 flex-row items-center justify-center active:opacity-80"
          >
            <Text className="text-xl mr-3">📱</Text>
            <Text className="text-white font-semibold text-base">
              Share via SMS
            </Text>
          </TouchableOpacity>
        )}

        {/* Generic share */}
        <TouchableOpacity
          onPress={handleShareGeneric}
          disabled={isSharing}
          className="bg-surface rounded-xl py-4 px-5 flex-row items-center justify-center border border-border active:opacity-80"
        >
          <Text className="text-xl mr-3">📤</Text>
          <Text className="text-foreground font-semibold text-base">
            Share via Other Apps
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info note */}
      <View className="mt-4 flex-row items-center">
        <Text className="text-primary mr-2">💡</Text>
        <Text className="text-xs text-muted flex-1">
          The recipient can track the delivery without installing the app
        </Text>
      </View>
    </View>
  );
}
