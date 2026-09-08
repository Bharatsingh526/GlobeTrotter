import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/navigation/Navbar';
import TripMap from '@/components/map/TripMap';
import { Globe, Calendar, Compass, DollarSign, TrendingUp } from 'lucide-react';
import { formatDateRange, formatCurrency } from '@/lib/utils';
import CloneTripButton from './CloneTripButton';

export default async function SharedTripPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  // Fetch the shared trip by slug
  const sharedRecord = await prisma.sharedTrip.findUnique({
    where: { slug },
    include: {
      trip: {
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
      },
    },
  });

  if (!sharedRecord || !sharedRecord.trip.isPublic) {
    notFound();
  }

  const trip = sharedRecord.trip;

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
          <div className="flex items-center gap-1.5 mb-2">
            <span className="bg-brand-success text-brand-surface text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1">
              <Globe className="w-3 h-3" />
              <span>Shared Hub Itinerary</span>
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-extrabold tracking-tight drop-shadow-md leading-tight">
            {trip.title}
          </h1>
          <p className="text-xs md:text-sm font-semibold text-brand-secondary mt-1 tracking-wide flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
            <span>•</span>
            <span>{durationDays} Days</span>
          </p>
        </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Banner Alert indicating read only */}
        <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-3xl p-5 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left shadow-premium">
          <div>
            <h4 className="font-serif text-base font-bold text-brand-primary">Public Showcase Mode</h4>
            <p className="text-xs text-brand-muted mt-1 leading-relaxed font-semibold">
              This is a read-only view of a public travel route. Log in to copy this itinerary to your profile.
            </p>
          </div>
          
          <CloneTripButton tripId={trip.id} slug={slug} />
        </div>

        {/* Dashboard Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main timeline listing (2/3 width on desktop) */}
          <div className="lg:col-span-2 space-y-8">
            <TripMap stops={trip.stops} />

            {/* Description */}
            {trip.description && (
              <div className="bg-brand-surface border border-brand-border/60 rounded-3xl p-6 shadow-premium text-left">
                <span className="text-[10px] font-bold text-brand-accent uppercase tracking-widest">Description</span>
                <p className="text-sm font-medium text-brand-text/90 leading-relaxed mt-2 font-serif-brand">
                  {trip.description}
                </p>
              </div>
            )}

            {/* Timeline days */}
            <div className="space-y-6">
              {trip.stops.map((stop: any, stopIdx: number) => {
                const dates = [];
                const start = new Date(stop.startDate);
                const end = new Date(stop.endDate);
                let limit = 0;
                while (start <= end && limit < 15) {
                  dates.push(new Date(start));
                  start.setDate(start.getDate() + 1);
                  limit++;
                }

                return (
                  <div key={stop.id} className="space-y-4">
                    <div className="border-l-4 border-brand-primary pl-4 text-left">
                      <span className="text-[10px] font-bold text-brand-accent uppercase tracking-widest">
                        Stop 0{stopIdx + 1}
                      </span>
                      <h3 className="font-serif text-2xl font-bold text-brand-dark mt-0.5">
                        {stop.city.name}, {stop.city.country}
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {dates.map((date, dateIdx) => {
                        const dateStr = date.toISOString().split('T')[0];
                        const dayItems = stop.itineraryItems.filter((item: any) => 
                          new Date(item.date).toISOString().split('T')[0] === dateStr
                        );
                        dayItems.sort((a: any, b: any) => a.itemOrder - b.itemOrder);

                        return (
                          <div key={dateStr} className="bg-brand-surface border border-brand-border/60 rounded-3xl p-6 shadow-premium text-left">
                            <div className="flex justify-between items-baseline pb-3 border-b border-brand-border/40 mb-4">
                              <span className="font-serif text-lg font-bold text-brand-primary">Day 0{dateIdx + 1}</span>
                              <span className="text-xs text-brand-muted font-bold">
                                {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              </span>
                            </div>

                            <div className="space-y-4">
                              {dayItems.map((item: any) => {
                                const cost = item.customCost !== null ? item.customCost : item.activity.estimatedCost;
                                return (
                                  <div key={item.id} className="flex gap-4 items-start pb-4 border-b border-brand-border/30 last:border-b-0 last:pb-0">
                                    <div className="px-3 py-1 bg-brand-primary/10 rounded-xl border border-brand-primary/10 text-center shrink-0">
                                      <span className="text-xs font-bold text-brand-primary font-mono block">
                                        {item.startTime || '09:00'}
                                      </span>
                                    </div>
                                    <div className="flex-grow min-w-0">
                                      <div className="flex justify-between items-start gap-4">
                                        <div>
                                          <h5 className="font-serif text-sm font-bold text-brand-dark leading-tight">{item.activity.name}</h5>
                                          <span className="text-[9px] text-brand-accent font-bold uppercase tracking-wider mt-0.5 block">{item.activity.category}</span>
                                        </div>
                                        <span className="font-mono text-xs font-bold text-brand-primary">
                                          {formatCurrency(cost)}
                                        </span>
                                      </div>
                                      <p className="text-xs text-brand-muted mt-2 leading-relaxed font-semibold">
                                        {item.activity.description}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                              {dayItems.length === 0 && (
                                <p className="text-xs text-brand-muted/70 italic">No scheduled activities.</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Cost highlights */}
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
              </div>
            </div>

            {/* City list */}
            <div className="bg-brand-surface border border-brand-border/60 rounded-3xl p-6 shadow-premium text-left">
              <h3 className="font-serif text-lg font-bold text-brand-dark flex items-center gap-2 mb-4">
                <Compass className="w-5 h-5 text-brand-primary" />
                <span>Stops Catalog</span>
              </h3>
              <div className="space-y-4">
                {trip.stops.map((stop, idx) => (
                  <div key={stop.id} className="flex gap-3 items-center">
                    <img src={stop.city.imageUrl} alt={stop.city.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    <div className="flex-grow min-w-0">
                      <span className="text-[8px] bg-brand-primary/5 border border-brand-primary/10 text-brand-primary font-bold px-2 py-0.5 rounded-full">
                        Stop 0{idx + 1}
                      </span>
                      <h4 className="font-serif text-sm font-bold text-brand-dark truncate leading-tight mt-1">
                        {stop.city.name}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
