import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { firebase } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Settings, Utensils, Lightbulb, Clock, Plus, SlidersHorizontal } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { LoadingOverlay } from "@/components/loading-overlay";

export default function DeviceControlPage() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const deviceId = params.deviceId || "";
  const { user } = useAuth();
  
  const [isFeeding, setIsFeeding] = useState(false);
  const [ledStatus, setLedStatus] = useState(false);
  const [isUpdatingLED, setIsUpdatingLED] = useState(false);
  
  // Mock device data - in production, fetch from Firebase
  const device = {
    name: "Kitchen Feeder",
    deviceId: deviceId,
    status: "online",
    foodLevel: 75,
    lastFed: "2024-01-15T10:30:00Z",
    ledStatus: ledStatus
  };

  // Listen to LED status changes from Firebase
  useEffect(() => {
    if (!user?.uid || !deviceId) return;

    const unsubscribe = firebase.onDeviceLEDChange(user.uid, deviceId, (status) => {
      setLedStatus(status);
    });

    // Load initial LED status
    firebase.getDeviceLED(user.uid, deviceId).then(setLedStatus);

    return unsubscribe;
  }, [user?.uid, deviceId]);

  const handleFeedNow = () => {
    setIsFeeding(true);
    // Mock feed action - in production would send command to Firebase
    setTimeout(() => setIsFeeding(false), 2000);
  };

  const handleLEDToggle = async (checked: boolean) => {
    if (!user?.uid) return;
    
    setIsUpdatingLED(true);
    try {
      await firebase.updateDeviceLED(user.uid, deviceId, checked);
      // Firebase listener will update the local state
    } catch (error) {
      console.error("Failed to update LED:", error);
    } finally {
      setIsUpdatingLED(false);
    }
  };

  const formatLastFed = (date: string) => {
    const now = new Date();
    const fedTime = new Date(date);
    const diff = now.getTime() - fedTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours === 1) return "1 hour ago";
    return `${hours} hours ago`;
  };

  const mockSchedules = [
    { time: "8:00 AM", amount: "50g" },
    { time: "1:00 PM", amount: "50g" },
    { time: "7:00 PM", amount: "50g" }
  ];

  return (
    <div className="mobile-container animate-slide-up">
      <LoadingOverlay visible={isFeeding} message="Feeding your pet..." />
      
      {/* Header */}
      <div className="mobile-header flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 mr-3"
            onClick={() => setLocation("/dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{device.name}</h1>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm text-green-600 dark:text-green-400">Online</span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* Device Status Cards */}
      <div className="p-6 space-y-6">
        {/* Food Level Card */}
        <Card className="shadow-md border border-gray-200 dark:border-gray-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Food Level</h3>
              <Utensils className="text-primary text-xl" />
            </div>
            <div className="flex items-end space-x-4">
              <div className="text-3xl font-bold text-primary">{device.foodLevel}%</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>Approx. 850g remaining</p>
                <p>Good for ~5 days</p>
              </div>
            </div>
            <div className="mt-4 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{width: `${device.foodLevel}%`}}
              />
            </div>
          </CardContent>
        </Card>

        {/* Manual Feed Card */}
        <Card className="shadow-md border border-gray-200 dark:border-gray-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Manual Feed</h3>
              <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/>
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Last fed: <span>{formatLastFed(device.lastFed)}</span>
            </p>
            
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleFeedNow}
                disabled={isFeeding}
                className="flex-1 bg-primary hover:bg-orange-600 text-white py-3 rounded-xl font-medium flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Utensils className="h-5 w-5" />
                <span>Feed Now</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200"
              >
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* LED Control Card */}
        <Card className="shadow-md border border-gray-200 dark:border-gray-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Device LED</h3>
              <Lightbulb className={`text-xl ${ledStatus ? 'text-yellow-500' : 'text-gray-400'}`} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-600 dark:text-gray-300">Status Light</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {ledStatus ? 'LED is ON' : 'LED is OFF'}
                </p>
              </div>
              <Switch
                checked={ledStatus}
                onCheckedChange={handleLEDToggle}
                disabled={isUpdatingLED}
              />
            </div>
            {isUpdatingLED && (
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">Updating LED status...</p>
            )}
          </CardContent>
        </Card>

        {/* Schedule Card */}
        <Card className="shadow-md border border-gray-200 dark:border-gray-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Feed Schedule</h3>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5 text-primary" />
              </Button>
            </div>
            <div className="space-y-3">
              {mockSchedules.map((schedule, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{schedule.time}</span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{schedule.amount}</span>
                </div>
              ))}
            </div>
            <Button 
              variant="outline"
              className="w-full mt-4 border border-primary text-primary hover:bg-primary hover:text-white py-2 rounded-lg transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Schedule
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
