import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertDeviceSchema, insertFeedScheduleSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUid(userData.uid);
      if (existingUser) {
        return res.json(existingUser);
      }
      
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.get("/api/auth/user/:uid", async (req, res) => {
    try {
      const { uid } = req.params;
      const user = await storage.getUserByUid(uid);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Device routes
  app.get("/api/devices/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const devices = await storage.getUserDevices(userId);
      res.json(devices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch devices" });
    }
  });

  app.post("/api/devices/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const deviceData = insertDeviceSchema.parse(req.body);
      
      const device = await storage.createDevice(userId, deviceData);
      
      // Return device registration response with Firebase config
      const response = {
        deviceId: device.deviceId,
        espEmail: device.espEmail,
        apiKey: process.env.FIREBASE_API_KEY || "default-api-key",
        databaseUrl: process.env.FIREBASE_DATABASE_URL || "https://petfeeder-default.firebaseio.com"
      };
      
      res.json(response);
    } catch (error) {
      res.status(400).json({ error: "Failed to create device" });
    }
  });

  app.put("/api/devices/:deviceId/led", async (req, res) => {
    try {
      const { deviceId } = req.params;
      const { ledStatus } = req.body;
      
      await storage.updateDeviceLED(deviceId, Boolean(ledStatus));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update LED status" });
    }
  });

  app.post("/api/devices/:deviceId/feed", async (req, res) => {
    try {
      const { deviceId } = req.params;
      
      await storage.recordFeedTime(deviceId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to record feed" });
    }
  });

  app.put("/api/devices/:deviceId/status", async (req, res) => {
    try {
      const { deviceId } = req.params;
      const { status } = req.body;
      
      await storage.updateDeviceStatus(deviceId, status);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update device status" });
    }
  });

  // WiFi scanning mock endpoint (simulates ESP32 response)
  app.get("/api/wifi/scan/:deviceSetupId", async (req, res) => {
    try {
      // Mock WiFi networks that would be returned by ESP32
      const mockNetworks = [
        { ssid: "HomeNetwork_5G", rssi: -45, security: "WPA2" },
        { ssid: "NeighborWiFi", rssi: -65, security: "WPA2" },
        { ssid: "GuestNetwork", rssi: -75, security: "Open" },
        { ssid: "CoffeeShop_WiFi", rssi: -80, security: "WPA2" }
      ];
      
      res.json({ networks: mockNetworks });
    } catch (error) {
      res.status(500).json({ error: "Failed to scan WiFi networks" });
    }
  });

  // WiFi connection endpoint (simulates ESP32 connect)
  app.post("/api/wifi/connect", async (req, res) => {
    try {
      const { ssid, password, encryptedPayload } = req.body;
      
      // TODO: Decrypt payload and validate
      // TODO: Send to actual ESP32 device
      
      // Mock successful connection
      setTimeout(() => {
        res.json({ success: true, message: "Device connected successfully" });
      }, 2000);
    } catch (error) {
      res.status(500).json({ error: "Failed to connect device" });
    }
  });

  // Feed schedule routes
  app.get("/api/schedules/:deviceId", async (req, res) => {
    try {
      const { deviceId } = req.params;
      const schedules = await storage.getDeviceSchedules(deviceId);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch schedules" });
    }
  });

  app.post("/api/schedules", async (req, res) => {
    try {
      const scheduleData = insertFeedScheduleSchema.parse(req.body);
      const schedule = await storage.createFeedSchedule(scheduleData);
      res.json(schedule);
    } catch (error) {
      res.status(400).json({ error: "Failed to create schedule" });
    }
  });

  app.delete("/api/schedules/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteFeedSchedule(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete schedule" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
