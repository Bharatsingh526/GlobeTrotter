'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Clock,
  DollarSign,
  Search,
  Compass,
  ArrowRight,
  Loader2,
  AlertTriangle,
  ChevronRight,
  Heart,
  ChevronDown,
  Edit,
  Save,
  X
} from 'lucide-react';
import { formatDateRange, formatCurrency } from '@/lib/utils';

// Helper component for Sortable Activity Card
function SortableActivityCard({ item, onEdit, onDelete }: { item: any; onEdit: () => void; onDelete: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const cost = item.customCost !== null ? item.customCost : item.activity.estimatedCost;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-brand-surface border border-brand-border/60 rounded-2xl p-4 shadow-premium hover:shadow-premium-hover transition-all flex justify-between items-center group relative"
    >
      {/* Drag handle area */}
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing pr-3 flex items-center h-full text-brand-muted hover:text-brand-primary">
        ⋮⋮
      </div>

      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] bg-brand-primary/5 text-brand-primary font-bold px-2 py-0.5 rounded-full border border-brand-primary/10">
            {item.startTime || '09:00'} - {item.endTime || '10:00'}
          </span>
          <span className="text-[10px] text-brand-accent font-bold uppercase tracking-wider">
            {item.activity.category}
          </span>
        </div>
        <h4 className="font-serif text-sm font-bold text-brand-dark mt-1.5 leading-tight truncate">
          {item.activity.name}
        </h4>
        {item.notes && (
          <p className="text-[11px] text-brand-muted mt-1 italic line-clamp-1">{item.notes}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-brand-primary font-mono">
          {formatCurrency(cost)}
        </span>

        <div className="flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1.5 text-brand-muted hover:text-brand-primary hover:bg-brand-primary/5 rounded-full cursor-pointer"
            title="Edit Schedule"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-brand-muted hover:text-brand-accent hover:bg-brand-accent/5 rounded-full cursor-pointer"
            title="Remove Activity"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface ItineraryBuilderProps {
  tripId: string;
}

export default function ItineraryBuilder({ tripId }: ItineraryBuilderProps) {
  const router = useRouter();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tabs for mobile layout
  const [activeTab, setActiveTab] = useState<'stops' | 'itinerary' | 'explorer'>('itinerary');

  // Search & catalogs
  const [cities, setCities] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [citySearch, setCitySearch] = useState('');
  const [activitySearch, setActivitySearch] = useState('');
  const [selectedActivityCategory, setSelectedActivityCategory] = useState('');

  // Modal forms
  const [activeStopModal, setActiveStopModal] = useState<boolean>(false);
  const [newStopCityId, setNewStopCityId] = useState('');
  const [newStopStartDate, setNewStopStartDate] = useState('');
  const [newStopEndDate, setNewStopEndDate] = useState('');
  const [newStopNotes, setNewStopNotes] = useState('');

  const [editItem, setEditItem] = useState<any | null>(null);
  const [editItemStartTime, setEditItemStartTime] = useState('');
  const [editItemEndTime, setEditItemEndTime] = useState('');
  const [editItemCost, setEditItemCost] = useState(0);
  const [editItemNotes, setEditItemNotes] = useState('');

  // Sensors for dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchTripDetails();
    fetchCitiesCatalog();
    fetchActivitiesCatalog();
  }, [tripId]);

  const fetchTripDetails = async () => {
    try {
      const res = await fetch(`/api/trips/${tripId}`);
      if (!res.ok) throw new Error('Failed to load trip details');
      const data = await res.json();
      setTrip(data);
    } catch (e: any) {
      setError(e.message || 'Could not fetch trip info.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCitiesCatalog = async (query = '') => {
    try {
      const res = await fetch(`/api/cities?search=${query}`);
      if (res.ok) {
        const data = await res.json();
        setCities(data);
      }
    } catch (e) {}
  };

  const fetchActivitiesCatalog = async (query = '', cat = '') => {
    try {
      const res = await fetch(`/api/activities?search=${query}&category=${cat}`);
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch (e) {}
  };

  // 1. STOPS ACTIONS
  const handleAddStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStopCityId || !newStopStartDate || !newStopEndDate) return;

    try {
      const res = await fetch(`/api/trips/${tripId}/stops`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityId: newStopCityId,
          startDate: newStopStartDate,
          endDate: newStopEndDate,
          notes: newStopNotes,
        }),
      });

      if (!res.ok) throw new Error('Failed to create stop');
      
      setActiveStopModal(false);
      setNewStopCityId('');
      setNewStopNotes('');
      fetchTripDetails();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDeleteStop = async (stopId: string) => {
    if (!confirm('Are you sure you want to remove this city stop? All scheduled day activities for this stop will be deleted.')) return;
    
    try {
      const res = await fetch(`/api/trips/${tripId}/stops/${stopId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Could not delete stop');
      fetchTripDetails();
    } catch (e: any) {
      alert(e.message);
    }
  };

  // 2. ITINERARY ACTIONS
  const handleAddActivityToDay = async (activityId: string, stopId: string, dateStr: string) => {
    try {
      const res = await fetch(`/api/trips/${tripId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripStopId: stopId,
          activityId,
          date: dateStr,
          startTime: '09:00',
          endTime: '10:00',
        }),
      });

      if (!res.ok) throw new Error('Failed to add activity');
      fetchTripDetails();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;

    try {
      const res = await fetch(`/api/trips/${tripId}/activities/${editItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: editItemStartTime,
          endTime: editItemEndTime,
          customCost: editItemCost,
          notes: editItemNotes,
        }),
      });

      if (!res.ok) throw new Error('Failed to update activity schedule');
      setEditItem(null);
      fetchTripDetails();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Remove this activity from your schedule?')) return;

    try {
      const res = await fetch(`/api/trips/${tripId}/activities/${itemId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete activity');
      fetchTripDetails();
    } catch (e: any) {
      alert(e.message);
    }
  };

  // 3. DRAG & DROP REORDERING
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Find active and over items in the trip itinerary structure
    let activeItem: any = null;
    let overItem: any = null;
    let stopContext: any = null;
    let dateContext: string = '';

    // Search itinerary items
    for (const stop of trip.stops) {
      // Find days in this stop
      const dates = getDatesForStop(stop.startDate, stop.endDate);
      for (const d of dates) {
        const dayStr = d.toISOString().split('T')[0];
        const dayItems = stop.itineraryItems.filter((item: any) => 
          new Date(item.date).toISOString().split('T')[0] === dayStr
        );
        
        const actIdx = dayItems.find((i: any) => i.id === active.id);
        const ovIdx = dayItems.find((i: any) => i.id === over.id);

        if (actIdx) {
          activeItem = actIdx;
          stopContext = stop;
          dateContext = dayStr;
        }
        if (ovIdx) overItem = ovIdx;
      }
    }

    if (!activeItem || !overItem) return;

    // Retrieve items scheduled for the target day
    const targetDayItems = stopContext.itineraryItems.filter((item: any) => 
      new Date(item.date).toISOString().split('T')[0] === dateContext
    );

    const oldIndex = targetDayItems.findIndex((i: any) => i.id === active.id);
    const newIndex = targetDayItems.findIndex((i: any) => i.id === over.id);

    const reorderedItems = arrayMove(targetDayItems, oldIndex, newIndex);
    const itemIds = reorderedItems.map((item: any) => item.id);

    // Optimistic UI update
    const updatedStops = trip.stops.map((stop: any) => {
      if (stop.id === stopContext.id) {
        const otherDayItems = stop.itineraryItems.filter((item: any) => 
          new Date(item.date).toISOString().split('T')[0] !== dateContext
        );
        return {
          ...stop,
          itineraryItems: [...otherDayItems, ...reorderedItems.map((item, index) => ({ ...item, itemOrder: index + 1 }))],
        };
      }
      return stop;
    });

    setTrip({ ...trip, stops: updatedStops });

    try {
      await fetch(`/api/trips/${tripId}/activities`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemIds,
          date: dateContext,
          tripStopId: stopContext.id,
        }),
      });
    } catch (e) {
      fetchTripDetails(); // Fallback on error
    }
  };

  // Helper: Get dates array between start and end date
  const getDatesForStop = (startStr: string, endStr: string) => {
    const dates: Date[] = [];
    const start = new Date(startStr);
    const end = new Date(endStr);
    
    // Safety limit to avoid infinite loops
    let limit = 0;
    while (start <= end && limit < 15) {
      dates.push(new Date(start));
      start.setDate(start.getDate() + 1);
      limit++;
    }
    return dates;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="bg-brand-accent/10 border border-brand-accent/30 text-brand-accent rounded-3xl p-6 text-center max-w-md mx-auto my-12">
        <h3 className="font-serif text-lg font-bold">Failed to load builder</h3>
        <p className="text-xs mt-1">{error || 'Trip details not found.'}</p>
        <button onClick={fetchTripDetails} className="mt-4 bg-brand-accent text-white px-5 py-2 rounded-full text-xs font-bold uppercase">
          Retry
        </button>
      </div>
    );
  }

  // Calculate total costs from all itinerary items
  let totalEstimatedCost = 0;
  let itineraryItemsCount = 0;
  
  trip.stops.forEach((stop: any) => {
    stop.itineraryItems.forEach((item: any) => {
      totalEstimatedCost += item.customCost !== null ? item.customCost : item.activity.estimatedCost;
      itineraryItemsCount++;
    });
  });

  return (
    <div className="flex flex-col h-[calc(screen-16px)]">
      
      {/* Sub-Header bar */}
      <div className="bg-brand-surface border-b border-brand-border/60 py-4 px-4 sm:px-6 md:px-8 flex flex-col sm:flex-row gap-3 justify-between sm:items-center shadow-inner">
        <div>
          <span className="text-[10px] font-bold text-brand-accent uppercase tracking-widest">Itinerary Builder</span>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-brand-dark leading-tight">{trip.title}</h1>
          <p className="text-xs text-brand-muted font-semibold mt-0.5">
            {formatDateRange(trip.startDate, trip.endDate)}
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3 flex-wrap">
          <Link
            href={`/trips/${tripId}`}
            className="flex-1 sm:flex-initial text-center px-4 sm:px-5 py-2 bg-brand-surface hover:bg-brand-background text-brand-primary border border-brand-border rounded-full text-xs font-bold uppercase tracking-wider transition-all"
          >
            Preview
          </Link>
          <Link
            href={`/trips/${tripId}/budget`}
            className="flex-1 sm:flex-initial text-center px-4 sm:px-5 py-2 bg-brand-primary hover:bg-brand-primary/95 text-brand-surface rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-premium"
          >
            Budget Analysis
          </Link>
        </div>
      </div>

      {/* Mobile Tab Swapper */}
      <div className="flex md:hidden bg-brand-surface border-b border-brand-border/60 text-xs font-bold uppercase tracking-wider text-brand-muted select-none">
        <button
          onClick={() => setActiveTab('stops')}
          className={`flex-1 py-3 text-center border-b-2 ${activeTab === 'stops' ? 'border-brand-primary text-brand-primary bg-brand-background/30' : 'border-transparent'}`}
        >
          01 Stops ({trip.stops.length})
        </button>
        <button
          onClick={() => setActiveTab('itinerary')}
          className={`flex-1 py-3 text-center border-b-2 ${activeTab === 'itinerary' ? 'border-brand-primary text-brand-primary bg-brand-background/30' : 'border-transparent'}`}
        >
          02 Timeline
        </button>
        <button
          onClick={() => setActiveTab('explorer')}
          className={`flex-1 py-3 text-center border-b-2 ${activeTab === 'explorer' ? 'border-brand-primary text-brand-primary bg-brand-background/30' : 'border-transparent'}`}
        >
          03 Catalog
        </button>
      </div>

      {/* Main Builder Columns Container */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6 px-4 md:px-8 py-6 h-full overflow-y-auto">
        
        {/* Column 1: Trip Stops (1/4 width on desktop) */}
        <div className={`md:col-span-1 space-y-6 flex flex-col ${activeTab !== 'stops' ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex justify-between items-center">
            <h2 className="font-serif text-lg font-bold text-brand-dark">Stops List</h2>
            <button
              onClick={() => {
                setNewStopStartDate(new Date(trip.startDate).toISOString().split('T')[0]);
                setNewStopEndDate(new Date(trip.endDate).toISOString().split('T')[0]);
                setActiveStopModal(true);
              }}
              className="p-1.5 rounded-full bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-brand-surface transition-all cursor-pointer"
              title="Add New City Stop"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto max-h-[70vh]">
            {trip.stops.length === 0 ? (
              <p className="text-xs text-brand-muted font-medium bg-brand-surface border border-brand-border/60 rounded-2xl p-4 text-center">
                Add a destination city stop to begin planning days.
              </p>
            ) : (
              trip.stops.map((stop: any) => (
                <div
                  key={stop.id}
                  className="bg-brand-surface border border-brand-border/60 rounded-2xl p-4 shadow-premium relative group flex flex-col justify-between"
                >
                  <div className="flex gap-3">
                    <img src={stop.city.imageUrl} alt={stop.city.name} className="w-12 h-12 rounded-xl object-cover" />
                    <div className="text-left flex-1 min-w-0">
                      <h4 className="font-serif text-sm font-bold text-brand-primary truncate">{stop.city.name}</h4>
                      <p className="text-[9px] text-brand-accent font-bold uppercase tracking-wider">{stop.city.country}</p>
                      <p className="text-[10px] text-brand-muted font-semibold mt-1">
                        {new Date(stop.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(stop.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {stop.notes && (
                    <p className="text-[10px] bg-brand-background text-brand-text/80 rounded-xl p-2.5 mt-3 border border-brand-border/40 text-left font-medium">
                      {stop.notes}
                    </p>
                  )}

                  <div className="border-t border-brand-border/40 pt-3 mt-3 flex justify-between items-center">
                    <span className="text-[9px] bg-brand-secondary/20 text-brand-dark border border-brand-secondary/40 font-bold px-2 py-0.5 rounded-full">
                      Order #{stop.stopOrder}
                    </span>
                    <button
                      onClick={() => handleDeleteStop(stop.id)}
                      className="p-1 rounded-full text-brand-muted hover:text-brand-accent hover:bg-brand-accent/5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Remove Stop"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Day-by-day Itinerary Timeline (2/4 width on desktop) */}
        <div className={`md:col-span-2 space-y-6 flex flex-col h-full ${activeTab !== 'itinerary' ? 'hidden md:flex' : 'flex'}`}>
          <h2 className="font-serif text-lg font-bold text-brand-dark">Timeline Schedule</h2>
          
          <div className="flex-1 overflow-y-auto max-h-[75vh] space-y-6 pr-2">
            {trip.stops.length === 0 ? (
              <div className="bg-brand-surface border border-brand-border/60 rounded-3xl p-10 text-center shadow-premium">
                <CalendarIcon className="w-8 h-8 text-brand-muted/40 mx-auto" />
                <h3 className="font-serif text-lg font-bold text-brand-dark mt-3">Start with a stop</h3>
                <p className="text-xs text-brand-muted mt-1 max-w-xs mx-auto font-medium">
                  Add stops in the left panel to populate days and schedule daily activities.
                </p>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                {trip.stops.map((stop: any, stopIdx: number) => {
                  const dates = getDatesForStop(stop.startDate, stop.endDate);
                  return (
                    <div key={stop.id} className="space-y-4">
                      {/* Stop Heading Banner */}
                      <div className="bg-brand-primary text-brand-surface rounded-2xl px-5 py-3.5 border border-brand-primary flex justify-between items-center shadow-premium">
                        <div>
                          <span className="text-[8px] font-extrabold uppercase tracking-widest text-brand-secondary">
                            Stop 0{stopIdx + 1}
                          </span>
                          <h3 className="font-serif text-lg font-bold">{stop.city.name.toUpperCase()}</h3>
                        </div>
                        <span className="text-[10px] bg-white/10 px-2.5 py-1 rounded-full text-white/90 font-bold border border-white/10">
                          {dates.length} Days
                        </span>
                      </div>

                      {/* Day list in this Stop */}
                      {dates.map((date, dateIdx) => {
                        const dateStr = date.toISOString().split('T')[0];
                        const dayItems = stop.itineraryItems.filter((item: any) => 
                          new Date(item.date).toISOString().split('T')[0] === dateStr
                        );
                        // Sort by itemOrder
                        dayItems.sort((a: any, b: any) => a.itemOrder - b.itemOrder);

                        return (
                          <div key={dateStr} className="bg-brand-surface/40 border border-brand-border/40 rounded-2xl p-4 space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-brand-border/40">
                              <div>
                                <span className="text-xs font-bold text-brand-primary uppercase tracking-wide">
                                  Day 0{dateIdx + 1}
                                </span>
                                <span className="text-[10px] text-brand-muted font-bold ml-2">
                                  {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                              <span className="text-[10px] font-bold text-brand-muted">
                                Items: {dayItems.length}
                              </span>
                            </div>

                            {/* Sortable Area for this Day */}
                            <SortableContext items={dayItems.map((i: any) => i.id)} strategy={verticalListSortingStrategy}>
                              <div className="space-y-2 min-h-[50px]">
                                {dayItems.map((item: any) => (
                                  <SortableActivityCard
                                    key={item.id}
                                    item={item}
                                    onEdit={() => {
                                      setEditItem(item);
                                      setEditItemStartTime(item.startTime || '09:00');
                                      setEditItemEndTime(item.endTime || '10:00');
                                      setEditItemCost(item.customCost !== null ? item.customCost : item.activity.estimatedCost);
                                      setEditItemNotes(item.notes || '');
                                    }}
                                    onDelete={() => handleDeleteItem(item.id)}
                                  />
                                ))}

                                {dayItems.length === 0 && (
                                  <p className="text-[10px] text-brand-muted/70 italic text-center py-4 font-semibold">
                                    No activities scheduled. Add activities from the catalog on the right.
                                  </p>
                                )}
                              </div>
                            </SortableContext>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </DndContext>
            )}
          </div>
        </div>

        {/* Column 3: Catalogs & search (1/4 width on desktop) */}
        <div className={`md:col-span-1 space-y-6 flex flex-col ${activeTab !== 'explorer' ? 'hidden md:flex' : 'flex'}`}>
          
          {/* Budget Overview Card */}
          <div className="bg-brand-primary text-brand-surface rounded-3xl p-5 shadow-premium text-left">
            <span className="text-[9px] font-bold text-brand-secondary uppercase tracking-widest">
              Itinerary Summary
            </span>
            <h3 className="font-serif text-xl font-bold mt-0.5">Budget Tracker</h3>
            
            <div className="mt-4 space-y-2 text-xs font-semibold text-white/80">
              <div className="flex justify-between">
                <span>Planned Stops:</span>
                <span className="text-white">{trip.stops.length} Cities</span>
              </div>
              <div className="flex justify-between">
                <span>Daily Activities:</span>
                <span className="text-white">{itineraryItemsCount} Scheduled</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
                <span>Total Est. Cost:</span>
                <span className="text-brand-secondary text-sm font-bold">{formatCurrency(totalEstimatedCost)}</span>
              </div>
            </div>
          </div>

          {/* Search/Catalog Toggles */}
          <div className="bg-brand-surface border border-brand-border/60 rounded-3xl p-4 shadow-premium space-y-4 flex-grow flex flex-col max-h-[50vh] overflow-y-auto">
            <div className="flex items-center gap-1.5 pb-2 border-b border-brand-border/60">
              <Compass className="w-4 h-4 text-brand-primary" />
              <h3 className="font-serif text-sm font-bold text-brand-dark">Activity Catalog</h3>
            </div>

            {/* Category selection */}
            <select
              value={selectedActivityCategory}
              onChange={(e) => {
                setSelectedActivityCategory(e.target.value);
                fetchActivitiesCatalog(activitySearch, e.target.value);
              }}
              className="w-full px-3 py-2 bg-brand-background border border-brand-border rounded-xl text-xs font-bold focus:outline-none"
            >
              <option value="">All Categories</option>
              <option value="ADVENTURE">Adventure</option>
              <option value="FOOD">Food</option>
              <option value="CULTURE">Culture</option>
              <option value="NATURE">Nature</option>
              <option value="NIGHTLIFE">Nightlife</option>
              <option value="SHOPPING">Shopping</option>
            </select>

            {/* Activity Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search catalog..."
                value={activitySearch}
                onChange={(e) => {
                  setActivitySearch(e.target.value);
                  fetchActivitiesCatalog(e.target.value, selectedActivityCategory);
                }}
                className="w-full pl-9 pr-3 py-2 bg-brand-background border border-brand-border rounded-full text-xs font-semibold focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-brand-muted absolute left-3 top-2.5" />
            </div>

            {/* Activity List catalog cards */}
            <div className="space-y-2 flex-1 overflow-y-auto">
              {activities.length === 0 ? (
                <p className="text-[10px] text-brand-muted text-center py-4">No matching activities found.</p>
              ) : (
                activities.map((act) => (
                  <div key={act.id} className="border border-brand-border/40 rounded-xl p-2.5 bg-brand-background/40 hover:bg-brand-background transition-colors text-left relative flex flex-col justify-between gap-1.5 group">
                    <div>
                      <h5 className="text-[11px] font-bold text-brand-primary truncate">{act.name}</h5>
                      <p className="text-[9px] text-brand-accent uppercase font-bold mt-0.5">{act.category} • {act.city.name}</p>
                      <p className="text-[10px] text-brand-muted mt-1 line-clamp-2 leading-snug">{act.description}</p>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-brand-border/20 text-[10px] font-semibold">
                      <span className="font-mono text-brand-primary">{formatCurrency(act.estimatedCost)}</span>
                      
                      {trip.stops.length > 0 && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <select
                            onChange={(e) => {
                              if (!e.target.value) return;
                              const [stopId, dateStr] = e.target.value.split('|');
                              handleAddActivityToDay(act.id, stopId, dateStr);
                              e.target.value = ''; // Reset select
                            }}
                            className="bg-brand-primary text-brand-surface text-[9px] px-1.5 py-0.5 rounded focus:outline-none cursor-pointer"
                          >
                            <option value="">+ Add to Day</option>
                            {trip.stops.map((stop: any) => {
                              const dates = getDatesForStop(stop.startDate, stop.endDate);
                              return dates.map((d, dIdx) => (
                                <option key={d.toISOString()} value={`${stop.id}|${d.toISOString()}`}>
                                  {stop.city.name} - Day {dIdx + 1}
                                </option>
                              ));
                            })}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* STOP ADDITION MODAL */}
      {activeStopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm">
          <div className="bg-brand-surface border border-brand-border/60 rounded-3xl p-6 max-w-sm w-full shadow-depth">
            <h3 className="font-serif text-lg font-bold text-brand-dark mb-4">Add Stop (City)</h3>
            <form onSubmit={handleAddStop} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark mb-1">Select City</label>
                <select
                  value={newStopCityId}
                  onChange={(e) => setNewStopCityId(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-background border border-brand-border rounded-xl text-xs font-semibold focus:outline-none"
                  required
                >
                  <option value="">-- Select Destination --</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name} ({city.country})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark mb-1">Start Date</label>
                <input
                  type="date"
                  value={newStopStartDate}
                  onChange={(e) => setNewStopStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-background border border-brand-border rounded-xl text-xs font-semibold focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark mb-1">End Date</label>
                <input
                  type="date"
                  value={newStopEndDate}
                  onChange={(e) => setNewStopEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-background border border-brand-border rounded-xl text-xs font-semibold focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark mb-1">Notes</label>
                <textarea
                  value={newStopNotes}
                  onChange={(e) => setNewStopNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-brand-background border border-brand-border rounded-xl text-xs font-semibold focus:outline-none resize-none"
                  placeholder="e.g. Staying at hotel near central train station"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStopModal(false)}
                  className="px-4 py-2 border border-brand-border text-brand-muted rounded-full text-xs font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-primary text-brand-surface rounded-full text-xs font-bold uppercase shadow-premium"
                >
                  Add Stop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACTIVITY SCHEDULING EDIT MODAL */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm">
          <div className="bg-brand-surface border border-brand-border/60 rounded-3xl p-6 max-w-sm w-full shadow-depth">
            <h3 className="font-serif text-lg font-bold text-brand-dark truncate mb-1">{editItem.activity.name}</h3>
            <p className="text-[10px] text-brand-accent font-bold uppercase tracking-wider mb-4">Edit Daily Schedule</p>
            
            <form onSubmit={handleUpdateItem} className="space-y-4 text-left">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark mb-1">Start Time</label>
                  <input
                    type="text"
                    value={editItemStartTime}
                    onChange={(e) => setEditItemStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-brand-background border border-brand-border rounded-xl text-xs font-semibold focus:outline-none"
                    placeholder="09:00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark mb-1">End Time</label>
                  <input
                    type="text"
                    value={editItemEndTime}
                    onChange={(e) => setEditItemEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-brand-background border border-brand-border rounded-xl text-xs font-semibold focus:outline-none"
                    placeholder="11:00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark mb-1">Custom Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editItemCost}
                  onChange={(e) => setEditItemCost(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-brand-background border border-brand-border rounded-xl text-xs font-semibold focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark mb-1">Notes</label>
                <textarea
                  value={editItemNotes}
                  onChange={(e) => setEditItemNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-brand-background border border-brand-border rounded-xl text-xs font-semibold focus:outline-none resize-none"
                  placeholder="e.g. Bring confirmation receipt"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  className="px-4 py-2 border border-brand-border text-brand-muted rounded-full text-xs font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-primary text-brand-surface rounded-full text-xs font-bold uppercase shadow-premium"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
