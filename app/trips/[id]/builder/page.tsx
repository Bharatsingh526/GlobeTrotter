import React from 'react';
import ItineraryBuilder from '@/components/itinerary/ItineraryBuilder';
import Navbar from '@/components/navigation/Navbar';

export default function TripBuilderPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="min-h-screen bg-brand-background flex flex-col">
      <ItineraryBuilder tripId={params.id} />
    </div>
  );
}
