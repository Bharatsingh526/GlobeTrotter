'use client';

import React from 'react';
import {
  Users,
  Compass,
  DollarSign,
  TrendingUp,
  Award,
  Calendar,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface AdminDashboardClientProps {
  stats: {
    totalUsers: number;
    totalTrips: number;
    averageTripCost: number;
    grandTotalSpend: number;
  };
  popularCities: any[];
  popularActivities: any[];
  monthlySignups: any[];
  monthlyTrips: any[];
}

export default function AdminDashboardClient({
  stats,
  popularCities,
  popularActivities,
  monthlySignups,
  monthlyTrips,
}: AdminDashboardClientProps) {
  return (
    <div className="space-y-10 text-left">
      
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-brand-surface border border-brand-border/60 rounded-3xl p-5 shadow-premium flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-brand-muted uppercase tracking-wider font-extrabold block">Total Users</span>
            <h3 className="text-2xl font-bold text-brand-dark mt-0.5 leading-none">{stats.totalUsers}</h3>
          </div>
        </div>

        {/* Total Trips */}
        <div className="bg-brand-surface border border-brand-border/60 rounded-3xl p-5 shadow-premium flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-brand-muted uppercase tracking-wider font-extrabold block">Total Trips</span>
            <h3 className="text-2xl font-bold text-brand-dark mt-0.5 leading-none">{stats.totalTrips}</h3>
          </div>
        </div>

        {/* Average Trip Cost */}
        <div className="bg-brand-surface border border-brand-border/60 rounded-3xl p-5 shadow-premium flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-brand-muted uppercase tracking-wider font-extrabold block">Avg. Trip Cost</span>
            <h3 className="text-2xl font-bold text-brand-dark mt-0.5 leading-none font-mono">{formatCurrency(stats.averageTripCost)}</h3>
          </div>
        </div>

        {/* Grand Total Spent */}
        <div className="bg-brand-surface border border-brand-border/60 rounded-3xl p-5 shadow-premium flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-brand-muted uppercase tracking-wider font-extrabold block">Gross System Volume</span>
            <h3 className="text-2xl font-bold text-brand-dark mt-0.5 leading-none font-mono">{formatCurrency(stats.grandTotalSpend)}</h3>
          </div>
        </div>
      </div>

      {/* Recharts Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* User Registration Line Chart */}
        <div className="bg-brand-surface border border-brand-border/60 rounded-3xl p-6 shadow-premium h-[350px] flex flex-col justify-between">
          <h3 className="font-serif text-sm font-bold text-brand-dark flex items-center gap-1.5 pb-2 border-b border-brand-border/40 mb-4">
            <Users className="w-4 h-4 text-brand-primary" />
            <span>Monthly User Registrations</span>
          </h3>
          <div className="flex-grow flex items-center justify-center">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlySignups} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 600 }} />
                <YAxis tick={{ fontSize: 10, fontWeight: 600 }} />
                <Tooltip formatter={(value) => [`${value} Signups`, 'Registrations']} />
                <Line type="monotone" dataKey="signups" stroke="#0F3D3E" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trip Creation Bar Chart */}
        <div className="bg-brand-surface border border-brand-border/60 rounded-3xl p-6 shadow-premium h-[350px] flex flex-col justify-between">
          <h3 className="font-serif text-sm font-bold text-brand-dark flex items-center gap-1.5 pb-2 border-b border-brand-border/40 mb-4">
            <Calendar className="w-4 h-4 text-brand-primary" />
            <span>Trip Creation Trends</span>
          </h3>
          <div className="flex-grow flex items-center justify-center">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyTrips} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 600 }} />
                <YAxis tick={{ fontSize: 10, fontWeight: 600 }} />
                <Tooltip formatter={(value) => [`${value} Trips`, 'Planned']} />
                <Bar dataKey="trips" fill="#E89B3D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Rankings Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Popular Cities */}
        <div className="bg-brand-surface border border-brand-border/60 rounded-3xl p-6 shadow-premium">
          <h3 className="font-serif text-base font-bold text-brand-dark flex items-center gap-2 mb-4 pb-2 border-b border-brand-border/40">
            <Award className="w-5 h-5 text-brand-accent" />
            <span>Top 5 Popular Destinations</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-semibold text-left">
              <thead>
                <tr className="border-b border-brand-border/60 text-brand-muted uppercase tracking-wider">
                  <th className="pb-3">Rank</th>
                  <th className="pb-3">City</th>
                  <th className="pb-3">Country</th>
                  <th className="pb-3 text-right">Trip Stop Count</th>
                </tr>
              </thead>
              <tbody>
                {popularCities.map((city, idx) => (
                  <tr key={city.name} className="border-b border-brand-border/30 last:border-0 hover:bg-brand-background/40 transition-colors">
                    <td className="py-3 font-mono text-brand-accent">#0{idx + 1}</td>
                    <td className="py-3 text-brand-dark">{city.name}</td>
                    <td className="py-3 text-brand-muted">{city.country}</td>
                    <td className="py-3 text-right font-mono text-brand-primary">{city.stopsCount} stops</td>
                  </tr>
                ))}
                {popularCities.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-brand-muted italic">No cities stop data recorded.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Popular Activities */}
        <div className="bg-brand-surface border border-brand-border/60 rounded-3xl p-6 shadow-premium">
          <h3 className="font-serif text-base font-bold text-brand-dark flex items-center gap-2 mb-4 pb-2 border-b border-brand-border/40">
            <Activity className="w-5 h-5 text-brand-primary" />
            <span>Top 5 Booked Activities</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-semibold text-left">
              <thead>
                <tr className="border-b border-brand-border/60 text-brand-muted uppercase tracking-wider">
                  <th className="pb-3">Rank</th>
                  <th className="pb-3">Activity</th>
                  <th className="pb-3">City</th>
                  <th className="pb-3 text-right">Added to Plans</th>
                </tr>
              </thead>
              <tbody>
                {popularActivities.map((act, idx) => (
                  <tr key={act.name} className="border-b border-brand-border/30 last:border-0 hover:bg-brand-background/40 transition-colors">
                    <td className="py-3 font-mono text-brand-primary">#0{idx + 1}</td>
                    <td className="py-3 text-brand-dark truncate max-w-[150px]" title={act.name}>{act.name}</td>
                    <td className="py-3 text-brand-muted">{act.city} ({act.category})</td>
                    <td className="py-3 text-right font-mono text-brand-primary">{act.bookingsCount} times</td>
                  </tr>
                ))}
                {popularActivities.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-brand-muted italic">No activities stop data recorded.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
