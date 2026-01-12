import React from "react";
import { Text, View } from "react-native";
import AppText from "@/components/AppText";

interface AuthHeaderProps {
  title: string;
  subtitle: string;
  description: string;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  subtitle,
  description,
}) => {
  return (
    <View className='px-6 pt-8 pb-4 font-ubuntu'>
      <AppText variant="h1" weight="bold" className='text-primary mb-1'>
        {title}
      </AppText>
      <AppText variant="h1" weight="bold" className='text-primary'>
        {subtitle}
      </AppText>
      <AppText variant="body" className='mt-4 pt-4 pb-4 text-[#606268]'>
        {description}
      </AppText>
    </View>
  );
};

export default AuthHeader;
