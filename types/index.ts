// src/types/index.ts

export type UserRole = "admin" | "user";
export type WaterSource = "Tank" | "Borehole" | "Well" | "River";
export type SystemStatus = "online" | "offline" | "idle";
export type IrrigationZone = "A" | "B" | "C";
export type IrrigationCommand = "start" | "stop";
export type CommandStatus = "pending" | "executed" | "failed";
export type NotificationType = "critical" | "warning" | "success" | "info";
export type ConnectionStatus = "online" | "offline";
export type LogEventType =
  | "device_connected"
  | "device_disconnected"
  | "irrigation_started"
  | "irrigation_stopped"
  | "user_login"
  | "user_registered"
  | "pump_failure"
  | "low_water"
  | "rain_detected"
  | "sensor_reading"
  | "command_issued"
  | "settings_updated";

// Auth

export interface AuthUser {
  $id: string;
  name: string;
  email: string;
  role: UserRole;
  labels?: string[];
  $createdAt: string;
}

export interface UserMeta {
  $id: string;
  userId: string;
  role: UserRole;
  phone?: string;
  farmId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

// Farm

export interface Farm {
  $id: string;
  userId: string;
  name: string;
  location: string;
  deviceId: string;
  zones: number;
  waterSource: WaterSource;
  createdAt: string;
}

// Sensor Data

export interface SensorReading {
  $id: string;
  deviceId: string;
  soilMoisture1: number;
  soilMoisture2: number;
  temperature: number;
  humidity: number;
  rainDetected: boolean;
  flowRate: number;
  waterUsedToday: number;
  tankLevel: number;
  pumpOn: boolean;
  systemStatus: SystemStatus;
  $createdAt: string;
}

// Device

export interface Device {
  $id: string;
  userId: string;
  farmId?: string;
  deviceId: string;
  name: string;
  firmwareVersion: string;
  wifiName?: string;
  signalStrength?: string;
  connectionStatus: ConnectionStatus;
  lastSeenAt?: string;
  createdAt: string;
}

// Device Command

export interface DeviceCommand {
  $id: string;
  deviceId: string;
  farmId?: string;
  issuedBy?: string;
  command: IrrigationCommand;
  zone?: IrrigationZone;
  duration?: number;
  status: CommandStatus;
  issuedAt: string;
  executedAt?: string;
  errorMsg?: string;
}

// Schedule

export type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export interface IrrigationSchedule {
  $id: string;
  farmId: string;
  zone: IrrigationZone;
  days: DayOfWeek[];
  startTime: string;
  duration: number;
  enabled: boolean;
}

// Automation

export interface AutomationSettings {
  $id: string;
  farmId: string;
  moistureThreshold: number;
  maxIrrigationTime: number;
  minTimeBetween: number;
  stopOnRain: boolean;
  reduceOnHumidity: boolean;
  increaseOnTemp: boolean;
  morningStart: string;
  morningEnd: string;
  eveningStart: string;
  eveningEnd: string;
}

// Notification

export interface AppNotification {
  $id: string;
  userId: string;
  farmId?: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  $createdAt: string;
}

// System Log

export interface SystemLog {
  $id: string;
  deviceId?: string;
  userId?: string;
  farmId?: string;
  eventType: LogEventType;
  description: string;
  metadata?: Record<string, string | number | boolean>;
  $createdAt: string;
}

// Irrigation Record (log)

export interface IrrigationRecord {
  $id: string;
  userId: string;
  farmId: string;
  farmName: string;
  userName: string;
  deviceId: string;
  zone: IrrigationZone;
  startTime: string;
  endTime?: string;
  durationMinutes: number;
  waterUsedLitres: number;
  triggeredBy: "manual" | "schedule" | "automation";
}

// Admin Stats

export interface AdminStats {
  totalUsers: number;
  totalDevices: number;
  devicesOnline: number;
  devicesOffline: number;
  irrigationSessionsToday: number;
}

// API Response

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
