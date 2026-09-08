'use client';

import React, { useState } from 'react';
import { Calendar, List, Clock, DollarSign, MapPin } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ClientViewTogglerProps {
  trip: any;
}

export default function ClientViewToggler({ trip }: ClientViewTogglerProps) {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});

  const toggleDayExpanded = (dayKey: string) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayKey]: !prev[dayKey],
    }));
  };

  // Helper: Get dates array between start and end date
  const getDatesForStop = (startStr: string, endStr: string) => {
    const dates: Date[] = [];
    const start = new Date(startStr);
    const end = new Date(endStr);
    let limit = 0;
    while (start <= end && limit < 15) {
      dates.push(new Date(start));
      start.setDate(start.getDate() + 1);
      limit++;
    }
    return dates;
  };

  return (
    <div className="space-y-6">
      
      {/* View Switcher bar */}
      <div className="bg-brand-surface border border-brand-border/60 rounded-full p-1.5 flex justify-between items-center max-w-sm shadow-premium select-none">
        <button
          onClick={() => setViewMode('list')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            viewMode === 'list'
              ? 'bg-brand-primary text-brand-surface shadow-premium'
              : 'text-brand-muted hover:text-brand-primary'
          }`}
        >
          <List className="w-4 h-4" />
          <span>Timeline List</span>
        </button>
        <button
          onClick={() => setViewMode('calendar')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            viewMode === 'calendar'
              ? 'bg-brand-primary text-brand-surface shadow-premium'
              : 'text-brand-muted hover:text-brand-primary'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Calendar Grid</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="space-y-6">
        {trip.stops.length === 0 ? (
          <div className="bg-brand-surface border border-brand-border/60 rounded-3xl p-10 text-center shadow-premium">
            <span className="text-2xl">🗓️</span>
            <h4 className="font-serif text-lg font-bold text-brand-dark mt-2">No schedules planned yet</h4>
            <p className="text-xs text-brand-muted mt-1 leading-relaxed">
              Use the Itinerary Builder above to specify city stops and allocate daily activities.
            </p>
          </div>
        ) : viewMode === 'list' ? (
          // Timeline List View
          <div className="space-y-6">
            {trip.stops.map((stop: any, stopIdx: number) => {
              const dates = getDatesForStop(stop.startDate, stop.endDate);
              return (
                <div key={stop.id} className="space-y-4">
                  {/* City stop banner */}
                  <div className="border-l-4 border-brand-primary pl-4 text-left">
                    <span className="text-[10px] font-bold text-brand-accent uppercase tracking-widest">
                      Stop 0{stopIdx + 1}
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-brand-dark mt-0.5">
                      {stop.city.name}, {stop.city.country}
                    </h3>
                  </div>

                  {/* Day-by-Day Timeline vertical cards */}
                  <div className="space-y-3">
                    {dates.map((date, dateIdx) => {
                      const dateStr = date.toISOString().split('T')[0];
                      const dayItems = stop.itineraryItems.filter((item: any) => 
                        new Date(item.date).toISOString().split('T')[0] === dateStr
                      );
                      dayItems.sort((a: any, b: any) => a.itemOrder - b.itemOrder);

                      const dayKey = `${stop.id}-${dateStr}`;
                      const isExpanded = expandedDays[dayKey] !== false; // Default expanded

                      return (
                        <div key={dateStr} className="bg-brand-surface border border-brand-border/60 rounded-3xl overflow-hidden shadow-premium text-left">
                          <button
                            onClick={() => toggleDayExpanded(dayKey)}
                            className="w-full px-6 py-4 flex justify-between items-center hover:bg-brand-primary/5 transition-colors focus:outline-none"
                          >
                            <div className="flex items-baseline gap-2">
                              <span className="font-serif text-lg font-bold text-brand-primary">Day 0{dateIdx + 1}</span>
                              <span className="text-xs text-brand-muted font-semibold">
                                ({date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })})
                              </span>
                            </div>
                            <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">
                              {dayItems.length} Activities
                            </span>
                          </button>

                          {isExpanded && (
                            <div className="px-6 pb-6 pt-2 border-t border-brand-border/40 space-y-4 bg-brand-surface/20">
                              {dayItems.length === 0 ? (
                                <p className="text-xs text-brand-muted/70 italic py-2">No activities scheduled for this day.</p>
                              ) : (
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
                                          {item.notes && (
                                            <div className="mt-3 bg-brand-background rounded-2xl p-3 border border-brand-border/40 text-[10px] text-brand-text/90 italic font-medium">
                                              Notes: {item.notes}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Calendar Grid View (horizontal cards mapping stops)
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trip.stops.map((stop: any) => {
              const dates = getDatesForStop(stop.startDate, stop.endDate);
              return (
                <div key={stop.id} className="bg-brand-surface border border-brand-border/60 rounded-3xl p-6 shadow-premium text-left">
                  <h3 className="font-serif text-xl font-bold text-brand-primary leading-tight">{stop.city.name}</h3>
                  <p className="text-[10px] text-brand-accent font-bold uppercase tracking-wider mt-0.5">{stop.city.country}</p>
                  
                  <div className="mt-6 space-y-4">
                    {dates.map((date, idx) => {
                      const dateStr = date.toISOString().split('T')[0];
                      const dayItems = stop.itineraryItems.filter((item: any) => 
                        new Date(item.date).toISOString().split('T')[0] === dateStr
                      );

                      return (
                        <div key={dateStr} className="pb-3 border-b border-brand-border/40 last:border-0 last:pb-0">
                          <span className="text-xs font-extrabold text-brand-dark block">
                            Day {idx + 1} ({date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                          </span>
                          
                          <div className="mt-2 space-y-1.5">
                            {dayItems.map((item: any) => (
                              <div key={item.id} className="flex justify-between items-center text-[11px] font-semibold text-brand-muted">
                                <span className="truncate pr-3">⏱ {item.startTime || '09:00'} - {item.activity.name}</span>
                                <span className="font-mono text-brand-primary">{formatCurrency(item.customCost !== null ? item.customCost : item.activity.estimatedCost)}</span>
                              </div>
                            ))}
                            {dayItems.length === 0 && (
                              <span className="text-[10px] text-brand-muted/70 italic block">No activities scheduled</span>
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
        )}
      </div>

    </div>
  );
}
