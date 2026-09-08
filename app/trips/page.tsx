'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Plus, Search, Trash2, Eye, Compass, Loader2 } from 'lucide-react';
import { formatDateRange, formatCurrency } from '@/lib/utils';
import Navbar from '@/components/navigation/Navbar';

export default function TripsPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTripId, setDeleteTripId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/trips');
      if (!res.ok) {
        throw new Error('Failed to load trips');
      }
      const data = await res.json();
      setTrips(data);
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/trips/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Could not delete trip');
      }
      setTrips(trips.filter((t) => t.id !== id));
      setDeleteTripId(null);
    } catch (e: any) {
      alert(e.message || 'An error occurred while deleting the trip.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredTrips = trips.filter((trip) =>
    trip.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-brand-background flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-brand-accent uppercase tracking-widest">
              My Catalog
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-brand-dark mt-1">
              Your travel journeys
            </h1>
          </div>
          <Link
            href="/trips/new"
            className="bg-brand-primary hover:bg-brand-primary/95 text-brand-surface text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full shadow-premium hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Plan New Trip</span>
          </Link>
        </div>

        {/* Search Input */}
        <div className="relative max-w-md mb-8">
          <input
            type="text"
            placeholder="Search trips by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-brand-surface border border-brand-border/60 rounded-full text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-sm font-semibold transition-all shadow-premium"
          />
          <Search className="w-5 h-5 text-brand-muted absolute left-4 top-3.5" />
        </div>

        {/* Dynamic States */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
          </div>
        ) : error ? (
          <div className="bg-brand-accent/10 border border-brand-accent/30 text-brand-accent text-sm rounded-3xl p-6 text-center max-w-md mx-auto">
            <h3 className="font-bold font-serif text-lg">Failed to retrieve trips</h3>
            <p className="text-xs mt-1">{error}</p>
            <button onClick={fetchTrips} className="mt-4 bg-brand-accent text-white px-4 py-2 rounded-full text-xs font-bold uppercase">
              Retry
            </button>
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="bg-brand-surface border border-brand-border/60 rounded-3xl p-12 text-center shadow-premium max-w-xl mx-auto flex flex-col items-center">
            <Compass className="w-12 h-12 text-brand-primary/30 animate-pulse-slow" />
            <h3 className="font-serif text-xl font-bold text-brand-dark mt-4">
              {searchQuery ? 'No matching trips found' : 'Every great journey starts with a blank map.'}
            </h3>
            <p className="text-xs text-brand-muted mt-1 max-w-xs leading-relaxed font-semibold">
              {searchQuery
                ? 'Try searching with different keywords.'
                : 'Plan your next adventure by specifying names, dates, and destinations.'}
            </p>
            {!searchQuery && (
              <Link
                href="/trips/new"
                className="mt-6 bg-brand-primary hover:bg-brand-primary/95 text-brand-surface text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full shadow-premium"
              >
                Plan Your First Trip
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip) => {
              const totalCost = trip.expenses?.reduce((sum: number, exp: any) => sum + exp.amount, 0) || 0;
              return (
                <div
                  key={trip.id}
                  className="bg-brand-surface border border-brand-border/60 rounded-3xl overflow-hidden shadow-premium hover:shadow-premium-hover transition-all duration-300 flex flex-col h-full group"
                >
                  <div className="h-40 bg-brand-primary relative overflow-hidden">
                    {trip.coverImage ? (
                      <img
                        src={trip.coverImage}
                        alt={trip.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-brand-primary to-brand-accent/50 opacity-80" />
                    )}
                  </div>
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif text-xl font-bold text-brand-dark leading-tight line-clamp-1 group-hover:text-brand-primary transition-colors">
                        {trip.title}
                      </h3>
                      <p className="text-xs text-brand-muted font-bold tracking-wide mt-1.5 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
                      </p>
                      <p className="text-xs text-brand-text/80 mt-3 font-medium line-clamp-2 leading-relaxed">
                        {trip.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="border-t border-brand-border/60 pt-4 mt-6 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-extrabold text-brand-muted uppercase tracking-wider">
                          Stops Count
                        </span>
                        <span className="text-sm font-bold text-brand-dark">
                          {trip.stops?.length || 0} stops
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/trips/${trip.id}`}
                          className="p-2 rounded-full border border-brand-border hover:bg-brand-primary/5 text-brand-primary transition-colors cursor-pointer"
                          title="View Itinerary"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteTripId(trip.id)}
                          className="p-2 rounded-full border border-brand-border hover:bg-brand-accent/15 text-brand-accent transition-colors cursor-pointer"
                          title="Delete Trip"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteTripId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm">
            <div className="bg-brand-surface border border-brand-border/60 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-depth text-center">
              <span className="text-3xl">⚠️</span>
              <h3 className="font-serif text-xl font-bold text-brand-dark mt-4">Delete this trip?</h3>
              <p className="text-xs text-brand-muted mt-2 leading-relaxed font-semibold">
                Are you sure you want to permanently delete this trip? This action is irreversible and all stops, itinerary events, and expenses will be lost.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => setDeleteTripId(null)}
                  disabled={deleting}
                  className="px-5 py-2.5 rounded-full border border-brand-border hover:bg-brand-background text-brand-muted text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteTripId)}
                  disabled={deleting}
                  className="px-5 py-2.5 rounded-full bg-brand-accent hover:bg-brand-accent/90 text-brand-surface text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
