import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/navigation/Navbar';
import TripMap from '@/components/map/TripMap';
import {
  Calendar as CalendarIcon,
  Compass,
  DollarSign,
  Edit,
  Eye,
  Share2,
  Lock,
  Globe,
  ArrowLeft,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { formatDateRange, formatCurrency } from '@/lib/utils';
import ClientViewToggler from './ClientViewToggler';

export default async function TripDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const tripId = params.id;
  const userId = session.user.id;

  // 1. Fetch trip and confirm membership
  const member = await prisma.tripMember.findUnique({
    where: {
      tripId_userId: { tripId, userId },
    },
  });

  if (!member) {
    redirect('/dashboard');
  }

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      stops: {
        include: {
          city: true,
          itineraryItems: {
            include: {
              activity: true,
            },
            orderBy: {
              itemOrder: 'asc',
            },
          },
        },
        orderBy: {
          stopOrder: 'asc',
        },
      },
      expenses: true,
    },
  });

  if (!trip) {
    redirect('/dashboard');
  }

  // Calculate totals
  let totalCost = 0;
  let activityCount = 0;

  trip.stops.forEach((stop) => {
    stop.itineraryItems.forEach((item) => {
      totalCost += item.customCost !== null ? item.customCost : item.activity.estimatedCost;
      activityCount++;
    });
  });

  trip.expenses.forEach((exp) => {
    totalCost += exp.amount;
  });

  const durationDays = Math.max(
    1,
    Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
  );

  return (
    <div className="min-h-screen bg-brand-background flex flex-col">
      <Navbar />

      {/* Hero Banner */}
      <div className="relative h-64 md:h-80 bg-brand-dark">
        {trip.coverImage ? (
          <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover opacity-70" />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-brand-primary to-brand-accent/50 opacity-80" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/30 to-transparent" />
        
        <div className="absolute bottom-6 left-6 right-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white flex flex-col justify-end text-left">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {trip.isPublic ? (
              <span className="bg-brand-success/90 border border-brand-success text-brand-surface text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1">
                <Globe className="w-3 h-3" />
                <span>Public Share Active</span>
              </span>
            ) : (
              <span className="bg-white/20 border border-white/30 text-white text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Private Itinerary</span>
              </span>
            )}
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-extrabold tracking-tight drop-shadow-md leading-tight">
            {trip.title}
          </h1>
          <p className="text-xs md:text-sm font-semibold text-brand-secondary mt-1 tracking-wide flex items-center gap-1.5">
            <CalendarIcon className="w-4 h-4" />
            <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
            <span>•</span>
            <span>{durationDays} Days</span>
          </p>
        </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Navigation Action controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-brand-border/60">
          <Link href="/trips" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-brand-muted hover:text-brand-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Trips</span>
          </Link>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <Link
              href={`/trips/${trip.id}/builder`}
              className="flex-grow sm:flex-grow-0 bg-brand-surface hover:bg-brand-background border border-brand-border text-brand-primary text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full flex items-center justify-center gap-1.5 shadow-premium transition-all"
            >
              <Edit className="w-4 h-4" />
              <span>Itinerary Builder</span>
            </Link>
            <Link
              href={`/trips/${trip.id}/budget`}
              className="flex-grow sm:flex-grow-0 bg-brand-primary hover:bg-brand-primary/95 text-brand-surface text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full flex items-center justify-center gap-1.5 shadow-premium transition-all"
            >
              <DollarSign className="w-4 h-4" />
              <span>Budget Analysis</span>
            </Link>
          </div>
        </div>

        {/* Dashboard Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          
          {/* Visual Route Map Column (2/3 width on desktop) */}
          <div className="lg:col-span-2 space-y-6">
            <TripMap stops={trip.stops} />
            
            {/* Description Card */}
            {trip.description && (
              <div className="bg-brand-surface border border-brand-border/60 rounded-3xl p-6 shadow-premium text-left">
                <span className="text-[10px] font-bold text-brand-accent uppercase tracking-widest">About this journey</span>
                <p className="text-sm font-medium text-brand-text/90 leading-relaxed mt-2 font-serif-brand">
                  {trip.description}
                </p>
              </div>
            )}

            {/* Itinerary Chronological List Section */}
            <ClientViewToggler trip={trip} />
          </div>

          {/* Sidebar Columns (1/3 width on desktop) */}
          <div className="space-y-8">
            
            {/* Cost Summary Box */}
            <div className="bg-brand-dark text-brand-surface rounded-3xl p-6 shadow-depth text-left">
              <span className="text-[9px] font-bold text-brand-secondary uppercase tracking-widest">
                Financial Summary
              </span>
              <h3 className="font-serif text-2xl font-bold mt-1">Estimations</h3>
              
              <div className="mt-6 space-y-4">
                <div className="bg-white/10 rounded-2xl p-4 border border-white/10 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-bold text-white/60 uppercase tracking-wider block">
                      Total Expense
                    </span>
                    <span className="text-2xl font-bold font-mono mt-0.5 block">
                      {formatCurrency(totalCost)}
                    </span>
                  </div>
                  <TrendingUp className="w-8 h-8 text-brand-secondary opacity-80" />
                </div>

                <div className="bg-white/10 rounded-2xl p-4 border border-white/10 grid grid-cols-2 gap-2 text-xs font-semibold text-white/80">
                  <div>
                    <span>Stops:</span>
                    <p className="text-brand-secondary text-sm font-bold mt-0.5">{trip.stops.length} Cities</p>
                  </div>
                  <div>
                    <span>Activities:</span>
                    <p className="text-brand-secondary text-sm font-bold mt-0.5">{activityCount} Scheduled</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sharing Panel (Phase 9 integration) */}
            <div className="bg-brand-surface border border-brand-border/60 rounded-3xl p-6 shadow-premium text-left">
              <h3 className="font-serif text-lg font-bold text-brand-dark flex items-center gap-2 mb-3">
                <Share2 className="w-5 h-5 text-brand-primary" />
                <span>Share Itinerary</span>
              </h3>
              <p className="text-xs text-brand-muted leading-relaxed font-semibold">
                Generate a custom sharing link. Public links allow friends to view details, inspect your routes, and clone this trip to their account!
              </p>

              {/* Dynamic toggle sharing client components */}
              <div className="mt-5 border-t border-brand-border/60 pt-4">
                <PublicShareWidget tripId={trip.id} isPublicInitial={trip.isPublic} shareSlugInitial={trip.shareSlug} />
              </div>
            </div>

            {/* Destinations stops List */}
            <div className="bg-brand-surface border border-brand-border/60 rounded-3xl p-6 shadow-premium text-left">
              <h3 className="font-serif text-lg font-bold text-brand-dark flex items-center gap-2 mb-4">
                <Compass className="w-5 h-5 text-brand-primary" />
                <span>Stops Catalog</span>
              </h3>
              
              {trip.stops.length === 0 ? (
                <p className="text-xs text-brand-muted py-2 font-medium">No stops added to this trip yet.</p>
              ) : (
                <div className="space-y-4">
                  {trip.stops.map((stop, idx) => (
                    <div key={stop.id} className="flex gap-3 items-center group">
                      <img src={stop.city.imageUrl} alt={stop.city.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                      <div className="flex-grow min-w-0">
                        <span className="text-[8px] bg-brand-primary/5 border border-brand-primary/10 text-brand-primary font-bold px-2 py-0.5 rounded-full">
                          Stop 0{idx + 1}
                        </span>
                        <h4 className="font-serif text-sm font-bold text-brand-dark truncate leading-tight mt-1">
                          {stop.city.name}
                        </h4>
                        <p className="text-[10px] text-brand-muted font-semibold mt-0.5">
                          {new Date(stop.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(stop.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}

// Client Component Widget for dynamic share states
import PublicShareWidget from './PublicShareWidget';
