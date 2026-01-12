// @ts-nocheck
/**
 * IncomingJobNotification - Full-screen incoming call-style job offer
 * With countdown timer, auto-reject, and swipe-to-accept
 */
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

import { Text } from '@/components/ui/text';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.4;
const TIMEOUT_SECONDS = 30;

export interface JobOffer {
  id: string;
  customerName: string;
  customerAvatar?: string;
  jobType: 'delivery' | 'errand' | 'marketplace';
  description: string;
  pickupAddress: string;
  deliveryAddress: string;
  amount: number;
  distance: number;
  estimatedDuration: number;
}

interface IncomingJobNotificationProps {
  visible: boolean;
  jobOffer: JobOffer | null;
  onAccept: (jobId: string) => void;
  onDecline: (jobId: string) => void;
  onTimeout: (jobId: string) => void;
}

export function IncomingJobNotification({
  visible,
  jobOffer,
  onAccept,
  onDecline,
  onTimeout,
}: IncomingJobNotificationProps) {
  const colors = useColors();
  const [timeLeft, setTimeLeft] = useState(TIMEOUT_SECONDS);
  const [swiping, setSwiping] = useState(false);
  const pan = useRef(new Animated.ValueXY()).current;
  const soundObject = useRef<Audio.Sound | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Countdown timer
  useEffect(() => {
    if (!visible || !jobOffer) {
      setTimeLeft(TIMEOUT_SECONDS);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible, jobOffer]);

  // Play notification sound
  useEffect(() => {
    if (visible && jobOffer) {
      playNotificationSound();
      startPulseAnimation();
    }

    return () => {
      stopNotificationSound();
    };
  }, [visible, jobOffer]);

  const playNotificationSound = async () => {
    try {
      // Use system notification sound
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      // TODO: Add custom notification sound
      // const { sound } = await Audio.Sound.createAsync(
      //   require('@/assets/sounds/notification.mp3'),
      //   { isLooping: true }
      // );
      // soundObject.current = sound;
      // await sound.playAsync();
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  const stopNotificationSound = async () => {
    try {
      if (soundObject.current) {
        await soundObject.current.stopAsync();
        await soundObject.current.unloadAsync();
        soundObject.current = null;
      }
    } catch (error) {
      console.error('Error stopping notification sound:', error);
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setSwiping(true);
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },
      onPanResponderMove: (_, gesture) => {
        pan.setValue({ x: gesture.dx, y: 0 });

        if (Math.abs(gesture.dx) > SWIPE_THRESHOLD && Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        setSwiping(false);

        if (gesture.dx > SWIPE_THRESHOLD) {
          handleAccept();
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          handleDecline();
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const handleAccept = () => {
    if (!jobOffer) return;

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    Animated.timing(pan, {
      toValue: { x: width, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      stopNotificationSound();
      onAccept(jobOffer.id);
      pan.setValue({ x: 0, y: 0 });
    });
  };

  const handleDecline = () => {
    if (!jobOffer) return;

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    Animated.timing(pan, {
      toValue: { x: -width, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      stopNotificationSound();
      onDecline(jobOffer.id);
      pan.setValue({ x: 0, y: 0 });
    });
  };

  const handleTimeout = () => {
    if (!jobOffer) return;

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    stopNotificationSound();
    onTimeout(jobOffer.id);
  };

  if (!visible || !jobOffer) return null;

  const progressPercentage = (timeLeft / TIMEOUT_SECONDS) * 100;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      statusBarTranslucent
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Background gradient */}
        <View style={[styles.gradientOverlay, { backgroundColor: colors.primary + '10' }]} />

        {/* Content */}
        <View style={styles.content}>
          {/* Timer Circle */}
          <View style={styles.timerContainer}>
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  borderColor: colors.primary,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />
            <View
              style={[
                styles.timerCircle,
                { backgroundColor: colors.surface, borderColor: colors.primary },
              ]}
            >
              <Text className="text-4xl font-bold text-primary">{timeLeft}</Text>
              <Text className="text-xs text-muted mt-1">seconds</Text>
            </View>
          </View>

          {/* Customer Info */}
          <View style={styles.customerInfo}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: colors.primary + '20', borderColor: colors.primary },
              ]}
            >
              <Text className="text-3xl font-bold text-primary">
                {jobOffer.customerName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text className="text-2xl font-bold text-foreground mt-4">
              {jobOffer.customerName}
            </Text>
            <Text className="text-base text-muted mt-1">
              {jobOffer.jobType === 'delivery' ? 'Delivery Request' : 'Task Request'}
            </Text>
          </View>

          {/* Job Details */}
          <View style={[styles.detailsCard, { backgroundColor: colors.surface }]}>
            <View style={styles.detailRow}>
              <Feather name="package" size={20} color={colors.foreground} />
              <Text className="text-sm text-foreground ml-3 flex-1" numberOfLines={2}>
                {jobOffer.description}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Feather name="map-pin" size={20} color={colors.muted} />
              <View className="ml-3 flex-1">
                <Text className="text-xs text-muted">From</Text>
                <Text className="text-sm text-foreground" numberOfLines={1}>
                  {jobOffer.pickupAddress}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Feather name="navigation" size={20} color={colors.muted} />
              <View className="ml-3 flex-1">
                <Text className="text-xs text-muted">To</Text>
                <Text className="text-sm text-foreground" numberOfLines={1}>
                  {jobOffer.deliveryAddress}
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Feather name="dollar-sign" size={18} color={colors.success} />
                <Text className="text-lg font-bold text-success ml-1">
                  K{jobOffer.amount.toFixed(2)}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Feather name="map" size={18} color={colors.muted} />
                <Text className="text-sm text-muted ml-1">{jobOffer.distance} km</Text>
              </View>
              <View style={styles.statItem}>
                <Feather name="clock" size={18} color={colors.muted} />
                <Text className="text-sm text-muted ml-1">{jobOffer.estimatedDuration} min</Text>
              </View>
            </View>
          </View>

          {/* Swipe Instructions */}
          <Text className="text-sm text-muted text-center mb-4">
            Swipe right to accept • Swipe left to decline
          </Text>

          {/* Swipe Controls */}
          <View style={styles.swipeContainer}>
            {/* Track */}
            <View style={[styles.swipeTrack, { backgroundColor: colors.surface }]}>
              {/* Decline side */}
              <View style={[styles.swipeIcon, { backgroundColor: colors.error + '20' }]}>
                <Feather name="x" size={28} color={colors.error} />
              </View>

              {/* Accept side */}
              <View style={[styles.swipeIcon, { backgroundColor: colors.success + '20' }]}>
                <Feather name="check" size={28} color={colors.success} />
              </View>
            </View>

            {/* Swipeable Button */}
            <Animated.View
              {...panResponder.panHandlers}
              style={[
                styles.swipeButton,
                { backgroundColor: colors.primary, transform: [{ translateX: pan.x }] },
              ]}
            >
              <Feather name="chevrons-right" size={32} color="#FFFFFF" />
            </Animated.View>
          </View>

          {/* Progress Bar */}
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  backgroundColor: timeLeft > 10 ? colors.success : colors.error,
                  width: `${progressPercentage}%`,
                },
              ]}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    opacity: 0.3,
  },
  timerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  swipeContainer: {
    width: '100%',
    height: 80,
    position: 'relative',
    marginBottom: 16,
  },
  swipeTrack: {
    height: 80,
    borderRadius: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  swipeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeButton: {
    position: 'absolute',
    left: 12,
    top: 12,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
});
