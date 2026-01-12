// @ts-nocheck
import React from 'react';
import { View, Modal as RNModal, ModalProps as RNModalProps, ScrollView, Platform } from 'react-native';
import { Text } from './text';
import { Button, SecondaryButton, PrimaryButton } from './button';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react-native';

export interface ModalProps extends Omit<RNModalProps, 'transparent' | 'animationType'> {
  /**
   * Whether the modal is visible
   */
  visible: boolean;
  
  /**
   * Callback when modal is closed
   */
  onClose: () => void;
  
  /**
   * Modal title
   */
  title?: string;
  
  /**
   * Modal subtitle/description
   */
  subtitle?: string;
  
  /**
   * Modal content
   */
  children: React.ReactNode;
  
  /**
   * Show close button in header
   */
  showCloseButton?: boolean;
  
  /**
   * Modal size variant
   */
  size?: 'sm' | 'md' | 'lg' | 'full';
  
  /**
   * Position variant
   */
  position?: 'bottom' | 'center';
  
  /**
   * Enable scrolling for content
   */
  scrollable?: boolean;
  
  /**
   * Additional className for modal content
   */
  contentClassName?: string;
  
  /**
   * Footer actions
   */
  footer?: React.ReactNode;
  
  /**
   * Primary action button
   */
  primaryAction?: {
    label: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
  };
  
  /**
   * Secondary action button
   */
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
}

/**
 * Standardized Modal component with bottom sheet and center variants.
 * 
 * @example
 * ```tsx
 * <Modal
 *   visible={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirm Action"
 *   subtitle="Are you sure you want to continue?"
 *   primaryAction={{
 *     label: 'Confirm',
 *     onPress: handleConfirm,
 *   }}
 *   secondaryAction={{
 *     label: 'Cancel',
 *     onPress: () => setIsOpen(false),
 *   }}
 * >
 *   <Text>Modal content goes here</Text>
 * </Modal>
 * ```
 */
export function Modal({
  visible,
  onClose,
  title,
  subtitle,
  children,
  showCloseButton = true,
  size = 'md',
  position = 'bottom',
  scrollable = true,
  contentClassName,
  footer,
  primaryAction,
  secondaryAction,
  ...props
}: ModalProps) {
  const colors = useColors();

  const sizeStyles = {
    sm: 'max-h-[40%]',
    md: 'max-h-[60%]',
    lg: 'max-h-[80%]',
    full: 'h-full',
  };

  const positionStyles = {
    bottom: 'justify-end',
    center: 'justify-center items-center',
  };

  const contentStyles = {
    bottom: 'rounded-t-3xl',
    center: 'rounded-3xl mx-4',
  };

  const ContentWrapper = scrollable ? ScrollView : View;

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      {...props}
    >
      <View className={cn('flex-1 bg-black/50', positionStyles[position])}>
        <View
          className={cn(
            'bg-background',
            contentStyles[position],
            position === 'bottom' ? sizeStyles[size] : 'max-w-md w-full'
          )}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <View className="flex-row justify-between items-start p-5 pb-3">
              <View className="flex-1 pr-4">
                {title && (
                  <Text variant="h3" weight="bold" className="text-foreground mb-1">
                    {title}
                  </Text>
                )}
                {subtitle && (
                  <Text variant="body" className="text-muted">
                    {subtitle}
                  </Text>
                )}
              </View>
              {showCloseButton && (
                <Button
                  iconOnly={<X size={20} color={colors.muted} />}
                  onPress={onClose}
                  variant="ghost"
                  size="sm"
                />
              )}
            </View>
          )}

          {/* Content */}
          <ContentWrapper
            className={cn('px-5', contentClassName)}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ContentWrapper>

          {/* Footer */}
          {(footer || primaryAction || secondaryAction) && (
            <View className="p-5 pt-4">
              {footer || (
                <View className="flex-row gap-3">
                  {secondaryAction && (
                    <SecondaryButton
                      title={secondaryAction.label}
                      onPress={secondaryAction.onPress}
                      className="flex-1"
                    />
                  )}
                  {primaryAction && (
                    <PrimaryButton
                      title={primaryAction.label}
                      onPress={primaryAction.onPress}
                      loading={primaryAction.loading}
                      disabled={primaryAction.disabled}
                      className="flex-1"
                    />
                  )}
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </RNModal>
  );
}

/**
 * Confirmation modal with yes/no actions
 */
export interface ConfirmModalProps extends Omit<ModalProps, 'primaryAction' | 'secondaryAction'> {
  /**
   * Confirm button label
   */
  confirmLabel?: string;
  
  /**
   * Cancel button label
   */
  cancelLabel?: string;
  
  /**
   * Callback when confirmed
   */
  onConfirm: () => void;
  
  /**
   * Callback when cancelled
   */
  onCancel?: () => void;
  
  /**
   * Confirm button variant
   */
  confirmVariant?: 'primary' | 'destructive';
  
  /**
   * Loading state for confirm button
   */
  loading?: boolean;
}

export function ConfirmModal({
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  confirmVariant = 'primary',
  loading = false,
  ...props
}: ConfirmModalProps) {
  return (
    <Modal
      {...props}
      primaryAction={{
        label: confirmLabel,
        onPress: onConfirm,
        loading,
      }}
      secondaryAction={{
        label: cancelLabel,
        onPress: onCancel || props.onClose,
      }}
    />
  );
}

/**
 * Alert modal with single action button
 */
export interface AlertModalProps extends Omit<ModalProps, 'primaryAction' | 'secondaryAction'> {
  /**
   * Action button label
   */
  actionLabel?: string;
  
  /**
   * Callback when action is pressed
   */
  onAction?: () => void;
}

export function AlertModal({
  actionLabel = 'OK',
  onAction,
  ...props
}: AlertModalProps) {
  return (
    <Modal
      {...props}
      showCloseButton={false}
      primaryAction={{
        label: actionLabel,
        onPress: onAction || props.onClose,
      }}
    />
  );
}

/**
 * Bottom sheet modal (alias for Modal with position="bottom")
 */
export function BottomSheet(props: Omit<ModalProps, 'position'>) {
  return <Modal {...props} position="bottom" />;
}

/**
 * Full screen modal
 */
export function FullScreenModal(props: Omit<ModalProps, 'size' | 'position'>) {
  return <Modal {...props} size="full" position="center" />;
}
