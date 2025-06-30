import { useAuth } from "@/hooks/use-auth";
import { firebase } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/components/theme-provider";
import { Moon, Sun, User, Plus, Heart, Wifi, Utensils } from "lucide-react";
import { useLocation } from "wouter";
import { LoadingOverlay } from "@/components/loading-overlay";
import { useState, useEffect } from "react";

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [devices, setDevices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load devices from Firebase
  useEffect(() => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }

    const loadDevices = async () => {
      try {
        const devicesData = await firebase.getValue(`users/${user.uid}/devices`);
        if (devicesData) {
          const deviceList = Object.entries(devicesData).map(([deviceId, data]: [string, any]) => ({
            deviceId,
            ...data
          }));
          setDevices(deviceList);
        } else {
          setDevices([]);
        }
      } catch (error) {
        console.error("Failed to load devices:", error);
        setDevices([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDevices();
  }, [user?.uid]);

  const handleAddDevice = () => {
    setLocation("/add-device");
  };

  const handleDeviceControl = (deviceId: string) => {
    setLocation(`/device/${deviceId}`);
  };

  const formatLastFed = (date: string | null) => {
    if (!date) return "Never";
    const now = new Date();
    const fedTime = new Date(date);
    const diff = now.getTime() - fedTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours === 1) return "1 hour ago";
    return `${hours} hours ago`;
  };

  return (
    <div className="mobile-container animate-fade-in">
      <LoadingOverlay visible={isLoading} message="Loading your devices..." />
      
      {/* Header */}
      <div className="mobile-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Pet Feeders</h1>
            <p className="text-gray-600 dark:text-gray-300">Welcome back, {user?.displayName || user?.email}</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-gray-100 dark:bg-gray-700"
              onClick={toggleTheme}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-gray-100 dark:bg-gray-700"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* User Menu */}
        {showUserMenu && (
          <div className="absolute right-6 top-20 bg-white dark:bg-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 py-2 z-50">
            <button
              onClick={signOut}
              className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {!devices || devices.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center px-6 py-12 h-96">
          <div className="w-32 h-32 mb-6 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
            <Heart className="text-primary text-4xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Pet Feeders Yet</h3>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
            Add your first PetFeeder device to start taking care of your furry friends remotely
          </p>
          <Button 
            onClick={handleAddDevice}
            className="bg-primary hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-5 w-5" />
            <span>Add PetFeeder</span>
          </Button>
        </div>
      ) : (
        /* Device List */
        <div className="p-6 space-y-4">
          {devices.map((device: any) => (
            <Card 
              key={device.id} 
              className="border border-gray-200 dark:border-gray-600 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => handleDeviceControl(device.deviceId)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{device.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{device.deviceId}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${device.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                    <span className={`text-sm ${device.status === 'online' ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                      {device.status === 'online' ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{device.foodLevel}%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Food Level</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-300">{formatLastFed(device.lastFed)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Last Fed</p>
                    </div>
                  </div>
                  <Button 
                    className="bg-primary hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle feed now action
                    }}
                  >
                    <Utensils className="h-4 w-4" />
                    <span>Feed Now</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Floating Add Button */}
      <Button 
        onClick={handleAddDevice}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-orange-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
