// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { View, ScrollView, ModalInput, Platform, TextInput } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { Button, PrimaryButton, SecondaryButton, IconButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { useOrderTemplatesStore, OrderTemplate, TemplateItem } from '@/stores/order-templates-store';
import * as Haptics from 'expo-haptics';
import { cn } from '@/lib/utils';
import { Plus, Trash2, FileText } from 'lucide-react-native';
  const CATEGORIES = [
  { value: 'all', label: 'All', icon: '📋' },
  { value: 'groceries', label: 'Groceries', icon: '🛒' },
  { value: 'meals', label: 'Meals', icon: '🍽️' },
  { value: 'office', label: 'Office', icon: '🏢' },
  { value: 'other', label: 'Other', icon: '📦' },
];

export default function OrderTemplatesScreen() { const colors = useColors();
  const { templates,
    createTemplate,
    deleteTemplate,
    useTemplate,
    loadTemplates,
    getTemplatesByCategory} = useOrderTemplatesStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateCategory, setTemplateCategory] = useState('groceries');

  useEffect(() => { loadTemplates(); }, []);
  const filteredTemplates = getTemplatesByCategory(selectedCategory);
  const handleHaptic = () =>  {
    if (Platform.OS !== 'web') { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } };
  const handleUseTemplate = async (id: string) =>  {
    if (Platform.OS !== 'web') { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }
  const template = await useTemplate(id);
    
    if (template) { // TODO: Navigate to checkout with template items
      console.log('Using template:', template.name); } };
  const handleDeleteTemplate = async (id: string) =>  {
    if (Platform.OS !== 'web') { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); }
    await deleteTemplate(id); };
  const handleCreateTemplate = async () =>  {
    if (!templateName.trim()) { return; }

    // Mock items for demo
    const mockItems: TemplateItem[] = [
      { productId: '1',
        productName: 'Sample Item 1',
        quantity: 2,
        price: 25},
      { productId: '2',
        productName: 'Sample Item 2',
        quantity: 1,
        price: 50},
    ];

    if (Platform.OS !== 'web') { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }
    await createTemplate(templateName, templateCategory, mockItems);
    
    setModalVisible(false);
    setTemplateName('');
    setTemplateCategory('groceries'); };
  const renderTemplateCard = (template: OrderTemplate) => { const categoryInfo = CATEGORIES.find((c) => c.value === template.category);

    return (
      <Card key={template.id} variant="flat" padding="md" className="mb-3">
        {/* Header */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-xl">{categoryInfo?.icon || '📦'}</Text>
              <Text variant="body" weight="semibold" className="text-foreground flex-1">
                {template.name}
              </Text>
            </View>
            <Text variant="h4" weight="bold" className="text-primary mb-1">
              K{template.totalAmount.toFixed(2)}
            </Text>
            <Text variant="caption" className="text-muted">
              {template.items.length} item{template.items.length !== 1 ? 's' : ''}
            </Text>
          </View>

          <IconButton
            icon={<Trash2 size={18} color={colors.muted} />}
            onPress={() => handleDeleteTemplate(template.id)}
            variant="ghost"
            size="sm"
          />
        </View>

        {/* Items Preview */}
        <View className="gap-1 mb-3">
          {template.items.slice(0, 3).map((item, index) => (
            <Text key={index} variant="caption" className="text-muted">
              • {item.productName} (x{item.quantity})
            </Text>
          ))}
          {template.items.length > 3 && (
            <Text variant="caption" className="text-muted">
              + {template.items.length - 3} more
            </Text>
          )}
        </View>

        {/* Stats */}
        <View className="flex-row justify-between mb-3">
          {template.lastUsed && (
            <Text variant="caption" className="text-muted">
              Last used: {new Date(template.lastUsed).toLocaleDateString()}
            </Text>
          )}
          <Text variant="caption" className="text-muted">
            Used {template.useCount} time{template.useCount !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Use Button */}
        <PrimaryButton
          title="Use Template"
          onPress={() => handleUseTemplate(template.id)}
          fullWidth
        />
      </Card>
    ); };

  return (
    <ScreenContainer className="flex-1">
      <ScrollView 
        className="flex-1"
        contentContainerClassName="p-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <Text variant="h2" weight="bold" className="text-foreground">
            Order Templates
          </Text>
          <Button
            title="+ New"
            onPress={() => { handleHaptic();
              setModalVisible(true); }}
            size="sm"
          />
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-5"
          contentContainerClassName="gap-2"
        >
          {CATEGORIES.map((category) => (
            <Button
              key={category.value}
              onPress={() => { handleHaptic();
                setSelectedCategory(category.value); }}
              variant={selectedCategory === category.value ? 'primary' : 'outline'}
              size="sm"
              className="flex-row gap-1.5"
            >
              <Text className="text-base">{category.icon}</Text>
              <Text 
                variant="caption" 
                weight={selectedCategory === category.value ? 'semibold' : 'regular'}
                className={selectedCategory === category.value ? 'text-white' : 'text-foreground'}
              >
                {category.label}
              </Text>
            </Button>
          ))}
        </ScrollView>

        {/* Templates List */}
        {filteredTemplates.length === 0 ? (
          <EmptyStateView
            icon={<FileText size={32} color={colors.muted} />}
            title="No Templates Yet"
            description="Create templates for your frequently ordered items to save time"
            action={{ label: 'Create Template',
              onPress: () => setModalVisible(true)}}
          />
        ) : (
          filteredTemplates.map(renderTemplateCard)
        )}
      </ScrollView>

      {/* Create Template Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-5">
            <Text variant="h3" weight="bold" className="text-foreground mb-5">
              Create Template
            </Text>

            <Text variant="caption" weight="semibold" className="text-muted mb-2">
              Template Name
            </Text>
            <TextInput
              value={templateName}
              onChangeText={setTemplateName}
              placeholder="e.g., Weekly Groceries"
              className="bg-surface text-foreground border border-border rounded-xl p-3 mb-3"
              placeholderTextColor={colors.muted}
            />

            <Text variant="caption" weight="semibold" className="text-muted mb-2 mt-3">
              Category
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-3">
              {CATEGORIES.filter((c) => c.value !== 'all').map((category) => (
                <Button
                  key={category.value}
                  onPress={() => { handleHaptic();
                    setTemplateCategory(category.value); }}
                  variant={templateCategory === category.value ? 'primary' : 'outline'}
                  size="sm"
                  className="flex-row gap-1.5"
                >
                  <Text className="text-lg">{category.icon}</Text>
                  <Text 
                    variant="caption"
                    weight={templateCategory === category.value ? 'semibold' : 'regular'}
                    className={templateCategory === category.value ? 'text-white' : 'text-foreground'}
                  >
                    {category.label}
                  </Text>
                </Button>
              ))}
            </View>

            <Text variant="caption" className="text-muted mb-3">
              Note: After creating the template, you can add items from your order history or cart.
            </Text>

            <View className="flex-row gap-3 mt-5">
              <SecondaryButton
                title="Cancel"
                onPress={() => setModalVisible(false)}
                className="flex-1"
              />
              <PrimaryButton
                title="Create"
                onPress={handleCreateTemplate}
                className="flex-1"
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

