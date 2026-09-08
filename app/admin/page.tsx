import React from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/navigation/Navbar';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  // Fallback check if session role is not ADMIN (middleware handles this as well)
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // 1. Fetch Metrics
  const totalUsers = await prisma.user.count();
  const totalTrips = await prisma.trip.count();
  
  // Calculate average trip cost
  const allExpenses = await prisma.expense.aggregate({
    _sum: {
      amount: true,
    },
  });
  
  const allItineraryItems = await prisma.itineraryItem.findMany({
    include: {
      activity: true,
    },
  });

  let totalScheduledCost = 0;
  allItineraryItems.forEach((item) => {
    totalScheduledCost += item.customCost !== null ? item.customCost : item.activity.estimatedCost;
  });

  const sumExpenses = allExpenses._sum.amount || 0;
  const grandTotalSpend = sumExpenses + totalScheduledCost;
  const averageTripCost = totalTrips > 0 ? grandTotalSpend / totalTrips : 0;

  // 2. Fetch Popular Cities (ordered by count of trip stops)
  const popularCitiesRaw = await prisma.city.findMany({
    include: {
      _count: {
        select: { stops: true },
      },
    },
    orderBy: {
      stops: {
        _count: 'desc',
      },
    },
    take: 5,
  });

  const popularCities = popularCitiesRaw.map((city) => ({
    name: city.name,
    country: city.country,
    stopsCount: city._count.stops,
  }));

  // 3. Fetch Popular Activities (ordered by count of itinerary items)
  const popularActivitiesRaw = await prisma.activity.findMany({
    include: {
      _count: {
        select: { itineraryItems: true },
      },
      city: true,
    },
    orderBy: {
      itineraryItems: {
        _count: 'desc',
      },
    },
    take: 5,
  });

  const popularActivities = popularActivitiesRaw.map((act) => ({
    name: act.name,
    city: act.city.name,
    category: act.category,
    bookingsCount: act._count.itineraryItems,
  }));

  // 4. Fetch User signup history / count
  const users = await prisma.user.findMany({
    select: { createdAt: true },
  });

  // Aggregate user signups by month/date
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlySignups: Record<string, number> = {};
  
  // Set default values for past few months
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlySignups[monthNames[d.getMonth()]] = 0;
  }

  users.forEach((u) => {
    const month = monthNames[new Date(u.createdAt).getMonth()];
    if (monthlySignups[month] !== undefined) {
      monthlySignups[month]++;
    }
  });

  const monthlySignupsData = Object.keys(monthlySignups).map((month) => ({
    month,
    signups: monthlySignups[month],
  }));

  // 5. Fetch trip creation history
  const trips = await prisma.trip.findMany({
    select: { createdAt: true },
  });

  const monthlyTrips: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyTrips[monthNames[d.getMonth()]] = 0;
  }

  trips.forEach((t) => {
    const month = monthNames[new Date(t.createdAt).getMonth()];
    if (monthlyTrips[month] !== undefined) {
      monthlyTrips[month]++;
    }
  });

  const monthlyTripsData = Object.keys(monthlyTrips).map((month) => ({
    month,
    trips: monthlyTrips[month],
  }));

  return (
    <div className="min-h-screen bg-brand-background flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header */}
        <div className="text-left border-b border-brand-border/60 pb-6 mb-8">
          <span className="text-xs font-bold text-brand-accent uppercase tracking-widest bg-brand-accent/10 px-4 py-1.5 rounded-full border border-brand-accent/20">
            System Operations
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-brand-dark mt-4">
            Admin Panel Dashboard
          </h1>
          <p className="text-sm font-semibold text-brand-muted mt-2">
            Secure administrative control center summarizing application user signups, travels, and city popularities.
          </p>
        </div>

        {/* Client side analytics graphs container */}
        <AdminDashboardClient
          stats={{
            totalUsers,
            totalTrips,
            averageTripCost,
            grandTotalSpend,
          }}
          popularCities={popularCities}
          popularActivities={popularActivities}
          monthlySignups={monthlySignupsData}
          monthlyTrips={monthlyTripsData}
        />

      </main>
    </div>
  );
}
