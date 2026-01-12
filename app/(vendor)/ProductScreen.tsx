// @ts-nocheck
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';


import VendorProducts from '@/screens/vendor/VendorProducts';

export default function ProductScreenRoute(props: any) { return <VendorProducts {...props} />; }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

