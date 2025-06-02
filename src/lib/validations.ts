import { z } from 'zod';

export const generateTitleSchema = z.object({
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must not exceed 1000 characters'),
  platform: z.enum(['youtube', 'instagram', 'tiktok'], {
    errorMap: () => ({ message: 'Invalid platform selected' })
  }),
  targetAudience: z.string().optional(),
});

export const userSettingsSchema = z.object({
  defaultPlatform: z.enum(['youtube', 'instagram', 'tiktok']),
  emailNotifications: z.boolean(),
  customPromptPreferences: z.object({
    includeEmojis: z.boolean(),
    includeBrackets: z.boolean(),
    useHashtags: z.boolean(),
  }),
  language: z.string().min(2).max(5),
});

export const analyticsQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
}).refine(
  (data) => {
    if (data.from && data.to) {
      return new Date(data.from) <= new Date(data.to);
    }
    return true;
  },
  {
    message: "End date must be after start date",
    path: ["to"],
  }
);

export const stripePaymentSchema = z.object({
  priceType: z.enum(['pay_per_use', 'subscription'], {
    errorMap: () => ({ message: 'Invalid payment option selected' })
  }),
}); 