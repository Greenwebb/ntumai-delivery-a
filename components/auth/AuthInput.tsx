// @ts-nocheck
import React from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Input, PhoneInput } from "../ui";

interface AuthInputProps {
  method: "phone" | "email" | "text";
  value: string;
  onChangeText: (text: string) => void;
  countryCode?: string;
  onCountryCodeChange?: (code: string) => void;
  placeholder?: string;
  hasError?: boolean;
  isValid?: boolean;
}

const AuthInput: React.FC<AuthInputProps> = ({
  method,
  value,
  onChangeText,
  countryCode = "+260",
  onCountryCodeChange = () => {},
  placeholder,
  hasError = false,
  isValid = false,
}) => {
  
  if (method === "phone") {
    return (
      <PhoneInput
        label={placeholder || 'Enter your mobile no.*'}
        phone={value}
        countryCode={countryCode}
        onPhoneChange={onChangeText}
        onCountryChange={onCountryCodeChange}
        errorText={hasError ? 'Invalid phone' : undefined}
        className="mb-8"
      />
    );
  }

  if (method === "email") {
    return (
      <Input
        label={placeholder || 'Enter your email address'}
        value={value}
        onChangeText={onChangeText}
        keyboardType="email-address"
        autoCapitalize="none"
        leftElement={
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
              d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
              stroke="#6B7280"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M22 6L12 13L2 6"
              stroke="#6B7280"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        }
        errorText={hasError ? 'Invalid email' : undefined}
        className="mb-8"
      />
    );
  }



  // Text input (for country code or other text fields)
  return (
    <Input
      label={placeholder || 'Enter text'}
      value={value}
      onChangeText={onChangeText}
      errorText={hasError ? 'Invalid value' : undefined}
      className="mb-8"
    />
  );
};

export default AuthInput;
