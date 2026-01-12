import React from 'react';
import { Pressable, View, Image } from 'react-native';
import Svg, { Path } from 'react-native-svg';


const SocialAuth: React.FC = () => {
  return (
    <>

      <View className='flex-row items-center mb-10 w-full'>
        <Image
          source={require('@/assets/divider.png')}
          resizeMode='cover'
          style={{ height: 34, width: '100%' }}
        />
      </View>

      <View
        className='flex-row justify-center items-center mb-6'
        style={{ gap: 20 }}
      >
        <Pressable
          className='w-14 h-14 items-center justify-center rounded-full'
          style={{
            backgroundColor: '#f5f7f9',
          }}
        >
          <Svg width={24} height={24} viewBox='0 0 533.5 544.3'>
            <Path
              fill='#4285F4'
              d='M533.5 278.4c0-17.4-1.6-34.1-4.7-50.2H272.1v95h146.9c-6.4 34.5-25.1 63.7-53.4 83.1v68h86.3c50.6-46.7 81.6-115.5 81.6-195.9z'
            />
            <Path
              fill='#34A853'
              d='M272.1 544.3c72.6 0 133.6-24 178.2-65.3l-86.3-68c-24 16.1-54.7 25.4-91.9 25.4-70.6 0-130.5-47.7-151.9-111.7H29.2v70.2c44.7 89.6 137 149.4 242.9 149.4z'
            />
            <Path
              fill='#FBBC04'
              d='M120.2 324.7c-10.3-30.3-10.3-62.9 0-93.2V161.3H29.2c-31.2 62.3-31.2 135.7 0 198z'
            />
            <Path
              fill='#EA4335'
              d='M272.1 107.7c39.5 0 75 13.6 102.9 40.5l77.1-77.1C405.7 25 344.7 0 272.1 0 166.2 0 73.9 59.7 29.2 149.4l91 70.2c21.4-64 81.3-111.9 151.9-111.9z'
            />
          </Svg>
        </Pressable>

        <Pressable
          className='w-14 h-14 items-center justify-center rounded-full'
          style={{
            backgroundColor: '#f5f7f9',
          }}
        >
          <Svg width={24} height={24} viewBox='0 0 24 24' fill='black'>
            <Path d='M16.365 1.43c0 1.14-.467 2.23-1.26 3.04-.78.82-2.06 1.45-3.15 1.34a3.26 3.26 0 0 1-.03-.4c0-1.12.51-2.28 1.29-3.07.78-.79 2.07-1.36 3.15-1.37.02.13.04.26.04.4zm2.91 16.14c-.25.57-.51 1.13-.84 1.64-.66 1.01-1.45 2.01-2.57 2.02-1 .01-1.3-.65-2.71-.64-1.4.01-1.74.65-2.74.64-1.12-.01-1.96-1.1-2.62-2.1-1.79-2.61-3.16-7.39-1.32-10.63.91-1.59 2.54-2.6 4.3-2.62 1.05-.02 2.05.7 2.71.7.66 0 1.88-.86 3.17-.73.54.02 2.07.22 3.06 1.67-.08.05-1.82 1.06-1.81 3.15 0 2.49 2.23 3.33 2.28 3.35-.03.09-.36 1.27-1.17 2.53z' />
          </Svg>
        </Pressable>

        <Pressable
          className='w-14 h-14 items-center justify-center rounded-full'
          style={{
            backgroundColor: '#f5f7f9',
          }}
        >
          <Svg width={24} height={24} viewBox='0 0 24 24' fill='#1877F2'>
            <Path d='M22.675 0h-21.35C.597 0 0 .6 0 1.33v21.34C0 23.4.597 24 1.325 24H12.82v-9.294H9.692v-3.622h3.127V8.413c0-3.1 1.894-4.788 4.66-4.788 1.325 0 2.464.099 2.795.144v3.24h-1.918c-1.506 0-1.797.716-1.797 1.766v2.315h3.59l-.467 3.622h-3.123V24h6.116C23.403 24 24 23.4 24 22.67V1.33C24 .6 23.403 0 22.675 0z' />
          </Svg>
        </Pressable>
      </View>
    </>
  );
};

export default SocialAuth;
