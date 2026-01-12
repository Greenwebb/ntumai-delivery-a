import { ReactNode } from "react";
import { View } from "react-native";
import AppText from "@/components/AppText";

interface SignupHeaderProps {
  title: string;
  subtitle: string;
  description: ReactNode;
}

const SignupHeader: React.FC<SignupHeaderProps> = ({
  title,
  subtitle,
  description,
}) => {
  return (
    <View className="px-6 pt-20 pb-6">
      <AppText variant="h1" weight="bold" className="text-primary mb-1 leading-tight">
        {title}
      </AppText>
      <AppText variant="h3" weight="semibold" className="text-primary">
        {subtitle}
      </AppText>
      <AppText variant="body" className="text-gray-700 mt-4 leading-relaxed">
        {description}
      </AppText>
    </View>
  );
};

export default SignupHeader;
