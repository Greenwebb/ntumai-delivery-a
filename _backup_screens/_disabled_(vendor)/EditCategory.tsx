// @ts-nocheck

import AppText from '@/components/AppText';
import { View } from 'react-native';

export default function EditCategoryRoute() {
  return (
    <View className='flex-1 items-center justify-center bg-white px-6'>
      <AppText className='text-xl font-semibold text-gray-800 mb-2'>
        Edit Category
      </AppText>
      <AppText className='text-gray-600 text-center'>
        Category editing UI will be added soon.
      </AppText>
    </View>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

