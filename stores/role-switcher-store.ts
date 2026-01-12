import { create } from 'zustand';

export type UserRole = 'customer' | 'tasker';

interface RoleSwitcherState {
  currentRole: UserRole;
  availableRoles: UserRole[];
  setRole: (role: UserRole) => void;
  switchRole: (role: UserRole) => void;
}

export const useRoleSwitcherStore = create<RoleSwitcherState>((set) => ({
  currentRole: 'customer',
  availableRoles: ['customer', 'tasker'],
  setRole: (role: UserRole) => set({ currentRole: role }),
  switchRole: (role: UserRole) => set({ currentRole: role }),
}));
