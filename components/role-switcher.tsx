import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useRoleSwitcherStore, UserRole } from '@/stores/role-switcher-store';
import { useColors } from '@/hooks/use-colors';

const ROLE_LABELS: Record<UserRole, string> = {
  customer: 'Customer',
  tasker: 'Tasker',
  vendor: 'Vendor',
};

const ROLE_ICONS: Record<UserRole, string> = {
  customer: '🛒',
  tasker: '🚴',
  vendor: '🏪',
};

const ROLE_ROUTES: Record<UserRole, string> = {
  customer: '/(tabs)',
  tasker: '/(tasker)/TaskerDashboard',
  vendor: '/(vendor)/VendorDashboard',
};

export function RoleSwitcher() {
  const colors = useColors();
  const router = useRouter();
  const { currentRole, availableRoles, switchRole } = useRoleSwitcherStore();
  const [modalVisible, setModalVisible] = useState(false);

  const handleRoleSwitch = async (role: UserRole) => {
    if (role === currentRole) {
      setModalVisible(false);
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await switchRole(role);
    setModalVisible(false);
    
    // Navigate to the appropriate dashboard
    router.replace(ROLE_ROUTES[role] as any);
  };

  // Only show switcher if user has multiple roles
  if (availableRoles.length <= 1) {
    return null;
  }

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setModalVisible(true);
        }}
        style={[styles.trigger, { backgroundColor: colors.surface }]}
      >
        <Text style={styles.icon}>{ROLE_ICONS[currentRole]}</Text>
        <Text style={[styles.label, { color: colors.foreground }]}>
          {ROLE_LABELS[currentRole]}
        </Text>
        <Text style={[styles.arrow, { color: colors.muted }]}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={[styles.modalContent, { backgroundColor: colors.background }]}
            onStartShouldSetResponder={() => true}
          >
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              Switch Role
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.muted }]}>
              Choose which role you want to use
            </Text>

            <View style={styles.roleList}>
              {availableRoles.map((role: string) => (
                <TouchableOpacity
                  key={role}
                  onPress={() => handleRoleSwitch(role)}
                  style={[
                    styles.roleOption,
                    { borderColor: colors.border },
                    role === currentRole && {
                      backgroundColor: colors.primary + '15',
                      borderColor: colors.primary,
                    },
                  ]}
                >
                  <Text style={styles.roleIcon}>{ROLE_ICONS[role]}</Text>
                  <View style={styles.roleInfo}>
                    <Text
                      style={[
                        styles.roleLabel,
                        { color: colors.foreground },
                        role === currentRole && { fontWeight: '600' },
                      ]}
                    >
                      {ROLE_LABELS[role]}
                    </Text>
                    {role === currentRole && (
                      <Text style={[styles.currentBadge, { color: colors.primary }]}>
                        Current
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={[styles.cancelButton, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.cancelText, { color: colors.foreground }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  icon: {
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  arrow: {
    fontSize: 10,
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
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  roleList: {
    gap: 12,
    marginBottom: 20,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 12,
  },
  roleIcon: {
    fontSize: 28,
  },
  roleInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleLabel: {
    fontSize: 16,
  },
  currentBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
