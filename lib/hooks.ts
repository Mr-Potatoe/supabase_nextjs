import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  createAlert, 
  createLocation, 
  deleteAlert, 
  getAlert, 
  getAlerts, 
  getLocations, 
  getLocationsByDateRange, 
  getLogs, 
  getProfile, 
  updateAlert, 
  updateProfile 
} from "./api";
import { createLocationClient, getLocationsClient } from "./client-api";
import { CreateAlertInput, CreateLocationInput, UpdateProfileInput } from "./types";

// Profile hooks
export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => getProfile(),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateProfileInput) => updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

// Location hooks
export function useLocations(limit = 100, offset = 0) {
  return useQuery({
    queryKey: ["locations", { limit, offset }],
    queryFn: () => getLocations(limit, offset),
  });
}

export function useLocationsByDateRange(startDate: Date, endDate: Date) {
  return useQuery({
    queryKey: ["locations", { startDate, endDate }],
    queryFn: () => getLocationsByDateRange(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
}

// Client-side version of useCreateLocation
export function useCreateLocation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateLocationInput) => createLocationClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
    onError: (error) => {
      console.error("Error in useCreateLocation mutation:", error);
    }
  });
}

// Alert hooks
export function useAlerts() {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: () => getAlerts(),
  });
}

export function useAlert(id: string) {
  return useQuery({
    queryKey: ["alerts", id],
    queryFn: () => getAlert(id),
    enabled: !!id,
  });
}

export function useCreateAlert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateAlertInput) => createAlert(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

export function useUpdateAlert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAlertInput> }) => 
      updateAlert(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

export function useDeleteAlert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

// Logs hooks
export function useLogs(limit = 50) {
  return useQuery({
    queryKey: ["logs", { limit }],
    queryFn: () => getLogs(limit),
  });
}
