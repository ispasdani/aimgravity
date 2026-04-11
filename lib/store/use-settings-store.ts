import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WeaponSettings {
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  scale: number;
}

interface SettingsState {
  weaponSettings: WeaponSettings;
  sensitivity: number;
  fov: number;
  tracersEnabled: boolean;
  
  // Actions
  toggleTracers: () => void;
  updateWeaponSettings: (settings: Partial<WeaponSettings>) => void;
  updateSensitivity: (sens: number) => void;
  updateFOV: (fov: number) => void;
  resetWeaponSettings: () => void;
}

const defaultWeaponSettings: WeaponSettings = {
  x: 0.15,
  y: -0.4,
  z: -0.6,
  yaw: -0.25,
  pitch: 0.15,
  scale: 1.1,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      weaponSettings: { ...defaultWeaponSettings },
      sensitivity: 2.0,
      fov: 90,
      tracersEnabled: true,

      updateWeaponSettings: (newSettings) =>
        set((state) => ({
          weaponSettings: { ...state.weaponSettings, ...newSettings },
        })),

      updateSensitivity: (sensitivity) => set({ sensitivity }),
      
      updateFOV: (fov) => set({ fov }),

      toggleTracers: () => set((state) => ({ tracersEnabled: !state.tracersEnabled })),

      resetWeaponSettings: () =>
        set({ weaponSettings: { ...defaultWeaponSettings } }),
    }),
    {
      name: 'aimgravity-settings', // name of the item in storage (must be unique)
    }
  )
);
