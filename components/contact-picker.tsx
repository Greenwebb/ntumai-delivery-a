import { View, Text, TouchableOpacity, TextInput, Alert, Platform } from "react-native";
import { useState } from "react";
import * as Contacts from "expo-contacts";
import { cn } from "@/lib/utils";

interface ContactPickerProps {
  recipientName: string;
  recipientPhone: string;
  onNameChange: (name: string) => void;
  onPhoneChange: (phone: string) => void;
  className?: string;
}

/**
 * ContactPicker - Phonebook integration for selecting recipients
 * 
 * Implements the blueprint requirement:
 * "For the recipient, the user can either select a contact from their phonebook
 * (which auto-fills the name and number) or manually enter the recipient's name
 * and phone number."
 * 
 * Design: Matches Figma patterns with teal primary, rounded inputs
 * 
 * Usage:
 * ```tsx
 * <ContactPicker
 *   recipientName={name}
 *   recipientPhone={phone}
 *   onNameChange={setName}
 *   onPhoneChange={setPhone}
 * />
 * ```
 */
export function ContactPicker({
  recipientName,
  recipientPhone,
  onNameChange,
  onPhoneChange,
  className,
}: ContactPickerProps) {
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  const handleSelectFromContacts = async () => {
    try {
      setIsLoadingContacts(true);

      // Request contacts permission
      const { status } = await Contacts.requestPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow access to your contacts to use this feature.",
          [{ text: "OK" }]
        );
        return;
      }

      // On web, expo-contacts doesn't support presentContactPickerAsync
      if (Platform.OS === "web") {
        Alert.alert(
          "Not Available on Web",
          "Contact picker is only available on iOS and Android. Please enter the recipient's details manually.",
          [{ text: "OK" }]
        );
        return;
      }

      // Present contact picker (iOS/Android only)
      const contact = await Contacts.presentContactPickerAsync();
      
      if (contact) {
        // Extract name
        const name = contact.name || "";
        onNameChange(name);

        // Extract phone number
        if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
          const phone = contact.phoneNumbers[0].number || "";
          onPhoneChange(phone);
        }
      }
    } catch (error) {
      console.error("Error selecting contact:", error);
      Alert.alert(
        "Error",
        "Failed to access contacts. Please enter the recipient's details manually.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoadingContacts(false);
    }
  };

  return (
    <View className={cn("bg-surface rounded-2xl p-5 border border-border", className)}>
      <Text className="text-lg font-semibold text-foreground mb-4">
        Recipient Details
      </Text>

      {/* Select from contacts button - Figma style */}
      <TouchableOpacity
        onPress={handleSelectFromContacts}
        disabled={isLoadingContacts}
        className="bg-primary/10 rounded-xl p-4 mb-5 border border-primary/20 active:opacity-70"
      >
        <View className="flex-row items-center justify-center">
          <Text className="text-2xl mr-3">📱</Text>
          <Text className="text-primary font-semibold text-base">
            {isLoadingContacts ? "Loading..." : "Select from Contacts"}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Divider */}
      <View className="flex-row items-center mb-5">
        <View className="flex-1 h-px bg-border" />
        <Text className="text-xs text-muted mx-4 font-medium">OR ENTER MANUALLY</Text>
        <View className="flex-1 h-px bg-border" />
      </View>

      {/* Manual input fields - Figma style */}
      <View className="gap-4">
        {/* Recipient name */}
        <View>
          <Text className="text-sm font-medium text-foreground mb-2">
            Recipient Name
          </Text>
          <TextInput
            value={recipientName}
            onChangeText={onNameChange}
            placeholder="Enter full name"
            className="bg-background rounded-xl px-4 py-3.5 text-base text-foreground border border-border"
            placeholderTextColor="#9CA3AF"
            returnKeyType="next"
          />
        </View>

        {/* Recipient phone */}
        <View>
          <Text className="text-sm font-medium text-foreground mb-2">
            Phone Number
          </Text>
          <TextInput
            value={recipientPhone}
            onChangeText={onPhoneChange}
            placeholder="+260 XXX XXX XXX"
            keyboardType="phone-pad"
            className="bg-background rounded-xl px-4 py-3.5 text-base text-foreground border border-border"
            placeholderTextColor="#9CA3AF"
            returnKeyType="done"
          />
          <View className="flex-row items-center mt-2">
            <Text className="text-xs text-primary mr-1">💡</Text>
            <Text className="text-xs text-muted">
              Recipient doesn't need to have the Ntumai app
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
