import { create } from "zustand";

export interface SensorData {
  soilMoisture1: number;
  soilMoisture2: number;
  temperature: number;
  humidity: number;
  rainDetected: boolean;
  flowRate: number;
  waterUsedToday: number;
  tankLevel: number;
  pumpOn: boolean;
  fertPump: boolean;
  tds: number;
  systemStatus: "online" | "offline" | "idle";
  deviceId?: string;
  updatedAt: string;
}

interface SensorStore {
  data: SensorData | null;
  lastSeen: number | null;
  isOnline: boolean;
  setData: (data: SensorData) => void;
}

export const useSensorStore = create<SensorStore>((set) => ({
  data: null,
  lastSeen: null,
  isOnline: false,

  setData: (data) =>
    set({
      data,
      lastSeen: Date.now(),
      isOnline: true,
    }),
}));
