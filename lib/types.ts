import { z } from "zod";

// Profile schema
export const profileSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().nullable(),
  created_at: z.string().datetime(),
});

export type Profile = z.infer<typeof profileSchema>;

// Location schema
export const locationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number().nullable(),
  battery_level: z.number().nullable(),
  recorded_at: z.string().datetime(),
});

export type Location = z.infer<typeof locationSchema>;

// Alert schema
export const alertSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  radius: z.number().nullable(), // in meters
  created_at: z.string().datetime(),
  active: z.boolean(),
});

export type Alert = z.infer<typeof alertSchema>;

// Log schema
export const logSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  action: z.string().nullable(),
  metadata: z.record(z.any()).nullable(),
  created_at: z.string().datetime(),
});

export type Log = z.infer<typeof logSchema>;

// Form schemas for validation
export const createAlertSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radius: z.number().min(1).optional(), // in meters
  active: z.boolean().default(true),
});

export type CreateAlertInput = z.infer<typeof createAlertSchema>;

export const updateProfileSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const createLocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number().optional(),
  battery_level: z.number().optional(),
});

export type CreateLocationInput = z.infer<typeof createLocationSchema>;
