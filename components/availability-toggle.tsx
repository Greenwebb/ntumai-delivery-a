import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAvailabilityStore, AvailabilityStatus } from '@/stores/availability-store';
import { useColors } from '@/hooks/use-colors';

const STATUS_CONFIG: Record<
  AvailabilityStatus,
  { label: string; icon: string; color: string }
> = {
  online: { label: 'Online', icon: '🟢', color: '#22C55E' },
  busy: { label: 'Busy', icon: '🟡', color: '#F59E0B' },
  offline: { label: 'Offline', icon: '⚫', color: '#9CA3AF' },
};

interface AvailabilityToggleProps {
  compact?: boolean;
}

export function AvailabilityToggle({ compact = false }: AvailabilityToggleProps) {
  const colors = useColors();
  const { status, setStatus, currentSession, getTodayOnlineTime } =
    useAvailabilityStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [onlineTime, setOnlineTime] = useState(0);

  useEffect(() => {
    // Update online time every minute
    const interval = setInterval(() => {
      setOnlineTime(getTodayOnlineTime());
    }, 60000);

    setOnlineTime(getTodayOnlineTime());

    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (newStatus: AvailabilityStatus) => {
    if (newStatus === 'offline' && status !== 'offline') {
      // Show confirmation modal
      setModalVisible(true);
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await setStatus(newStatus);
  };

  const confirmGoOffline = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await setStatus('offline');
    setModalVisible(false);
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (compact) {
    return (
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          const nextStatus: AvailabilityStatus =
            status === 'offline' ? 'online' : 'offline';
          handleStatusChange(nextStatus);
        }}
        style={[
          styles.compactToggle,
          { backgroundColor: STATUS_CONFIG[status].color + '20' },
        ]}
      >
        <Text style={styles.statusIcon}>{STATUS_CONFIG[status].icon}</Text>
        <Text
          style={[styles.compactLabel, { color: STATUS_CONFIG[status].color }]}
        >
          {STATUS_CONFIG[status].label}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Availability Status
          </Text>
          {currentSession && (
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Online for {formatTime(onlineTime)} today
            </Text>
          )}
        </View>

        <View style={styles.statusButtons}>
          {(Object.keys(STATUS_CONFIG) as AvailabilityStatus[]).map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => handleStatusChange(s)}
              style={[
                styles.statusButton,
                { borderColor: colors.border },
                status === s && {
                  backgroundColor: STATUS_CONFIG[s].color + '20',
                  borderColor: STATUS_CONFIG[s].color,
                  borderWidth: 2,
                },
              ]}
            >
              <Text style={styles.statusButtonIcon}>
                {STATUS_CONFIG[s].icon}
              </Text>
              <Text
                style={[
                  styles.statusButtonLabel,
                  { color: colors.foreground },
                  status === s && {
                    color: STATUS_CONFIG[s].color,
                    fontWeight: '600',
                  },
                ]}
              >
                {STATUS_CONFIG[s].label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {status === 'online' && (
          <View style={[styles.infoBox, { backgroundColor: colors.background }]}>
            <Text style={[styles.infoText, { color: colors.muted }]}>
              💡 You're visible to customers and will receive new order requests
            </Text>
          </View>
        )}

        {status === 'busy' && (
          <View style={[styles.infoBox, { backgroundColor: colors.background }]}>
            <Text style={[styles.infoText, { color: colors.muted }]}>
              ⏸️ You won't receive new orders but can complete current ones
            </Text>
          </View>
        )}

        {status === 'offline' && (
          <View style={[styles.infoBox, { backgroundColor: colors.background }]}>
            <Text style={[styles.infoText, { color: colors.muted }]}>
              🌙 You're not visible to customers and won't receive orders
            </Text>
          </View>
        )}
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.background }]}
          >
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              Going Offline?
            </Text>
            <Text style={[styles.modalMessage, { color: colors.muted }]}>
              You won't receive new orders while offline. Your account will remain
              active.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.modalButton, { backgroundColor: colors.surface }]}
              >
                <Text style={[styles.modalButtonText, { color: colors.foreground }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmGoOffline}
                style={[
                  styles.modalButton,
                  { backgroundColor: STATUS_CONFIG.offline.color },
                ]}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                  Go Offline
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  statusButtonIcon: {
    fontSize: 24,
  },
  statusButtonLabel: {
    fontSize: 13,
  },
  infoBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
  },
  compactToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusIcon: {
    fontSize: 14,
  },
  compactLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
