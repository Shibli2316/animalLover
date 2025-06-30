import { pgTable, text, serial, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(), // Firebase UID
  email: text("email").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Firebase UID
  deviceId: text("device_id").notNull().unique(), // ESP email prefix
  name: text("name").notNull(),
  espEmail: text("esp_email").notNull(),
  espPasswordHash: text("esp_password_hash").notNull(), // AES encrypted
  status: text("status").notNull().default("offline"), // online/offline
  foodLevel: real("food_level").default(100), // percentage
  lastFed: timestamp("last_fed"),
  ledStatus: boolean("led_status").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const wifiNetworks = pgTable("wifi_networks", {
  id: serial("id").primaryKey(),
  ssid: text("ssid").notNull(),
  rssi: text("rssi").notNull(),
  security: text("security").notNull(),
  deviceSetupId: text("device_setup_id").notNull(),
});

export const feedSchedules = pgTable("feed_schedules", {
  id: serial("id").primaryKey(),
  deviceId: text("device_id").notNull(),
  time: text("time").notNull(), // "08:00", "13:00", etc.
  amount: real("amount").notNull(), // grams
  enabled: boolean("enabled").default(true),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertDeviceSchema = createInsertSchema(devices).omit({
  id: true,
  userId: true,
  deviceId: true,
  espEmail: true,
  espPasswordHash: true,
  status: true,
  foodLevel: true,
  lastFed: true,
  ledStatus: true,
  createdAt: true,
}).extend({
  devicePassword: z.string().min(8),
});

export const insertWifiNetworkSchema = createInsertSchema(wifiNetworks).omit({
  id: true,
});

export const insertFeedScheduleSchema = createInsertSchema(feedSchedules).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Device = typeof devices.$inferSelect;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type WifiNetwork = typeof wifiNetworks.$inferSelect;
export type InsertWifiNetwork = z.infer<typeof insertWifiNetworkSchema>;
export type FeedSchedule = typeof feedSchedules.$inferSelect;
export type InsertFeedSchedule = z.infer<typeof insertFeedScheduleSchema>;

// API Response types
export type DeviceRegistrationResponse = {
  deviceId: string;
  espEmail: string;
  apiKey: string;
  databaseUrl: string;
};

export type WifiScanResponse = {
  networks: Array<{
    ssid: string;
    rssi: number;
    security: string;
  }>;
};
