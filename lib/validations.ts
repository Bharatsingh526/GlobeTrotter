import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export const signupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

export const tripSchema = z.object({
  title: z.string().min(1, { message: 'Trip title is required' }),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  startDate: z.coerce.date({ required_error: 'Start date is required' }),
  endDate: z.coerce.date({ required_error: 'End date is required' }),
}).refine((data) => data.endDate >= data.startDate, {
  message: 'End date cannot be before the start date',
  path: ['endDate'],
});

export const tripStopSchema = z.object({
  cityId: z.string().min(1, { message: 'City is required' }),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  notes: z.string().optional(),
}).refine((data) => data.endDate >= data.startDate, {
  message: 'End date cannot be before start date',
  path: ['endDate'],
});

export const itineraryItemSchema = z.object({
  activityId: z.string().min(1, { message: 'Activity is required' }),
  date: z.coerce.date(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Invalid time format (HH:MM)' }).optional().nullable(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Invalid time format (HH:MM)' }).optional().nullable(),
  customCost: z.number().nonnegative().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const expenseSchema = z.object({
  category: z.enum(['TRANSPORT', 'ACCOMMODATION', 'ACTIVITY', 'FOOD', 'OTHER'], {
    errorMap: () => ({ message: 'Invalid expense category' }),
  }),
  amount: z.number().positive({ message: 'Amount must be greater than zero' }),
  currency: z.string().default('USD'),
  description: z.string().min(1, { message: 'Description is required' }),
  expenseDate: z.coerce.date({ required_error: 'Expense date is required' }),
});

export const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
  avatarUrl: z.string().url({ message: 'Invalid URL format' }).or(z.literal('')).optional(),
  language: z.string().default('English'),
});
