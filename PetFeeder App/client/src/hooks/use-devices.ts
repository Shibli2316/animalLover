import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type Device, type InsertDevice, type DeviceRegistrationResponse } from "@shared/schema";

export function useDevices(userId: string | null) {
  return useQuery({
    queryKey: [`/api/devices/${userId}`],
    enabled: !!userId,
  });
}

export function useCreateDevice(userId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (device: InsertDevice): Promise<DeviceRegistrationResponse> => {
      const response = await apiRequest("POST", `/api/devices/${userId}`, device);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/devices/${userId}`] });
    },
  });
}

export function useUpdateDeviceLED() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ deviceId, ledStatus }: { deviceId: string; ledStatus: boolean }) => {
      const response = await apiRequest("PUT", `/api/devices/${deviceId}/led`, { ledStatus });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
    },
  });
}

export function useFeedDevice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (deviceId: string) => {
      const response = await apiRequest("POST", `/api/devices/${deviceId}/feed`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
    },
  });
}

export function useWiFiScan(deviceSetupId: string | null) {
  return useQuery({
    queryKey: [`/api/wifi/scan/${deviceSetupId}`],
    enabled: !!deviceSetupId,
    refetchInterval: 45000, // Auto-refresh every 45 seconds
  });
}
