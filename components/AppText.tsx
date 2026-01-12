import { Text as RNText } from 'react-native';
import React from 'react';

type Variant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'caption'
  | 'overline';

type Weight = 'regular' | 'medium' | 'semibold' | 'bold';

interface AppTextProps {
  style?: object;
  children: React.ReactNode;
  className?: string;
  numberOfLines?: number;
  variant?: Variant;
  weight?: Weight;
}

const variantClasses: Record<Variant, string> = {
  display: 'text-5xl leading-tight',
  h1: 'text-4xl leading-tight',
  h2: 'text-3xl leading-snug',
  h3: 'text-2xl leading-snug',
  title: 'text-xl leading-snug',
  subtitle: 'text-lg leading-snug',
  body: 'text-base leading-relaxed',
  caption: 'text-sm leading-relaxed',
  overline: 'text-xs tracking-wide uppercase',
};

const weightClasses: Record<Weight, string> = {
  regular: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const AppText = ({
  style,
  className,
  variant = 'body',
  weight = 'regular',
  ...props
}: AppTextProps) => {
  const resolvedClassName = [
    'text-gray-900',
    variantClasses[variant],
    weightClasses[weight],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <RNText
      style={[{ fontFamily: 'Ubuntu-Regular' }, style]}
      {...props}
      className={resolvedClassName}
    />
  );
};

export default AppText;
