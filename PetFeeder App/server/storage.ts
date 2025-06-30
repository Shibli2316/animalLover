import { 
  users, devices, wifiNetworks, feedSchedules,
  type User, type InsertUser, 
  type Device, type InsertDevice,
  type WifiNetwork, type InsertWifiNetwork,
  type FeedSchedule, type InsertFeedSchedule,
  type DeviceRegistrationResponse
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUid(uid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Devices
  getDevice(id: number): Promise<Device | undefined>;
  getDeviceByDeviceId(deviceId: string): Promise<Device | undefined>;
  getUserDevices(userId: string): Promise<Device[]>;
  createDevice(userId: string, device: InsertDevice): Promise<Device>;
  updateDeviceStatus(deviceId: string, status: string): Promise<void>;
  updateDeviceLED(deviceId: string, ledStatus: boolean): Promise<void>;
  updateFoodLevel(deviceId: string, foodLevel: number): Promise<void>;
  recordFeedTime(deviceId: string): Promise<void>;

  // Feed Schedules
  getDeviceSchedules(deviceId: string): Promise<FeedSchedule[]>;
  createFeedSchedule(schedule: InsertFeedSchedule): Promise<FeedSchedule>;
  deleteFeedSchedule(id: number): Promise<void>;

  // WiFi Networks
  saveWifiNetworks(deviceSetupId: string, networks: InsertWifiNetwork[]): Promise<void>;
  getWifiNetworks(deviceSetupId: string): Promise<WifiNetwork[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private devices: Map<number, Device>;
  private wifiNetworks: Map<number, WifiNetwork>;
  private feedSchedules: Map<number, FeedSchedule>;
  private currentUserId: number;
  private currentDeviceId: number;
  private currentWifiId: number;
  private currentScheduleId: number;

  constructor() {
    this.users = new Map();
    this.devices = new Map();
    this.wifiNetworks = new Map();
    this.feedSchedules = new Map();
    this.currentUserId = 1;
    this.currentDeviceId = 1;
    this.currentWifiId = 1;
    this.currentScheduleId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUid(uid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.uid === uid);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async getDevice(id: number): Promise<Device | undefined> {
    return this.devices.get(id);
  }

  async getDeviceByDeviceId(deviceId: string): Promise<Device | undefined> {
    return Array.from(this.devices.values()).find(device => device.deviceId === deviceId);
  }

  async getUserDevices(userId: string): Promise<Device[]> {
    return Array.from(this.devices.values()).filter(device => device.userId === userId);
  }

  async createDevice(userId: string, insertDevice: InsertDevice): Promise<Device> {
    const id = this.currentDeviceId++;
    
    // Generate device ID from user email
    const user = Array.from(this.users.values()).find(u => u.uid === userId);
    if (!user) throw new Error("User not found");
    
    const emailPrefix = user.email.split('@')[0];
    const userDeviceCount = await this.getUserDevices(userId);
    const deviceNumber = String(userDeviceCount.length + 1).padStart(2, '0');
    const deviceId = `${emailPrefix}_esp${deviceNumber}`;
    const espEmail = `${deviceId}@petfeeder.com`;
    
    const device: Device = {
      ...insertDevice,
      id,
      userId,
      deviceId,
      espEmail,
      espPasswordHash: insertDevice.devicePassword, // TODO: Implement AES encryption
      status: "offline",
      foodLevel: 100,
      lastFed: null,
      ledStatus: false,
      createdAt: new Date()
    };
    
    this.devices.set(id, device);
    return device;
  }

  async updateDeviceStatus(deviceId: string, status: string): Promise<void> {
    const device = await this.getDeviceByDeviceId(deviceId);
    if (device) {
      device.status = status;
      this.devices.set(device.id, device);
    }
  }

  async updateDeviceLED(deviceId: string, ledStatus: boolean): Promise<void> {
    const device = await this.getDeviceByDeviceId(deviceId);
    if (device) {
      device.ledStatus = ledStatus;
      this.devices.set(device.id, device);
    }
  }

  async updateFoodLevel(deviceId: string, foodLevel: number): Promise<void> {
    const device = await this.getDeviceByDeviceId(deviceId);
    if (device) {
      device.foodLevel = foodLevel;
      this.devices.set(device.id, device);
    }
  }

  async recordFeedTime(deviceId: string): Promise<void> {
    const device = await this.getDeviceByDeviceId(deviceId);
    if (device) {
      device.lastFed = new Date();
      this.devices.set(device.id, device);
    }
  }

  async getDeviceSchedules(deviceId: string): Promise<FeedSchedule[]> {
    return Array.from(this.feedSchedules.values()).filter(schedule => schedule.deviceId === deviceId);
  }

  async createFeedSchedule(insertSchedule: InsertFeedSchedule): Promise<FeedSchedule> {
    const id = this.currentScheduleId++;
    const schedule: FeedSchedule = { 
      id,
      time: insertSchedule.time,
      deviceId: insertSchedule.deviceId,
      amount: insertSchedule.amount,
      enabled: insertSchedule.enabled ?? true
    };
    this.feedSchedules.set(id, schedule);
    return schedule;
  }

  async deleteFeedSchedule(id: number): Promise<void> {
    this.feedSchedules.delete(id);
  }

  async saveWifiNetworks(deviceSetupId: string, networks: InsertWifiNetwork[]): Promise<void> {
    for (const network of networks) {
      const id = this.currentWifiId++;
      const wifiNetwork: WifiNetwork = { ...network, id, deviceSetupId };
      this.wifiNetworks.set(id, wifiNetwork);
    }
  }

  async getWifiNetworks(deviceSetupId: string): Promise<WifiNetwork[]> {
    return Array.from(this.wifiNetworks.values()).filter(network => network.deviceSetupId === deviceSetupId);
  }
}

export const storage = new MemStorage();
