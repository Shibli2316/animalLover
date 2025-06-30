import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Wifi, Eye, EyeOff, Info } from "lucide-react";
import { useLocation } from "wouter";
import { LoadingOverlay } from "@/components/loading-overlay";
import { WiFiSignal } from "@/components/wifi-signal";
import { crypto } from "@/lib/crypto";
import { useForm } from "react-hook-form";

interface FormData {
  wifiPassword: string;
}

export default function WiFiPasswordPage() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Get selected network from localStorage
  const selectedNetwork = JSON.parse(localStorage.getItem('selectedNetwork') || '{}');
  const deviceSetup = JSON.parse(localStorage.getItem('deviceSetup') || '{}');
  
  const form = useForm<FormData>({
    defaultValues: {
      wifiPassword: ""
    }
  });

  const onSubmit = async (data: FormData) => {
    setIsConnecting(true);
    
    try {
      // Prepare encrypted payload for ESP32
      const payload = {
        ssid: selectedNetwork.ssid,
        password: data.wifiPassword,
        apiKey: deviceSetup.apiKey,
        databaseUrl: deviceSetup.databaseUrl,
        espEmail: deviceSetup.espEmail,
        espPassword: deviceSetup.espPassword || "default-password"
      };
      
      const encryptedPayload = await crypto.encryptWiFiPayload(payload);
      
      // Send to backend (which would forward to ESP32)
      const response = await fetch('/api/wifi/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ssid: selectedNetwork.ssid,
          password: data.wifiPassword,
          encryptedPayload
        }),
      });
      
      if (response.ok) {
        setLocation("/setup-progress");
      } else {
        throw new Error("Connection failed");
      }
    } catch (error) {
      console.error("WiFi connection failed:", error);
      setIsConnecting(false);
    }
  };

  return (
    <div className="mobile-container animate-slide-up">
      <LoadingOverlay visible={isConnecting} message="Connecting PetFeeder to WiFi..." />
      
      {/* Header */}
      <div className="mobile-header flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 mr-3"
          onClick={() => setLocation("/wifi-scan")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Enter WiFi Password</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{selectedNetwork.ssid || "Manual Entry"}</p>
        </div>
      </div>

      {/* Form */}
      <div className="p-6">
        {selectedNetwork.ssid && (
          <Card className="mb-6 border border-gray-200 dark:border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <WiFiSignal rssi={selectedNetwork.rssi} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedNetwork.ssid}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedNetwork.security} • Excellent signal
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="wifiPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              WiFi Password
            </Label>
            <div className="relative">
              <Input
                id="wifiPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Enter WiFi password"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-12"
                {...form.register("wifiPassword", { required: "WiFi password is required" })}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {form.formState.errors.wifiPassword && (
              <p className="text-sm text-red-600 dark:text-red-400">{form.formState.errors.wifiPassword.message}</p>
            )}
          </div>

          <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Info className="text-blue-600 dark:text-blue-400 text-lg mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">Connection Process</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Your PetFeeder will connect to this network and restart. This may take up to 2 minutes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={isConnecting}
            className="w-full bg-primary hover:bg-orange-600 text-white py-3 rounded-xl font-medium flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Wifi className="h-5 w-5" />
            <span>Connect PetFeeder</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
