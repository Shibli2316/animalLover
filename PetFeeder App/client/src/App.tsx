import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";

import AuthPage from "@/pages/auth";
import DashboardPage from "@/pages/dashboard";
import AddDevicePage from "@/pages/add-device";
import WiFiScanPage from "@/pages/wifi-scan";
import WiFiPasswordPage from "@/pages/wifi-password";
import DeviceControlPage from "@/pages/device-control";
import SetupProgressPage from "@/pages/setup-progress";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={AuthPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/add-device" component={AddDevicePage} />
      <Route path="/wifi-scan" component={WiFiScanPage} />
      <Route path="/wifi-password" component={WiFiPasswordPage} />
      <Route path="/setup-progress" component={SetupProgressPage} />
      <Route path="/device/:deviceId" component={DeviceControlPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
