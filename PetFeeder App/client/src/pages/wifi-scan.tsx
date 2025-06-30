import { useState, useEffect } from "react";
import { useWiFiScan } from "@/hooks/use-devices";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Wifi, RefreshCw, Plus, ChevronRight, Lock } from "lucide-react";
import { useLocation } from "wouter";
import { LoadingOverlay } from "@/components/loading-overlay";
import { WiFiSignal } from "@/components/wifi-signal";

export default function WiFiScanPage() {
  const [, setLocation] = useLocation();
  const [deviceSetupId] = useState(() => Date.now().toString());
  const [isConnecting, setIsConnecting] = useState(false);
  
  const { data: wifiData, isLoading, refetch } = useWiFiScan(deviceSetupId);

  useEffect(() => {
    // Simulate connecting to PetFeeder WiFi
    setIsConnecting(true);
    const timer = setTimeout(() => {
      setIsConnecting(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleNetworkSelect = (network: any) => {
    // Store selected network and navigate to password screen
    localStorage.setItem('selectedNetwork', JSON.stringify(network));
    setLocation("/wifi-password");
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleManualEntry = () => {
    // Navigate to manual network entry
    setLocation("/wifi-password");
  };

  return (
    <div className="mobile-container animate-slide-up">
      <LoadingOverlay visible={isConnecting} message="Connecting to PetFeeder device..." />
      
      {/* Header */}
      <div className="mobile-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 mr-3"
              onClick={() => setLocation("/add-device")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">WiFi Setup</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Connected to PetFeeder</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Scanning Status */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-6 py-3">
        <div className="flex items-center space-x-3">
          <div className="animate-pulse">
            <Wifi className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-sm text-blue-700 dark:text-blue-300">
            {isLoading ? "Scanning for WiFi networks..." : "WiFi networks found"}
          </span>
        </div>
      </div>

      {/* Network List */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Available Networks</h3>
        
        <div className="space-y-3">
          {wifiData?.networks?.map((network: any, index: number) => (
            <Button
              key={index}
              variant="outline"
              className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 h-auto"
              onClick={() => handleNetworkSelect(network)}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <WiFiSignal rssi={network.rssi} className="mr-3" />
                    {network.security !== "Open" && (
                      <Lock className="h-4 w-4 text-gray-400 mr-2" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white">{network.ssid}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {network.security} • {network.rssi} dBm
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </Button>
          ))}
        </div>

        {/* Manual Network Entry */}
        <Button
          variant="outline"
          className="w-full mt-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
          onClick={handleManualEntry}
        >
          <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400">
            <Plus className="h-5 w-5" />
            <span>Enter network manually</span>
          </div>
        </Button>
      </div>
    </div>
  );
}
