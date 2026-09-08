'use client';

import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Compass, Globe, Loader2, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface TripMapProps {
  stops: any[];
}

export default function TripMap({ stops }: TripMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [mapLoading, setMapLoading] = useState(true);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
    setMapboxToken(token);
    setMapLoading(false);
  }, []);

  // Mapbox initialization
  useEffect(() => {
    if (!mapboxToken || !mapContainerRef.current || stops.length === 0) return;

    mapboxgl.accessToken = mapboxToken;

    // Calculate center coordinates
    const lats = stops.map((s) => s.city.latitude);
    const lons = stops.map((s) => s.city.longitude);
    const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const centerLon = lons.reduce((a, b) => a + b, 0) / lons.length;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11', // Elegant minimalist light style
      center: [centerLon, centerLat],
      zoom: stops.length === 1 ? 8 : 3,
    });

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add markers and compile coordinates
    const coordinates: [number, number][] = [];

    stops.forEach((stop, index) => {
      const coord: [number, number] = [stop.city.longitude, stop.city.latitude];
      coordinates.push(coord);

      // Create custom HTML marker element matching our brand teal colors
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.backgroundColor = '#0F3D3E';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid #FFFDF8';
      el.style.boxShadow = '0 2px 10px rgba(15, 61, 62, 0.3)';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.color = '#FFFDF8';
      el.style.fontSize = '10px';
      el.style.fontWeight = 'bold';
      el.style.cursor = 'pointer';
      el.innerText = `${index + 1}`;

      el.addEventListener('click', () => {
        setSelectedCity(stop.city);
        map.flyTo({ center: coord, zoom: 6 });
      });

      new mapboxgl.Marker(el)
        .setLngLat(coord)
        .addTo(map);
    });

    // Draw route lines connecting cities on load
    map.on('load', () => {
      if (coordinates.length < 2) return;

      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: coordinates,
          },
        },
      });

      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#D96C4F', // Terracotta route color
          'line-width': 3,
          'line-dasharray': [2, 2], // Dashed animation path
        },
      });
    });

    return () => map.remove();
  }, [mapboxToken, stops]);

  if (mapLoading) {
    return (
      <div className="w-full h-[400px] bg-brand-surface rounded-3xl border border-brand-border/60 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  // Graceful High-Fidelity SVG projection map if Mapbox token is not configured
  if (!mapboxToken || stops.length === 0) {
    // If no stops, show blank placeholder
    if (stops.length === 0) {
      return (
        <div className="w-full h-[400px] bg-brand-surface border border-brand-border/60 rounded-3xl flex flex-col items-center justify-center p-6 text-center">
          <Compass className="w-10 h-10 text-brand-primary/20 animate-pulse-slow" />
          <h4 className="font-serif text-base font-bold text-brand-dark mt-3">Interactive Route Map</h4>
          <p className="text-xs text-brand-muted mt-1 max-w-xs leading-relaxed">
            Add stops to this trip to visualize your custom route and connection flights.
          </p>
        </div>
      );
    }

    // Proportional 2D projection drawing of stops onto a box
    const lats = stops.map((s) => s.city.latitude);
    const lons = stops.map((s) => s.city.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    const latRange = maxLat - minLat || 1;
    const lonRange = maxLon - minLon || 1;

    // Projected coordinate points mapping inside SVG coordinates box (50 to 450)
    const points = stops.map((stop) => {
      // Scale lat and lon proportionally to fit within 500x350 padding bounds
      const x = 50 + ((stop.city.longitude - minLon) / lonRange) * 400;
      const y = 350 - ((stop.city.latitude - minLat) / latRange) * 300; // Invert y coordinate for graphics orientation
      return { x, y, city: stop.city };
    });

    return (
      <div className="relative w-full h-[400px] bg-brand-surface border border-brand-border/60 rounded-3xl shadow-premium overflow-hidden p-6 flex flex-col justify-between select-none">
        
        {/* Banner */}
        <div className="text-left z-10 pointer-events-none">
          <span className="text-[10px] font-bold text-brand-accent uppercase tracking-widest block">Route Visualizer</span>
          <h3 className="font-serif text-lg font-bold text-brand-primary mt-0.5">Interactive Journey Map</h3>
          <p className="text-[10px] text-brand-muted mt-1 font-semibold">CLICK PINS TO INSPECT DESTINATIONS</p>
        </div>

        {/* SVG Drawing Canvas */}
        <svg viewBox="0 0 500 400" className="absolute inset-0 w-full h-full p-6 z-0">
          <g>
            {/* Latitude and Longitude Grid representation */}
            <line x1="20" y1="100" x2="480" y2="100" stroke="#E2DCD0" strokeWidth="0.5" strokeDasharray="3" />
            <line x1="20" y1="200" x2="480" y2="200" stroke="#E2DCD0" strokeWidth="0.5" strokeDasharray="3" />
            <line x1="20" y1="300" x2="480" y2="300" stroke="#E2DCD0" strokeWidth="0.5" strokeDasharray="3" />
            <line x1="125" y1="20" x2="125" y2="380" stroke="#E2DCD0" strokeWidth="0.5" strokeDasharray="3" />
            <line x1="250" y1="20" x2="250" y2="380" stroke="#E2DCD0" strokeWidth="0.5" strokeDasharray="3" />
            <line x1="375" y1="20" x2="375" y2="380" stroke="#E2DCD0" strokeWidth="0.5" strokeDasharray="3" />
          </g>

          {/* Draw connecting flight paths */}
          {points.map((pt, idx) => {
            if (idx === 0) return null;
            const prev = points[idx - 1];

            // Curve drawing variables for custom Bezier curve (adds subtle curved flights!)
            const midX = (prev.x + pt.x) / 2;
            const midY = (prev.y + pt.y) / 2 - 30; // Curve slightly upwards

            return (
              <g key={`path-${idx}`}>
                {/* Curved dashed route line */}
                <path
                  d={`M ${prev.x} ${prev.y} Q ${midX} ${midY} ${pt.x} ${pt.y}`}
                  fill="none"
                  stroke="#D96C4F" // Terracotta route color
                  strokeWidth="2.5"
                  strokeDasharray="5 5"
                  className="animate-route"
                />

                {/* Micro flight dot pulsing along path */}
                <circle r="4" fill="#0F3D3E">
                  <animateMotion
                    path={`M ${prev.x} ${prev.y} Q ${midX} ${midY} ${pt.x} ${pt.y}`}
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            );
          })}

          {/* Draw Interactive Pin nodes */}
          {points.map((pt, idx) => (
            <g
              key={`pin-${idx}`}
              onClick={() => setSelectedCity(pt.city)}
              className="cursor-pointer group"
            >
              {/* Outer Ripple */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r="16"
                fill="rgba(15, 61, 62, 0.05)"
                className="group-hover:scale-125 transition-transform origin-center"
              />
              
              {/* Center Dot */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r="8"
                fill="#0F3D3E"
                stroke="#FFFDF8"
                strokeWidth="2"
              />

              {/* Order Label */}
              <text
                x={pt.x}
                y={pt.y + 3}
                fill="#FFFDF8"
                fontSize="8px"
                fontWeight="bold"
                textAnchor="middle"
                className="select-none pointer-events-none"
              >
                {idx + 1}
              </text>

              {/* City Name Text Label */}
              <text
                x={pt.x}
                y={pt.y - 12}
                fill="#243333"
                fontSize="9px"
                fontWeight="bold"
                textAnchor="middle"
                className="bg-white/80 p-0.5 rounded shadow-sm opacity-90"
              >
                {pt.city.name}
              </text>
            </g>
          ))}
        </svg>

        {/* Selected City Details overlay card */}
        {selectedCity ? (
          <div className="bg-brand-surface border border-brand-border/80 rounded-2xl p-4 shadow-depth z-10 w-full max-w-sm mx-auto flex items-center justify-between gap-4 mt-auto">
            <div className="flex gap-3 text-left">
              <img src={selectedCity.imageUrl} alt={selectedCity.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
              <div>
                <h4 className="font-serif text-sm font-bold text-brand-primary leading-tight">{selectedCity.name}</h4>
                <p className="text-[9px] text-brand-accent font-bold uppercase tracking-wider">{selectedCity.country}</p>
                <p className="text-[10px] text-brand-muted mt-1 leading-snug line-clamp-2">{selectedCity.description}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedCity(null)}
              className="text-brand-muted hover:text-brand-dark focus:outline-none shrink-0 font-bold p-1 hover:bg-brand-background rounded-full text-xs"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="text-center w-full z-10 text-[9px] font-bold text-brand-muted mt-auto">
            Stops Route: {stops.map((s) => s.city.name).join(' → ') || 'None'}
          </div>
        )}

      </div>
    );
  }

  // Mapbox rendering element container (only loads if mapboxToken exists)
  return (
    <div className="relative w-full h-[400px] rounded-3xl border border-brand-border/60 shadow-premium overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Detail Overlay */}
      {selectedCity && (
        <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-80 bg-brand-surface border border-brand-border rounded-3xl p-5 shadow-depth z-20 text-left flex flex-col gap-4">
          <div className="flex gap-3">
            <img src={selectedCity.imageUrl} alt={selectedCity.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
            <div>
              <h4 className="font-serif text-base font-bold text-brand-primary leading-tight">{selectedCity.name}</h4>
              <p className="text-[9px] text-brand-accent font-bold uppercase tracking-wider">{selectedCity.country}</p>
              <p className="text-[10px] text-brand-muted mt-1.5 leading-relaxed line-clamp-2">{selectedCity.description}</p>
            </div>
          </div>
          <div className="border-t border-brand-border/60 pt-3 flex justify-between items-center text-xs font-semibold">
            <span>Budget: <strong className="text-brand-primary">{"$".repeat(selectedCity.costIndex)}</strong></span>
            <button
              onClick={() => setSelectedCity(null)}
              className="text-brand-accent hover:text-brand-accent/90 uppercase tracking-wider text-[9px] font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
