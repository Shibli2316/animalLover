import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { firebase } from "@/lib/firebase";
import { crypto } from "@/lib/crypto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Info, Shield, Eye, EyeOff, PlusCircle } from "lucide-react";
import { useLocation } from "wouter";
import { LoadingOverlay } from "@/components/loading-overlay";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDeviceSchema } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

type FormData = z.infer<typeof insertDeviceSchema>;

export default function AddDevicePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(insertDeviceSchema),
    defaultValues: {
      name: "",
      devicePassword: ""
    }
  });

  const onSubmit = async (data: FormData) => {
    if (!user?.uid) {
      toast({
        title: "Authentication Error",
        description: "Please sign in to create a device",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    
    try {
      // Generate device ID from user email
      const emailPrefix = user.email.split('@')[0];
      const deviceId = `${emailPrefix}_esp01`; // For now, single device per user
      const espEmail = `${deviceId}@petfeeder.com`;
      
      // Encrypt the ESP password using AES
      const encryptedPassword = await crypto.encrypt(data.devicePassword);
      
      // Create device in Firebase Realtime Database
      await firebase.createDeviceInFirebase(user.uid, deviceId, {
        name: data.name,
        espEmail: espEmail,
        encryptedPassword: encryptedPassword.data,
        iv: encryptedPassword.iv
      });
      
      // Store device setup info for WiFi configuration
      const deviceSetup = {
        deviceId,
        espEmail,
        espPassword: data.devicePassword, // Keep plain for ESP transmission
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        databaseUrl: `https://${import.meta.env.VITE_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`
      };
      
      localStorage.setItem('deviceSetup', JSON.stringify(deviceSetup));
      
      toast({
        title: "Device Created",
        description: `${data.name} has been created successfully`,
      });
      
      setLocation("/wifi-scan");
      
    } catch (error) {
      console.error("Device creation failed:", error);
      toast({
        title: "Creation Failed",
        description: "Failed to create device. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="mobile-container animate-slide-up">
      <LoadingOverlay visible={isCreating} message="Creating device account..." />
      
      {/* Header */}
      <div className="mobile-header flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 mr-3"
          onClick={() => setLocation("/dashboard")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Add New PetFeeder</h1>
      </div>

      {/* Form */}
      <div className="p-6">
        <Card className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Info className="text-primary text-lg flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Setup Instructions</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Make sure your PetFeeder is powered on and broadcasting WiFi signal</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Device Name
            </Label>
            <Input
              id="name"
              placeholder="e.g., Kitchen Feeder, Buddy's Feeder"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600 dark:text-red-400">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="devicePassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Device Password
            </Label>
            <div className="relative">
              <Input
                id="devicePassword"
                type={showPassword ? "text" : "password"}
                placeholder="Create a secure password"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-12"
                {...form.register("devicePassword")}
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
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This password will be used for secure device authentication
            </p>
            {form.formState.errors.devicePassword && (
              <p className="text-sm text-red-600 dark:text-red-400">{form.formState.errors.devicePassword.message}</p>
            )}
          </div>

          <Card className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Shield className="text-yellow-600 dark:text-yellow-400 text-lg mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">Security Notice</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Your credentials are encrypted and stored securely. The device email will be auto-generated.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={isCreating}
            className="w-full bg-primary hover:bg-orange-600 text-white py-3 rounded-xl font-medium flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <PlusCircle className="h-5 w-5" />
            <span>Create Device</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
