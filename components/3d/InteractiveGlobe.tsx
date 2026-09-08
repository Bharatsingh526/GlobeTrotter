'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe as GlobeIcon, MapPin, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Example cities data from prompt requirements
const CITIES = [
  { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, color: '#D96C4F', desc: 'The city of light, romance, and iconic art.', cost: '$$$$', pop: '9.8/10', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=400' },
  { name: 'Rome', country: 'Italy', lat: 41.9028, lon: 12.4964, color: '#E89B3D', desc: 'A historic cradle of ancient ruins and pasta.', cost: '$$$', pop: '9.2/10', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=400' },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, color: '#D96C4F', desc: 'Futuristic neon alleys and ancient shrines.', cost: '$$$$', pop: '9.9/10', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=400' },
  { name: 'Dubai', country: 'UAE', lat: 25.2048, lon: 55.2708, color: '#E89B3D', desc: 'World-record skyscrapers and luxury shopping.', cost: '$$$$$', pop: '9.5/10', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=400' },
  { name: 'London', country: 'UK', lat: 51.5074, lon: -0.1278, color: '#D96C4F', desc: 'Royal histories, museums, and cozy rain walks.', cost: '$$$$', pop: '9.3/10', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=400' },
  { name: 'New York', country: 'USA', lat: 40.7128, lon: -74.0060, color: '#E89B3D', desc: 'The concrete jungle that never sleeps.', cost: '$$$$$', pop: '9.7/10', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=400' },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198, color: '#D96C4F', desc: 'Futuristic botanical gardens and street food.', cost: '$$$$', pop: '9.4/10', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&q=80&w=400' },
  { name: 'Bali', country: 'Indonesia', lat: -8.4095, lon: 115.1889, color: '#E89B3D', desc: 'Spiritual temples, beach clubs, and rice terraces.', cost: '$$', pop: '9.6/10', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=400' },
];

// Conversions from Lat/Lon to Cartesian coordinates (Sphere radius = 2)
function convertLatLngToVector3(lat: number, lon: number, radius = 2) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.sin(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.cos(theta);

  return new THREE.Vector3(x, y, z);
}

function GlobeSphere({ onSelectCity }: { onSelectCity: (city: any) => void }) {
  const globeRef = useRef<THREE.Group>(null);

  // Auto-rotate the globe slowly
  useFrame((state) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <group ref={globeRef}>
      {/* Outer Atmosphere Glow Effect */}
      <mesh>
        <sphereGeometry args={[2.08, 32, 32]} />
        <meshBasicMaterial
          color="#0F3D3E"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Earth Surface Sphere */}
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        {/* Editorial style wireframe grid for tactile premium feel */}
        <meshStandardMaterial
          color="#172323"
          wireframe
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Solid inner core for shading */}
      <mesh>
        <sphereGeometry args={[1.99, 32, 32]} />
        <meshStandardMaterial
          color="#FFFDF8" // brand.surface
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* City Markers */}
      {CITIES.map((city, idx) => {
        const pos = convertLatLngToVector3(city.lat, city.lon, 2);
        return (
          <group key={idx} position={pos}>
            {/* Pulsing visual core */}
            <mesh onClick={() => onSelectCity(city)}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshBasicMaterial color={city.color} />
            </mesh>

            {/* Subtle floating ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.08, 0.1, 16]} />
              <meshBasicMaterial color={city.color} transparent opacity={0.6} side={THREE.DoubleSide} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export default function InteractiveGlobe() {
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if WebGL is supported
    try {
      const canvas = document.createElement('canvas');
      const support = !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      setHasWebGL(support);
    } catch (e) {
      setHasWebGL(false);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[400px] md:h-[500px] flex items-center justify-center bg-brand-surface rounded-3xl border border-brand-border/60 shadow-premium">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  // Graceful 2D Fallback Map in SVG format if WebGL is not available
  if (!hasWebGL) {
    return (
      <div className="relative w-full h-[400px] md:h-[500px] bg-brand-surface rounded-3xl border border-brand-border/60 shadow-premium p-6 flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute top-6 left-6 text-left">
          <span className="text-xs font-bold text-brand-accent uppercase tracking-widest">Interactive Fallback Map</span>
          <h3 className="font-serif text-2xl text-brand-primary mt-1">Global Shared Hub</h3>
        </div>

        {/* Vector SVG Grid showing interactive pins */}
        <div className="relative w-72 h-72 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-brand-primary/20 bg-brand-background/40 flex items-center justify-center">
            {/* Lat/Lon grid rings */}
            <div className="w-[85%] h-[85%] rounded-full border border-brand-primary/10 absolute" />
            <div className="w-[60%] h-[60%] rounded-full border border-brand-primary/10 absolute" />
            <div className="w-full h-[1px] bg-brand-primary/10 absolute" />
            <div className="w-[1px] h-full bg-brand-primary/10 absolute" />
          </div>

          {/* Interactive fallback circles */}
          <div className="absolute inset-0 z-10">
            {CITIES.map((city, idx) => {
              // Projected visual mapping for 2D circles
              const xPos = 144 + Math.sin((city.lon * Math.PI) / 180) * 110;
              const yPos = 144 - Math.sin((city.lat * Math.PI) / 180) * 80;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedCity(city)}
                  style={{ left: `${xPos}px`, top: `${yPos}px` }}
                  className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full flex items-center justify-center cursor-pointer focus:outline-none transition-transform hover:scale-125"
                >
                  <span className="absolute inset-0 rounded-full bg-brand-accent animate-ping opacity-75" />
                  <span className="relative w-2.5 h-2.5 rounded-full bg-brand-accent border border-white" />
                </button>
              );
            })}
          </div>

          <div className="w-14 h-14 rounded-full bg-white shadow-premium flex items-center justify-center border border-brand-border/60 z-20">
            <GlobeIcon className="w-6 h-6 text-brand-primary animate-spin-slow" />
          </div>
        </div>

        {/* Selected City details overlay */}
        <AnimatePresence>
          {selectedCity && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="absolute bottom-6 inset-x-6 mx-auto max-w-sm bg-white/95 backdrop-blur-md rounded-2xl border border-brand-border p-4 shadow-depth z-30"
            >
              <div className="flex gap-4">
                <img src={selectedCity.image} alt={selectedCity.name} className="w-16 h-16 rounded-xl object-cover" />
                <div className="text-left flex-1">
                  <h4 className="font-serif text-lg font-bold text-brand-primary leading-tight">{selectedCity.name}</h4>
                  <p className="text-[10px] font-bold text-brand-accent uppercase tracking-wider">{selectedCity.country}</p>
                  <p className="text-xs text-brand-text/80 mt-1 line-clamp-2 leading-snug">{selectedCity.desc}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <span className="text-[10px] text-brand-muted/70 absolute bottom-4">Click pins to inspect destinations</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[450px] md:h-[550px] bg-brand-surface/40 rounded-3xl border border-brand-border/40 shadow-premium overflow-hidden">
      
      {/* 3D WebGL Canvas */}
      <Canvas camera={{ position: [0, 0, 4.5], fov: 60 }} className="w-full h-full">
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <GlobeSphere onSelectCity={setSelectedCity} />
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={3}
          maxDistance={6}
          rotateSpeed={0.6}
        />
      </Canvas>

      {/* Left Instructions overlay */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 pointer-events-none text-left">
        <span className="text-[10px] md:text-xs font-bold text-brand-secondary uppercase tracking-widest">3D Earth explorer</span>
        <h3 className="font-serif text-xl md:text-2xl text-brand-primary mt-0.5 md:mt-1">Interactive Globe</h3>
        <p className="text-[9px] md:text-[10px] text-brand-muted font-semibold mt-0.5 md:mt-1">DRAG TO ROTATE • CLICK PINS</p>
      </div>

      {/* Selected City Details popover */}
      <AnimatePresence>
        {selectedCity && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-80 bg-brand-surface border border-brand-border/80 rounded-3xl p-4 md:p-5 shadow-depth z-20 text-left flex flex-col gap-3 md:gap-4 max-h-[85%] overflow-y-auto"
          >
            <div className="relative h-32 w-full rounded-2xl overflow-hidden">
              <img src={selectedCity.image} alt={selectedCity.name} className="w-full h-full object-cover" />
              <button
                onClick={() => setSelectedCity(null)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-brand-dark/40 hover:bg-brand-dark/60 text-white flex items-center justify-center text-xs font-bold focus:outline-none transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-serif text-xl font-bold text-brand-primary leading-tight">{selectedCity.name}</h4>
                  <p className="text-[10px] font-bold text-brand-accent uppercase tracking-wider">{selectedCity.country}</p>
                </div>
                <div className="bg-brand-primary/5 px-2.5 py-1 rounded-full border border-brand-primary/10">
                  <span className="text-[10px] font-bold text-brand-primary">Pop: {selectedCity.pop}</span>
                </div>
              </div>
              <p className="text-xs text-brand-text/90 mt-2.5 leading-relaxed font-sans">{selectedCity.desc}</p>
            </div>

            <div className="flex items-center justify-between border-t border-brand-border/60 pt-4 text-xs font-semibold text-brand-muted">
              <span>Index: <strong className="text-brand-primary">{selectedCity.cost}</strong></span>
              <Link
                href={`/explore/cities?search=${selectedCity.name}`}
                className="flex items-center gap-1 text-brand-accent hover:text-brand-accent/90 transition-colors font-bold uppercase tracking-wider text-[10px]"
              >
                <span>Add stops</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
