import { View, Text, Pressable, Image } from 'react-native';
import { Search, ShoppingCart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface HeaderBarProps {
  cartItemCount?: number;
  onSearch?: () => void;
  onCartClick?: () => void;
  onProfileClick?: () => void;
}

export default function HeaderBar({
  cartItemCount = 3,
  onSearch,
  onCartClick,
  onProfileClick,
}: HeaderBarProps) {
  return (
    <View className='w-screen bg-white'>
      <View
        className='px-6 py-4 bg-white'
        style={{
          backgroundColor: 'white',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 30 },
          shadowOpacity: 0.9,
          shadowRadius: 8,
          elevation: 8,
          zIndex: 20,
        }}
      >
        <View className='flex-row items-center h-12 '>
    
          <View>
            <LinearGradient
              colors={['#08AF97', 'rgba(8, 175, 151, 0.02)']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={{
                padding: 3,
                borderRadius: 999,
              }}
            >
              <Image
                source={require('./../assets/person.png')}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 999,
                }}
              />
            </LinearGradient>
          </View>

          <View className='flex-1 items-center '>
            <Image
              source={require('@/assets/logo_green.png')}
              height={10}
              width={20}
            />
          </View>

          <View className='flex-row items-center ml-auto'>
            <Pressable
              onPress={onSearch}
              className='w-12 h-12 rounded-full bg-primary items-center justify-center'
            >
              <Search size={35} color='white' />
            </Pressable>

            <View className='flex-row items-center ml-3'>
              <Pressable
                onPress={onCartClick}
                className='w-12 h-12 rounded-full bg-primary items-center justify-center'
              >
                <ShoppingCart size={24} color='white' />
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
