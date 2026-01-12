import React from "react";
import { Pressable, View } from "react-native";
import AppText from "@/components/AppText";

interface AuthFooterProps {
  questionText: string;
  actionText: string;
  onPress: () => void;
}

const AuthFooter: React.FC<AuthFooterProps> = ({
  questionText,
  actionText,
  onPress,
}) => {
  return (
    <View className='px-6 pb-12 font-ubuntu'>
      <Pressable onPress={onPress}>
        <AppText variant="body" className='text-center leading-relaxed text-[#787878]'>
          {questionText}{' '}
          <AppText variant="body" weight="bold" className='text-primary'>{actionText}</AppText>
        </AppText>
      </Pressable>
    </View>
  );
};

export default AuthFooter;
