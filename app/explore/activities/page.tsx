'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Compass, Clock, DollarSign, Loader2, X } from 'lucide-react';
import Navbar from '@/components/navigation/Navbar';
import { formatCurrency } from '@/lib/utils';

export default function ActivitiesExplorerPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [userTrips, setUserTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [costFilter, setCostFilter] = useState('');
  const [durationFilter, setDurationFilter] = useState('');

  // Day scheduler modal
  const [schedulingActivity, setSchedulingActivity] = useState<any | null>(null);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [selectedStopId, setSelectedStopId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [notes, setNotes] = useState('');
  const [savingItem, setSavingItem] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch activities
      const actRes = await fetch(`/api/activities?search=${searchQuery}`);
      const actData = await actRes.json();
      setActivities(actData);

      // 2. Fetch user trips
      const tripsRes = await fetch('/api/trips');
      if (tripsRes.ok) {
        const tripsData = await tripsRes.json();
        setUserTrips(tripsData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/activities?search=${searchQuery}&category=${categoryFilter}`);
      let data = await res.json();

      // Apply cost and duration filters client-side for immediate precision
      if (costFilter) {
        const maxCost = parseFloat(costFilter);
        data = data.filter((act: any) => act.estimatedCost <= maxCost);
      }

      if (durationFilter) {
        const maxDuration = parseInt(durationFilter);
        data = data.filter((act: any) => act.durationMinutes <= maxDuration);
      }

      setActivities(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [categoryFilter, costFilter, durationFilter]);

  // Generate date list between start and end dates
  const getDatesBetween = (startStr: string, endStr: string) => {
    const dates: string[] = [];
    const start = new Date(startStr);
    const end = new Date(endStr);
    let limit = 0;
    while (start <= end && limit < 15) {
      dates.push(start.toISOString().split('T')[0]);
      start.setDate(start.getDate() + 1);
      limit++;
    }
    return dates;
  };

  // Find active stops for selected trip
  const activeTrip = userTrips.find((t) => t.id === selectedTripId);
  const activeStops = activeTrip?.stops || [];
  const activeStop = activeStops.find((s: any) => s.id === selectedStopId);
  const activeDates = activeStop ? getDatesBetween(activeStop.startDate, activeStop.endDate) : [];

  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTripId || !selectedStopId || !selectedDate) return;

    setSavingItem(true);
    try {
      const res = await fetch(`/api/trips/${selectedTripId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripStopId: selectedStopId,
          activityId: schedulingActivity.id,
          date: selectedDate,
          startTime,
          notes,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to schedule activity.');
      }

      alert(`Successfully scheduled ${schedulingActivity.name}!`);
      setSchedulingActivity(null);
      setNotes('');
    } catch (e: any) {
      alert(e.message || 'Error occurred.');
    } finally {
      setSavingItem(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-background flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-brand-accent uppercase tracking-widest bg-brand-accent/10 px-4 py-1.5 rounded-full border border-brand-accent/20">
            Explorer Hub
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-extrabold text-brand-dark mt-4">
            Discover Activities
          </h1>
          <p className="text-sm font-semibold text-brand-muted mt-2">
            Browse through local sights, culinary classes, shopping crawls, and outdoor adventures.
          </p>
        </div>

        {/* Filters Panel */}
        <div className="bg-brand-surface border border-brand-border/60 rounded-3xl p-6 shadow-premium mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Text Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2.5 bg-brand-background border border-brand-border/60 rounded-full text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
              />
              <Search className="w-4 h-4 text-brand-muted absolute left-3.5 top-3" />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 bg-brand-background border border-brand-border/60 rounded-full text-xs font-semibold focus:outline-none text-brand-text cursor-pointer"
            >
              <option value="">All Categories</option>
              <option value="CULTURE">Culture</option>
              <option value="FOOD">Food</option>
              <option value="ADVENTURE">Adventure</option>
              <option value="NATURE">Nature</option>
              <option value="NIGHTLIFE">Nightlife</option>
              <option value="SHOPPING">Shopping</option>
            </select>

            {/* Cost Index Filter */}
            <select
              value={costFilter}
              onChange={(e) => setCostFilter(e.target.value)}
              className="px-4 py-2.5 bg-brand-background border border-brand-border/60 rounded-full text-xs font-semibold focus:outline-none text-brand-text cursor-pointer"
            >
              <option value="">Any Cost</option>
              <option value="30">Under $30</option>
              <option value="60">Under $60</option>
              <option value="100">Under $100</option>
            </select>

            {/* Duration Filter */}
            <select
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value)}
              className="px-4 py-2.5 bg-brand-background border border-brand-border/60 rounded-full text-xs font-semibold focus:outline-none text-brand-text cursor-pointer"
            >
              <option value="">Any Duration</option>
              <option value="60">Under 1 hour</option>
              <option value="180">Under 3 hours</option>
              <option value="300">Under 5 hours</option>
            </select>
          </div>

          <div className="flex justify-end border-t border-brand-border/60 pt-4">
            <button
              onClick={handleSearch}
              className="w-full sm:w-auto text-center bg-brand-primary hover:bg-brand-primary/95 text-brand-surface text-[10px] font-extrabold uppercase tracking-wider px-5 py-2.5 rounded-full shadow-premium transition-all cursor-pointer"
            >
              Query Catalog
            </button>
          </div>
        </div>

        {/* Activities List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
          </div>
        ) : activities.length === 0 ? (
          <div className="bg-brand-surface border border-brand-border/60 rounded-3xl p-12 text-center shadow-premium max-w-md mx-auto">
            <Compass className="w-10 h-10 text-brand-primary/30 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-brand-dark mt-4">No activities match</h3>
            <p className="text-xs text-brand-muted mt-1 leading-relaxed font-semibold">
              Try adjusting your filters or search query.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activities.map((act) => (
              <div
                key={act.id}
                className="bg-brand-surface border border-brand-border/60 rounded-3xl overflow-hidden shadow-premium hover:shadow-premium-hover transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="h-44 relative bg-brand-dark">
                  <img
                    src={act.imageUrl}
                    alt={act.name}
                    className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/20 backdrop-blur-md text-white border border-white/20 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full">
                      {act.category}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-brand-dark leading-tight line-clamp-1 group-hover:text-brand-primary transition-colors">
                      {act.name}
                    </h3>
                    <p className="text-[9px] text-brand-accent font-bold uppercase tracking-wider mt-0.5">
                      📍 {act.city.name}, {act.city.country}
                    </p>
                    <p className="text-xs text-brand-text/80 mt-3 leading-relaxed font-medium line-clamp-3">
                      {act.description}
                    </p>
                  </div>

                  <div className="border-t border-brand-border/60 pt-4 mt-5 flex items-center justify-between">
                    <div className="flex gap-4 text-xs font-semibold text-brand-muted">
                      <div className="flex items-center gap-0.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{Math.round(act.durationMinutes / 60)}h</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span className="font-mono text-brand-primary">{formatCurrency(act.estimatedCost)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (userTrips.length === 0) {
                          alert('You do not have any trips planned. Please create a trip first.');
                          return;
                        }
                        setSchedulingActivity(act);
                        setSelectedTripId(userTrips[0]?.id || '');
                        
                        const trip = userTrips[0];
                        if (trip?.stops?.length > 0) {
                          setSelectedStopId(trip.stops[0].id);
                          const dates = getDatesBetween(trip.stops[0].startDate, trip.stops[0].endDate);
                          setSelectedDate(dates[0] || '');
                        }
                      }}
                      className="bg-brand-primary hover:bg-brand-primary/95 text-brand-surface text-[10px] font-extrabold uppercase tracking-wider px-5 py-2.5 rounded-full shadow-premium flex items-center gap-1 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Add To Day</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Schedule Activity Modal */}
        {schedulingActivity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm">
            <div className="bg-brand-surface border border-brand-border/60 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-depth">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-brand-dark truncate max-w-[200px]">Schedule activity</h3>
                  <p className="text-[9px] text-brand-accent font-bold uppercase tracking-wider mt-0.5">
                    {schedulingActivity.name}
                  </p>
                </div>
                <button
                  onClick={() => setSchedulingActivity(null)}
                  className="text-brand-muted hover:text-brand-dark focus:outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveActivity} className="space-y-4 text-left">
                {/* Select Trip */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark mb-1">
                    Select Trip
                  </label>
                  <select
                    value={selectedTripId}
                    onChange={(e) => {
                      setSelectedTripId(e.target.value);
                      const trip = userTrips.find((t) => t.id === e.target.value);
                      if (trip?.stops?.length > 0) {
                        setSelectedStopId(trip.stops[0].id);
                        const dates = getDatesBetween(trip.stops[0].startDate, trip.stops[0].endDate);
                        setSelectedDate(dates[0] || '');
                      } else {
                        setSelectedStopId('');
                        setSelectedDate('');
                      }
                    }}
                    className="w-full px-3 py-2.5 bg-brand-background border border-brand-border rounded-xl text-xs font-semibold focus:outline-none"
                    required
                  >
                    {userTrips.map((trip) => (
                      <option key={trip.id} value={trip.id}>
                        {trip.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select City Stop inside that Trip */}
                {activeStops.length > 0 ? (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark mb-1">
                      Select Stop (City)
                    </label>
                    <select
                      value={selectedStopId}
                      onChange={(e) => {
                        setSelectedStopId(e.target.value);
                        const stop = activeStops.find((s: any) => s.id === e.target.value);
                        if (stop) {
                          const dates = getDatesBetween(stop.startDate, stop.endDate);
                          setSelectedDate(dates[0] || '');
                        } else {
                          setSelectedDate('');
                        }
                      }}
                      className="w-full px-3 py-2.5 bg-brand-background border border-brand-border rounded-xl text-xs font-semibold focus:outline-none"
                      required
                    >
                      {activeStops.map((stop: any) => (
                        <option key={stop.id} value={stop.id}>
                          {stop.city.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="text-xs text-brand-accent bg-brand-accent/5 p-3 rounded-xl border border-brand-accent/15">
                    This trip doesn not have any stops. Please add stops to this trip first.
                  </div>
                )}

                {/* Select Date inside that Stop */}
                {activeDates.length > 0 && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark mb-1">
                      Select Date
                    </label>
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-brand-background border border-brand-border rounded-xl text-xs font-semibold focus:outline-none"
                      required
                    >
                      {activeDates.map((date, idx) => (
                        <option key={date} value={date}>
                          Day {idx + 1} ({new Date(date).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Start Time */}
                {activeDates.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark mb-1">
                        Start Time
                      </label>
                      <input
                        type="text"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-3 py-2 bg-brand-background border border-brand-border rounded-xl text-xs font-semibold focus:outline-none"
                        placeholder="09:00"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Notes */}
                {activeDates.length > 0 && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark mb-1">
                      Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-brand-background border border-brand-border rounded-xl text-xs font-semibold focus:outline-none resize-none"
                      placeholder="Special instructions or details..."
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSchedulingActivity(null)}
                    disabled={savingItem}
                    className="px-4 py-2 border border-brand-border text-brand-muted rounded-full text-xs font-bold uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingItem || activeStops.length === 0}
                    className="px-5 py-2 bg-brand-primary text-brand-surface rounded-full text-xs font-bold uppercase shadow-premium flex items-center gap-1.5"
                  >
                    {savingItem ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      'Schedule'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
