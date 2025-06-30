import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { firebase } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, AlertCircle, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { LoadingOverlay } from "@/components/loading-overlay";

export default function SetupProgressPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [setupSteps, setSetupSteps] = useState([
    { id: 1, title: "Device Created", description: "Firebase account configured", status: "completed" },
    { id: 2, title: "WiFi Connected", description: "PetFeeder connected to network", status: "completed" },
    { id: 3, title: "Device Online", description: "Waiting for device to connect...", status: "pending" },
    { id: 4, title: "Ready to Use", description: "Device is ready for control", status: "pending" }
  ]);
  const [deviceOnline, setDeviceOnline] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);

  const deviceSetup = JSON.parse(localStorage.getItem('deviceSetup') || '{}');

  useEffect(() => {
    if (!user?.uid || !deviceSetup.deviceId) return;

    // Check device online status
    const checkDeviceStatus = async () => {
      try {
        // Check if device is online in Firebase
        const deviceStatus = await firebase.getValue(`users/${user.uid}/devices/${deviceSetup.deviceId}/status`);
        
        if (deviceStatus === 'online') {
          setDeviceOnline(true);
          setSetupSteps(prev => prev.map(step => ({
            ...step,
            status: 'completed'
          })));
        }
      } catch (error) {
        console.error("Failed to check device status:", error);
      }
    };

    // Check every 3 seconds for device to come online
    const interval = setInterval(checkDeviceStatus, 3000);
    
    // Stop checking after 60 seconds
    setTimeout(() => {
      setCheckingConnection(false);
      clearInterval(interval);
      
      if (!deviceOnline) {
        setSetupSteps(prev => prev.map(step => 
          step.id === 3 ? { ...step, status: 'failed', description: "Device not responding" } : step
        ));
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [user?.uid, deviceSetup.deviceId, deviceOnline]);

  const handleContinue = () => {
    localStorage.removeItem('deviceSetup');
    localStorage.removeItem('selectedNetwork');
    setLocation("/dashboard");
  };

  const handleRetry = () => {
    setLocation("/wifi-scan");
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "pending":
        return <Clock className="h-6 w-6 text-blue-500 animate-pulse" />;
      case "failed":
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-400" />;
    }
  };

  return (
    <div className="mobile-container animate-slide-up">
      <LoadingOverlay visible={false} />
      
      {/* Header */}
      <div className="mobile-header">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Setting Up PetFeeder</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{deviceSetup.deviceId || "Device"}</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="p-6">
        <div className="space-y-4">
          {setupSteps.map((step, index) => (
            <Card key={step.id} className="border border-gray-200 dark:border-gray-600">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  {getStepIcon(step.status)}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{step.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{step.description}</p>
                  </div>
                  {step.status === "completed" && (
                    <div className="text-green-500 text-sm font-medium">Done</div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Status Messages */}
        {checkingConnection && (
          <Card className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-pulse" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">Connecting...</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Your PetFeeder is connecting to Firebase. This may take up to 1 minute.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {deviceOnline && (
          <Card className="mt-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100">Setup Complete!</p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Your PetFeeder is now online and ready to use.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!checkingConnection && !deviceOnline && (
          <Card className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <div>
                  <p className="font-medium text-red-900 dark:text-red-100">Connection Timeout</p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Your PetFeeder isn't responding. Please check the device and try again.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="mt-8 space-y-3">
          {deviceOnline ? (
            <Button
              onClick={handleContinue}
              className="w-full bg-primary hover:bg-orange-600 text-white py-3 rounded-xl font-medium flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          ) : (
            <>
              <Button
                onClick={handleContinue}
                variant="outline"
                className="w-full border border-gray-300 dark:border-gray-600 py-3 rounded-xl font-medium"
              >
                Continue Anyway
              </Button>
              {!checkingConnection && (
                <Button
                  onClick={handleRetry}
                  className="w-full bg-primary hover:bg-orange-600 text-white py-3 rounded-xl font-medium"
                >
                  Retry Setup
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}