'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Heart, Plus, MapPin, Compass, DollarSign, Star, Loader2, ArrowRight, X } from 'lucide-react';
import Navbar from '@/components/navigation/Navbar';
import { formatCurrency } from '@/lib/utils';

function CitiesExplorer() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [cities, setCities] = useState<any[]>([]);
  const [savedCities, setSavedCities] = useState<string[]>([]);
  const [userTrips, setUserTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters state
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [regionFilter, setRegionFilter] = useState('');
  const [costFilter, setCostFilter] = useState('');
  const [popularityFilter, setPopularityFilter] = useState('');

  // Trip assignment modal/modal-state
  const [addToTripCity, setAddToTripCity] = useState<any | null>(null);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [stopStartDate, setStopStartDate] = useState('');
  const [stopEndDate, setStopEndDate] = useState('');
  const [stopNotes, setStopNotes] = useState('');
  const [addingStop, setAddingStop] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch cities
      const citiesRes = await fetch(`/api/cities?search=${searchQuery}`);
      const citiesData = await citiesRes.json();
      setCities(citiesData);

      // 2. Fetch saved destinations to toggle heart states (if logged in)
      const savedRes = await fetch('/api/saved-destinations');
      if (savedRes.ok) {
        const savedData = await savedRes.json();
        setSavedCities(savedData.map((sd: any) => sd.cityId));
      }

      // 3. Fetch user trips to fill selection modals
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
      const res = await fetch(`/api/cities?search=${searchQuery}&region=${regionFilter}&cost=${costFilter}&popularity=${popularityFilter}`);
      const data = await res.json();
      setCities(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Trigger search on filter changes
  useEffect(() => {
    handleSearch();
  }, [regionFilter, costFilter, popularityFilter]);

  const toggleSaveDestination = async (cityId: string) => {
    const isSaved = savedCities.includes(cityId);
    try {
      if (isSaved) {
        const res = await fetch(`/api/saved-destinations/${cityId}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setSavedCities(savedCities.filter((id) => id !== cityId));
        }
      } else {
        const res = await fetch('/api/saved-destinations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cityId }),
        });
        if (res.ok) {
          setSavedCities([...savedCities, cityId]);
        } else if (res.status === 401) {
          alert('Please log in to save destinations to your profile.');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddStopToTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTripId || !stopStartDate || !stopEndDate) return;

    setAddingStop(true);
    try {
      const res = await fetch(`/api/trips/${selectedTripId}/stops`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityId: addToTripCity.id,
          startDate: stopStartDate,
          endDate: stopEndDate,
          notes: stopNotes,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to assign stop to trip.');
      }

      alert(`Successfully added ${addToTripCity.name} to your trip!`);
      setAddToTripCity(null);
      setStopNotes('');
    } catch (e: any) {
      alert(e.message || 'Error occurred.');
    } finally {
      setAddingStop(false);
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
            Discover Destinations
          </h1>
          <p className="text-sm font-semibold text-brand-muted mt-2">
            Search our curated global catalog and schedule city stops on your upcoming trips.
          </p>
        </div>

        {/* Filters Panel */}
        <div className="bg-brand-surface border border-brand-border/60 rounded-3xl p-6 shadow-premium mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Text Search */}
            <div className="relative md:col-span-2">
              <input
                type="text"
                placeholder="Search by city, country, or region..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2.5 bg-brand-background border border-brand-border/60 rounded-full text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
              />
              <Search className="w-4 h-4 text-brand-muted absolute left-3.5 top-3" />
            </div>

            {/* Region Filter */}
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="px-4 py-2.5 bg-brand-background border border-brand-border/60 rounded-full text-xs font-semibold focus:outline-none text-brand-text cursor-pointer"
            >
              <option value="">All Regions</option>
              <option value="Europe">Europe</option>
              <option value="Asia">Asia</option>
              <option value="Middle East">Middle East</option>
              <option value="North America">North America</option>
            </select>

            {/* Cost Index Filter */}
            <select
              value={costFilter}
              onChange={(e) => setCostFilter(e.target.value)}
              className="px-4 py-2.5 bg-brand-background border border-brand-border/60 rounded-full text-xs font-semibold focus:outline-none text-brand-text cursor-pointer"
            >
              <option value="">All Budgets</option>
              <option value="2">Low ($$ or less)</option>
              <option value="3">Comfort ($$$ or less)</option>
              <option value="4">Premium ($$$$ or less)</option>
              <option value="5">Luxury ($$$$$)</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 border-t border-brand-border/60 pt-4">
            <div className="flex gap-4 w-full sm:w-auto">
              <select
                value={popularityFilter}
                onChange={(e) => setPopularityFilter(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 bg-brand-background border border-brand-border/60 rounded-full text-[10px] font-bold uppercase tracking-wider text-brand-text cursor-pointer"
              >
                <option value="">Any Popularity</option>
                <option value="8">Popular (8+ rating)</option>
                <option value="9">Top rated (9+ rating)</option>
              </select>
            </div>
            
            <button
              onClick={handleSearch}
              className="w-full sm:w-auto text-center bg-brand-primary hover:bg-brand-primary/95 text-brand-surface text-[10px] font-extrabold uppercase tracking-wider px-5 py-2.5 rounded-full shadow-premium transition-all cursor-pointer"
            >
              Query Database
            </button>
          </div>
        </div>

        {/* Cities Grid List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
          </div>
        ) : cities.length === 0 ? (
          <div className="bg-brand-surface border border-brand-border/60 rounded-3xl p-12 text-center shadow-premium max-w-md mx-auto">
            <Compass className="w-10 h-10 text-brand-primary/30 mx-auto animate-pulse-slow" />
            <h3 className="font-serif text-lg font-bold text-brand-dark mt-4">No destinations found</h3>
            <p className="text-xs text-brand-muted mt-1 leading-relaxed font-semibold">
              Try adjusting your filters or checking spelling details in search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cities.map((city) => {
              const isSaved = savedCities.includes(city.id);
              const costDollars = '$'.repeat(city.costIndex);
              
              return (
                <div
                  key={city.id}
                  className="bg-brand-surface border border-brand-border/60 rounded-3xl overflow-hidden shadow-premium hover:shadow-premium-hover transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="h-48 relative overflow-hidden bg-brand-dark">
                    <img
                      src={city.imageUrl}
                      alt={city.name}
                      className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                      <span className="bg-white/20 backdrop-blur-md text-white border border-white/20 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full">
                        {city.region}
                      </span>
                      <button
                        onClick={() => toggleSaveDestination(city.id)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center border focus:outline-none transition-all shadow-premium cursor-pointer ${
                          isSaved
                            ? 'bg-brand-accent/15 border-brand-accent text-brand-accent'
                            : 'bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white hover:text-brand-accent'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isSaved ? 'fill-brand-accent' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-serif text-2xl font-bold text-brand-dark leading-tight">
                          {city.name}
                        </h3>
                        <div className="flex items-center gap-0.5 text-xs text-brand-muted font-bold">
                          <Star className="w-3.5 h-3.5 fill-brand-secondary text-brand-secondary" />
                          <span className="text-brand-primary">{city.popularity}.0</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-brand-accent font-bold uppercase tracking-wider mt-0.5">
                        {city.country}
                      </p>
                      
                      <p className="text-xs text-brand-text/80 mt-3.5 leading-relaxed font-medium line-clamp-3">
                        {city.description}
                      </p>
                    </div>

                    <div className="border-t border-brand-border/60 pt-4 mt-6 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-brand-muted uppercase tracking-wider">
                          Budget Level
                        </span>
                        <span className="text-xs font-bold text-brand-primary font-mono mt-0.5">
                          {costDollars}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          if (userTrips.length === 0) {
                            alert('You do not have any trips planned. Go to My Trips to create a trip first.');
                            return;
                          }
                          setAddToTripCity(city);
                          setSelectedTripId(userTrips[0]?.id || '');
                          
                          // Autofill dates based on first trip
                          const trip = userTrips[0];
                          if (trip) {
                            setStopStartDate(new Date(trip.startDate).toISOString().split('T')[0]);
                            setStopEndDate(new Date(trip.endDate).toISOString().split('T')[0]);
                          }
                        }}
                        className="bg-brand-primary hover:bg-brand-primary/95 text-brand-surface text-[10px] font-extrabold uppercase tracking-wider px-5 py-2.5 rounded-full shadow-premium flex items-center gap-1 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Add To Trip</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Assign Stop Modal */}
        {addToTripCity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm">
            <div className="bg-brand-surface border border-brand-border/60 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-depth">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-brand-dark">Schedule stop</h3>
                  <p className="text-[9px] text-brand-accent font-bold uppercase tracking-wider mt-0.5">
                    Assigning {addToTripCity.name}
                  </p>
                </div>
                <button
                  onClick={() => setAddToTripCity(null)}
                  className="text-brand-muted hover:text-brand-dark focus:outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddStopToTrip} className="space-y-4 text-left">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark mb-1">
                    Select Active Trip
                  </label>
                  <select
                    value={selectedTripId}
                    onChange={(e) => {
                      setSelectedTripId(e.target.value);
                      const trip = userTrips.find((t) => t.id === e.target.value);
                      if (trip) {
                        setStopStartDate(new Date(trip.startDate).toISOString().split('T')[0]);
                        setStopEndDate(new Date(trip.endDate).toISOString().split('T')[0]);
                      }
                    }}
                    className="w-full px-3 py-2.5 bg-brand-background border border-brand-border rounded-xl text-xs font-semibold focus:outline-none"
                    required
                  >
                    {userTrips.map((trip) => (
                      <option key={trip.id} value={trip.id}>
                        {trip.title} ({new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark mb-1">
                      Arrival Date
                    </label>
                    <input
                      type="date"
                      value={stopStartDate}
                      onChange={(e) => setStopStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-brand-background border border-brand-border rounded-xl text-xs font-semibold focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark mb-1">
                      Departure Date
                    </label>
                    <input
                      type="date"
                      value={stopEndDate}
                      onChange={(e) => setStopEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-brand-background border border-brand-border rounded-xl text-xs font-semibold focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark mb-1">
                    Notes
                  </label>
                  <textarea
                    value={stopNotes}
                    onChange={(e) => setStopNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-brand-background border border-brand-border rounded-xl text-xs font-semibold focus:outline-none resize-none"
                    placeholder="Lodging details, local places to check out..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAddToTripCity(null)}
                    disabled={addingStop}
                    className="px-4 py-2 border border-brand-border text-brand-muted rounded-full text-xs font-bold uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingStop}
                    className="px-5 py-2 bg-brand-primary text-brand-surface rounded-full text-xs font-bold uppercase shadow-premium flex items-center gap-1.5"
                  >
                    {addingStop ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      'Save Stop'
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

import { Suspense } from 'react';

export default function CitiesExplorerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    }>
      <CitiesExplorer />
    </Suspense>
  );
}
