import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/navigation/Navbar';
import { Plus, Calendar, Compass, DollarSign, Heart, MapPin, ArrowRight } from 'lucide-react';
import { formatDateRange, formatCurrency } from '@/lib/utils';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  // Get current hour for dynamic greeting
  const currentHour = new Date().getHours();
  let greeting = 'Good morning';
  if (currentHour >= 12 && currentHour < 18) {
    greeting = 'Good afternoon';
  } else if (currentHour >= 18) {
    greeting = 'Good evening';
  }

  const userId = session.user.id;

  // 1. Fetch User and Profile details
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  const userName = dbUser?.profile?.name || session.user.name || 'Traveler';

  // 2. Fetch User's Trips (sorted by closest start date)
  const trips = await prisma.trip.findMany({
    where: {
      members: {
        some: { userId },
      },
    },
    include: {
      stops: {
        include: {
          city: true,
        },
        orderBy: {
          stopOrder: 'asc',
        },
      },
      expenses: true,
    },
    orderBy: {
      startDate: 'asc',
    },
  });

  const now = new Date();
  const upcomingTrips = trips.filter((trip) => new Date(trip.endDate) >= now);
  const pastTrips = trips.filter((trip) => new Date(trip.endDate) < now);

  // 3. Fetch Saved Destinations
  const savedDestinations = await prisma.savedDestination.findMany({
    where: { userId },
    include: {
      city: true,
    },
  });

  // 4. Fetch Recommended Cities (excluding ones they already saved or visited, capped at 3)
  const savedCityIds = savedDestinations.map((sd) => sd.cityId);
  const recommendedCities = await prisma.city.findMany({
    where: {
      id: {
        notIn: savedCityIds,
      },
    },
    take: 3,
    orderBy: {
      popularity: 'desc',
    },
  });

  // Calculate budget statistics for upcoming trips
  const totalUpcomingBudget = upcomingTrips.reduce((acc, trip) => {
    const expensesTotal = trip.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    return acc + expensesTotal;
  }, 0);

  return (
    <div className="min-h-screen bg-brand-background flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-8 border-b border-brand-border/60">
          <div>
            <span className="text-xs font-bold text-brand-accent uppercase tracking-widest">
              Welcome Back
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-extrabold text-brand-dark mt-1">
              {greeting}, {userName}
            </h1>
            <p className="text-sm font-semibold text-brand-muted mt-2">
              Where are we going next?
            </p>
          </div>
          <Link
            href="/trips/new"
            className="bg-brand-primary hover:bg-brand-primary/95 text-brand-surface text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full shadow-premium hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Plan A Trip</span>
          </Link>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Left Column (2 cols wide on desktop) */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Upcoming Trips */}
            <div>
              <h2 className="font-serif text-2xl font-bold text-brand-dark flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-brand-primary" />
                <span>Upcoming Journeys</span>
              </h2>

              {upcomingTrips.length === 0 ? (
                <div className="bg-brand-surface border border-brand-border/60 rounded-3xl p-10 text-center shadow-premium flex flex-col items-center">
                  <span className="text-3xl">✈️</span>
                  <h3 className="font-serif text-lg font-bold text-brand-dark mt-3">Every great journey starts with a blank map.</h3>
                  <p className="text-xs text-brand-muted mt-1 max-w-xs font-medium">
                    You do not have any upcoming trips planned. Time to pick a city and build an adventure.
                  </p>
                  <Link
                    href="/trips/new"
                    className="mt-6 bg-brand-primary hover:bg-brand-primary/95 text-brand-surface text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full shadow-premium"
                  >
                    Plan Your First Trip
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {upcomingTrips.map((trip) => {
                    const totalCost = trip.expenses.reduce((sum, exp) => sum + exp.amount, 0);
                    return (
                      <div
                        key={trip.id}
                        className="bg-brand-surface border border-brand-border/60 rounded-3xl overflow-hidden shadow-premium hover:shadow-premium-hover transition-all duration-300 flex flex-col h-full"
                      >
                        <div className="h-32 bg-brand-primary relative">
                          {trip.coverImage ? (
                            <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover opacity-75" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-tr from-brand-primary to-brand-accent/50 opacity-80" />
                          )}
                          <div className="absolute top-4 left-4">
                            <span className="bg-brand-secondary/90 text-brand-dark text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border border-brand-secondary">
                              Upcoming
                            </span>
                          </div>
                        </div>
                        <div className="p-5 flex-grow flex flex-col justify-between">
                          <div>
                            <h3 className="font-serif text-xl font-bold text-brand-dark leading-tight line-clamp-1">{trip.title}</h3>
                            <p className="text-xs text-brand-muted font-bold tracking-wide mt-1">
                              {formatDateRange(trip.startDate, trip.endDate)}
                            </p>
                            <p className="text-xs text-brand-text/80 mt-2.5 font-medium line-clamp-2">
                              {trip.description || 'No description added yet.'}
                            </p>
                          </div>
                          
                          <div className="border-t border-brand-border/60 pt-4 mt-4 flex items-center justify-between">
                            <span className="text-[10px] text-brand-muted uppercase tracking-wider font-extrabold">
                              Stops: <strong className="text-brand-primary">{trip.stops.length}</strong>
                            </span>
                            <Link
                              href={`/trips/${trip.id}`}
                              className="text-xs font-bold text-brand-accent hover:text-brand-accent/90 flex items-center gap-0.5 uppercase tracking-wider text-[10px]"
                            >
                              <span>Inspect</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Past Trips (if any) */}
            {pastTrips.length > 0 && (
              <div>
                <h2 className="font-serif text-2xl font-bold text-brand-dark flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-brand-muted" />
                  <span>Past Memories</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pastTrips.map((trip) => (
                    <div
                      key={trip.id}
                      className="bg-brand-surface/70 border border-brand-border/40 rounded-3xl overflow-hidden shadow-premium flex flex-col opacity-80 hover:opacity-100 transition-opacity duration-300"
                    >
                      <div className="h-28 bg-brand-muted/20 relative">
                        {trip.coverImage && (
                          <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover grayscale opacity-60" />
                        )}
                        <div className="absolute top-4 left-4">
                          <span className="bg-brand-muted/20 text-brand-muted text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border border-brand-border">
                            Completed
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-serif text-lg font-bold text-brand-dark line-clamp-1">{trip.title}</h3>
                        <p className="text-[10px] text-brand-muted font-bold mt-1">
                          {formatDateRange(trip.startDate, trip.endDate)}
                        </p>
                        <Link
                          href={`/trips/${trip.id}`}
                          className="mt-3 inline-flex items-center gap-0.5 text-xs text-brand-accent font-bold uppercase tracking-wider text-[9px]"
                        >
                          <span>Review details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Right Column */}
          <div className="space-y-10">
            
            {/* Budget Highlights */}
            <div className="bg-brand-primary text-brand-surface rounded-3xl p-6 shadow-depth">
              <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest">
                Financial Summary
              </span>
              <h2 className="font-serif text-2xl font-bold mt-1">Budget Highlights</h2>
              
              <div className="mt-6 space-y-4">
                <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                  <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider block">
                    Upcoming Travel Spend
                  </span>
                  <span className="text-3xl font-bold mt-1 block">
                    {formatCurrency(totalUpcomingBudget)}
                  </span>
                </div>

                <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                  <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider block">
                    Active Planned Trips
                  </span>
                  <span className="text-2xl font-bold mt-1 block">
                    {upcomingTrips.length} Destinations
                  </span>
                </div>
              </div>
            </div>

            {/* Saved Destinations */}
            <div className="bg-brand-surface border border-brand-border/60 rounded-3xl p-6 shadow-premium">
              <h2 className="font-serif text-xl font-bold text-brand-dark flex items-center gap-2 mb-4">
                <Heart className="w-4 h-5 text-brand-accent fill-brand-accent" />
                <span>Saved Destinations</span>
              </h2>

              {savedDestinations.length === 0 ? (
                <p className="text-xs text-brand-muted font-medium py-2 leading-relaxed">
                  Your travel bucket list is empty. Click save (❤️) on cities in explore page to keep them here.
                </p>
              ) : (
                <div className="space-y-3">
                  {savedDestinations.map((sd) => (
                    <Link
                      key={sd.id}
                      href={`/explore/cities?search=${sd.city.name}`}
                      className="flex items-center gap-3 p-2 rounded-2xl hover:bg-brand-background transition-all group"
                    >
                      <img src={sd.city.imageUrl || ''} alt={sd.city.name} className="w-12 h-12 rounded-xl object-cover" />
                      <div className="text-left flex-1 min-w-0">
                        <h4 className="font-serif text-sm font-bold text-brand-dark truncate leading-tight group-hover:text-brand-primary transition-colors">
                          {sd.city.name}
                        </h4>
                        <p className="text-[10px] text-brand-accent font-bold uppercase tracking-wider">
                          {sd.city.country}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-brand-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div className="bg-brand-surface border border-brand-border/60 rounded-3xl p-6 shadow-premium">
              <h2 className="font-serif text-xl font-bold text-brand-dark flex items-center gap-2 mb-4">
                <Compass className="w-4 h-5 text-brand-primary" />
                <span>Recommended Cities</span>
              </h2>
              
              <div className="space-y-3">
                {recommendedCities.map((city) => (
                  <Link
                    key={city.id}
                    href={`/explore/cities?search=${city.name}`}
                    className="flex items-center gap-3 p-2 rounded-2xl hover:bg-brand-background transition-all group"
                  >
                    <img src={city.imageUrl || ''} alt={city.name} className="w-12 h-12 rounded-xl object-cover" />
                    <div className="text-left flex-1 min-w-0">
                      <h4 className="font-serif text-sm font-bold text-brand-dark truncate leading-tight group-hover:text-brand-primary transition-colors">
                        {city.name}
                      </h4>
                      <p className="text-[10px] text-brand-accent font-bold uppercase tracking-wider">
                        {city.country}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-brand-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
