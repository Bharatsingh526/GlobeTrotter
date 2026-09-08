'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tripSchema } from '@/lib/validations';
import { z } from 'zod';
import { Loader2, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/navigation/Navbar';

type TripFormValues = z.infer<typeof tripSchema>;

// Curated travel cover images they can select from
const COVER_IMAGES = [
  { name: 'Mountain', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800' },
  { name: 'Beach', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800' },
  { name: 'Europe Canal', url: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&q=80&w=800' },
  { name: 'Kyoto Pagoda', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800' },
  { name: 'City skyline', url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=800' }
];

export default function NewTripPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCover, setSelectedCover] = useState(COVER_IMAGES[0].url);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      title: '',
      description: '',
      coverImage: COVER_IMAGES[0].url,
      // Default dates from today to 5 days later
      startDate: new Date(),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  });

  const selectCover = (url: string) => {
    setSelectedCover(url);
    setValue('coverImage', url);
  };

  const onSubmit = async (values: TripFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to create trip. Please try again.');
        setIsLoading(false);
        return;
      }

      router.push(`/trips/${data.id}/builder`);
      router.refresh();
    } catch (e: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-background flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-3xl mx-auto w-full px-4 sm:px-6 py-12">
        {/* Back Link */}
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-brand-muted hover:text-brand-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <span className="text-xs font-bold text-brand-accent uppercase tracking-widest">
            New Adventure
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-brand-dark mt-1">
            Plan your next journey
          </h1>
        </div>

        {/* Form panel */}
        <div className="bg-brand-surface border border-brand-border/60 rounded-3xl p-6 md:p-8 shadow-premium">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-brand-accent/10 border border-brand-accent/30 text-brand-accent text-sm rounded-xl p-3 font-semibold">
                {error}
              </div>
            )}

            {/* Trip Title */}
            <div>
              <label htmlFor="title" className="block text-xs font-bold text-brand-dark uppercase tracking-wider">
                Trip Name
              </label>
              <input
                id="title"
                type="text"
                {...register('title')}
                className="mt-1.5 block w-full px-4 py-3 bg-brand-background rounded-full border border-brand-border/60 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-sm font-semibold transition-all"
                placeholder="e.g. European Summer Escapade"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-brand-accent font-semibold">{errors.title.message}</p>
              )}
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="startDate" className="block text-xs font-bold text-brand-dark uppercase tracking-wider">
                  Start Date
                </label>
                <input
                  id="startDate"
                  type="date"
                  {...register('startDate')}
                  className="mt-1.5 block w-full px-4 py-3 bg-brand-background rounded-full border border-brand-border/60 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-sm font-semibold transition-all"
                />
                {errors.startDate && (
                  <p className="mt-1 text-xs text-brand-accent font-semibold">{errors.startDate.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="endDate" className="block text-xs font-bold text-brand-dark uppercase tracking-wider">
                  End Date
                </label>
                <input
                  id="endDate"
                  type="date"
                  {...register('endDate')}
                  className="mt-1.5 block w-full px-4 py-3 bg-brand-background rounded-full border border-brand-border/60 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-sm font-semibold transition-all"
                />
                {errors.endDate && (
                  <p className="mt-1 text-xs text-brand-accent font-semibold">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-xs font-bold text-brand-dark uppercase tracking-wider">
                Description (Optional)
              </label>
              <textarea
                id="description"
                rows={3}
                {...register('description')}
                className="mt-1.5 block w-full px-4 py-3 bg-brand-background rounded-2xl border border-brand-border/60 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-sm font-semibold transition-all resize-none"
                placeholder="Briefly describe what this trip is about..."
              />
              {errors.description && (
                <p className="mt-1 text-xs text-brand-accent font-semibold">{errors.description.message}</p>
              )}
            </div>

            {/* Cover Image Selector */}
            <div>
              <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">
                Select Cover Theme
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {COVER_IMAGES.map((img) => (
                  <button
                    key={img.name}
                    type="button"
                    onClick={() => selectCover(img.url)}
                    className={`relative h-16 rounded-xl overflow-hidden border-2 focus:outline-none cursor-pointer transition-all ${
                      selectedCover === img.url ? 'border-brand-primary scale-[1.03]' : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 flex items-end p-1">
                      <span className="text-[8px] font-bold text-white uppercase truncate">{img.name}</span>
                    </div>
                  </button>
                ))}
              </div>
              <input type="hidden" {...register('coverImage')} />
            </div>

            {/* Buttons */}
            <div className="border-t border-brand-border/60 pt-6 flex justify-end gap-3">
              <Link
                href="/dashboard"
                className="px-6 py-2.5 rounded-full border border-brand-border/80 text-brand-muted hover:bg-brand-background font-semibold text-xs uppercase tracking-wider transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-brand-primary hover:bg-brand-primary/95 text-brand-surface text-xs font-bold uppercase tracking-wider px-8 py-3 rounded-full shadow-premium hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 select-none cursor-pointer flex items-center gap-1.5"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Create Trip'
                )}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}
