// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { View, ScrollView, Image, ModalInput, Platform, TextInput } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { Button, PrimaryButton, SecondaryButton, DestructiveButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { useWishlistStore } from '@/stores/wishlist-store';
import { useToast } from '@/lib/toast-provider';
import * as Haptics from 'expo-haptics';
import { Heart, ShoppingCart, Bell, BellOff, Trash2 } from 'lucide-react-native';

export default function WishlistScreen() { const colors = useColors();
  const { items,
    removeFromWishlist,
    togglePriceAlert,
    checkPriceDrops,
    loadWishlist} = useWishlistStore();
  const [priceAlertModalVisible, setPriceAlertModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [alertThreshold, setAlertThreshold] = useState('');

  useEffect(() => { loadWishlist(); }, []);
  const handleHaptic = (style = Haptics.ImpactFeedbackStyle.Light) =>  {
    if (Platform.OS !== 'web') { Haptics.impactAsync(style); } };
  const handleRemove = async (id: string) => { toast.info(
      'Remove from Wishlist',
      'Are you sure you want to remove this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove',
          style: 'destructive',
          onPress: async () => { handleHaptic(Haptics.ImpactFeedbackStyle.Medium);
            await removeFromWishlist(id); }},
      ]
    ); };
  const handleSetPriceAlert = async () =>  {
    if (!selectedItem || !alertThreshold.trim()) { toast.error('Please enter a valid price threshold.');
      return; }
  const threshold = parseFloat(alertThreshold);
    if (isNaN(threshold) || threshold <= 0) { toast.error('Please enter a valid positive number.');
      return; }

    handleHaptic(Haptics.ImpactFeedbackStyle.Medium);
    await togglePriceAlert(selectedItem, true, threshold);
    
    setPriceAlertModalVisible(false);
    setSelectedItem(null);
    setAlertThreshold('');

    toast.info('Price Alert Set', `You'll be notified when the price drops to K${threshold} or below.`); };
  const handleDisablePriceAlert = async (id: string) => { handleHaptic();
    await togglePriceAlert(id, false); };
  const priceDropItems = checkPriceDrops();

  return (
    <ScreenContainer className="flex-1">
      <ScrollView 
        className="flex-1"
        contentContainerClassName="p-4 gap-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="gap-1">
          <Text variant="h2" weight="bold" className="text-foreground">
            My Wishlist
          </Text>
          <Text variant="body" className="text-muted">
            {items.length} {items.length === 1 ? 'item' : 'items'} saved
          </Text>
        </View>

        {/* Price Drop Alerts */}
        {priceDropItems.length > 0 && (
          <View className="flex-row items-center gap-3 bg-success/20 p-4 rounded-xl">
            <Text className="text-2xl">🔔</Text>
            <View className="flex-1">
              <Text variant="body" weight="semibold" className="text-success">
                Price Drop Alert!
              </Text>
              <Text variant="caption" className="text-success">
                {priceDropItems.length} {priceDropItems.length === 1 ? 'item' : 'items'} reached your target price
              </Text>
            </View>
          </View>
        )}

        {/* Empty State */}
        {items.length === 0 && (
          <EmptyStateView
            icon={<Heart size={32} color={colors.muted} />}
            title="Your wishlist is empty"
            description="Save items you love to buy them later"
          />
        )}

        {/* Wishlist Items */}
        {items.map((item) => { const discountPercent = Math.round(
            ((item.originalPrice - item.currentPrice) / item.originalPrice) * 100
          );
  const hasPriceDrop =
            item.priceAlertEnabled &&
            item.priceAlertThreshold &&
            item.currentPrice <= item.priceAlertThreshold;

          return (
            <Card key={item.id} variant="flat" padding="md">
              {hasPriceDrop && (
                <View className="bg-success/20 px-3 py-1.5 rounded-full self-start mb-3">
                  <Text variant="caption" weight="semibold" className="text-success">
                    🎉 Price Drop!
                  </Text>
                </View>
              )}

              <View className="flex-row gap-3">
                <Image
                  source={{ uri: item.productImage }}
                  className="w-20 h-20 rounded-xl bg-surface"
                />
                <View className="flex-1">
                  <Text 
                    variant="body" 
                    weight="medium" 
                    className="text-foreground"
                    numberOfLines={2}
                  >
                    {item.productName}
                  </Text>
                  <Text variant="caption" className="text-muted mb-2">
                    {item.vendorName}
                  </Text>

                  <View className="flex-row items-center gap-2">
                    <Text variant="body" weight="bold" className="text-foreground">
                      K{item.currentPrice}
                    </Text>
                    {item.currentPrice < item.originalPrice && (
                      <>
                        <Text variant="caption" className="text-muted line-through">
                          K{item.originalPrice}
                        </Text>
                        <View className="bg-error/20 px-2 py-0.5 rounded">
                          <Text variant="caption" weight="semibold" className="text-error">
                            -{discountPercent}%
                          </Text>
                        </View>
                      </>
                    )}
                  </View>

                  {/* Price Alert Status */}
                  {item.priceAlertEnabled && item.priceAlertThreshold && (
                    <View className="mt-2">
                      <Text variant="caption" className="text-muted">
                        🔔 Alert when ≤ K{item.priceAlertThreshold}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Actions */}
              <View className="flex-row gap-2 mt-4">
                <PrimaryButton
                  title="Add to Cart"
                  iconLeft={<ShoppingCart size={16} color="white" />}
                  onPress={() => { handleHaptic();
                    toast.info('Item added to cart!'); }}
                  size="sm"
                  className="flex-1"
                />

                {item.priceAlertEnabled ? (
                  <SecondaryButton
                    title="Disable"
                    iconLeft={<BellOff size={16} color={colors.foreground} />}
                    onPress={() => handleDisablePriceAlert(item.id)}
                    size="sm"
                  />
                ) : (
                  <SecondaryButton
                    title="Alert"
                    iconLeft={<Bell size={16} color={colors.foreground} />}
                    onPress={() => { handleHaptic();
                      setSelectedItem(item.id);
                      setAlertThreshold(item.currentPrice.toString());
                      setPriceAlertModalVisible(true); }}
                    size="sm"
                  />
                )}

                <Button
                  iconOnly={<Trash2 size={18} color={colors.error} />}
                  onPress={() => handleRemove(item.id)}
                  variant="secondary"
                  size="sm"
                />
              </View>
            </Card>
          ); })}
      </ScrollView>

      {/* Price Alert Modal */}
      <Modal
        visible={priceAlertModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPriceAlertModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-5">
            <Text variant="h3" weight="bold" className="text-foreground mb-2">
              Set Price Alert
            </Text>
            <Text variant="body" className="text-muted mb-5">
              Get notified when the price drops to or below your target
            </Text>

            <Text variant="caption" weight="semibold" className="text-muted mb-2">
              Target Price (Kwacha)
            </Text>
            <TextInput
              value={alertThreshold}
              onChangeText={setAlertThreshold}
              placeholder="e.g., 50"
              keyboardType="numeric"
              className="bg-surface text-foreground border border-border rounded-xl p-3 mb-5"
              placeholderTextColor={colors.muted}
            />

            <View className="flex-row gap-3">
              <SecondaryButton
                title="Cancel"
                onPress={() => setPriceAlertModalVisible(false)}
                className="flex-1"
              />
              <PrimaryButton
                title="Set Alert"
                onPress={handleSetPriceAlert}
                className="flex-1"
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

