'use client';

import React, { useRef, useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe as GlobeIcon, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

// Featured cities data
const CITIES = [
  { id: 'paris', name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, color: '#FF5A5F', desc: 'The city of light, romance, and iconic art.', cost: '$$$$', pop: '9.8/10', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=600' },
  { id: 'rome', name: 'Rome', country: 'Italy', lat: 41.9028, lon: 12.4964, color: '#FF7A00', desc: 'A historic cradle of ancient ruins and world-class culinary art.', cost: '$$$', pop: '9.2/10', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=600' },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, color: '#00E5FF', desc: 'Futuristic neon skyscrapers alongside ancient shrines.', cost: '$$$$', pop: '9.9/10', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=600' },
  { id: 'dubai', name: 'Dubai', country: 'UAE', lat: 25.2048, lon: 55.2708, color: '#FFB800', desc: 'World-record skyscrapers, desert dunes, and luxury living.', cost: '$$$$$', pop: '9.5/10', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=600' },
  { id: 'london', name: 'London', country: 'UK', lat: 51.5074, lon: -0.1278, color: '#A060FF', desc: 'Royal history, West End theatre, and iconic landmarks.', cost: '$$$$', pop: '9.3/10', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=600' },
  { id: 'nyc', name: 'New York', country: 'USA', lat: 40.7128, lon: -74.0060, color: '#00FF88', desc: 'The bustling concrete jungle and culture capital that never sleeps.', cost: '$$$$$', pop: '9.7/10', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=600' },
  { id: 'singapore', name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198, color: '#00E5FF', desc: 'Futuristic botanical gardens, luxury, and street food paradises.', cost: '$$$$', pop: '9.4/10', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&q=80&w=600' },
  { id: 'bali', name: 'Bali', country: 'Indonesia', lat: -8.4095, lon: 115.1889, color: '#FF5A5F', desc: 'Spiritual cliffside temples, beach clubs, and serene rice terraces.', cost: '$$', pop: '9.6/10', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=600' },
];

// Flight route connections
const FLIGHT_ROUTES = [
  { from: 'nyc', to: 'london', color: '#00FF88' },
  { from: 'london', to: 'paris', color: '#FF5A5F' },
  { from: 'paris', to: 'dubai', color: '#FFB800' },
  { from: 'dubai', to: 'tokyo', color: '#00E5FF' },
  { from: 'tokyo', to: 'singapore', color: '#00E5FF' },
  { from: 'singapore', to: 'bali', color: '#FF5A5F' },
  { from: 'paris', to: 'rome', color: '#FF7A00' },
];

// Conversion helper: Lat/Lon -> 3D Vector on sphere of radius R
function convertLatLngToVector3(lat: number, lon: number, radius = 2) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.sin(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.cos(theta);

  return new THREE.Vector3(x, y, z);
}

// 3D Flight Tube Arc component
function FlightArc({ start, end, color }: { start: THREE.Vector3; end: THREE.Vector3; color: string }) {
  const curve = useMemo(() => {
    const mid = start.clone().add(end).multiplyScalar(0.5);
    const distance = start.distanceTo(end);
    mid.normalize().multiplyScalar(2 + distance * 0.22);

    return new THREE.QuadraticBezierCurve3(start, mid, end);
  }, [start, end]);

  const tubeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 44, 0.007, 8, false);
  }, [curve]);

  const particleRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (particleRef.current) {
      const t = (state.clock.getElapsedTime() * 0.35) % 1;
      const point = curve.getPoint(t);
      particleRef.current.position.copy(point);
    }
  });

  return (
    <group>
      {/* Glowing Arc Line */}
      <mesh geometry={tubeGeometry}>
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>

      {/* Traveling Energy Particle */}
      <mesh ref={particleRef}>
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
    </group>
  );
}

// Photorealistic Satellite Earth Mesh (Clean Satellite Image Globe with NO text labels)
function SatelliteEarthMesh({ onSelectCity, selectedCity }: { onSelectCity: (city: any) => void; selectedCity: any }) {
  const globeRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  // Load satellite imagery textures
  const [colorMap, bumpMap, lightsMap, cloudsMap] = useTexture([
    'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
    'https://unpkg.com/three-globe/example/img/earth-topology.png',
    'https://unpkg.com/three-globe/example/img/earth-night-lights.png',
    'https://unpkg.com/three-globe/example/img/earth-clouds.png',
  ]);

  // Smooth rotation animation
  useFrame((state, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.04;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.06;
    }
  });

  const cityVectors = useMemo(() => {
    const map = new Map<string, THREE.Vector3>();
    CITIES.forEach((c) => {
      map.set(c.id, convertLatLngToVector3(c.lat, c.lon, 2.01));
    });
    return map;
  }, []);

  return (
    <group ref={globeRef}>
      {/* Outer Blue Atmosphere Glow Halo */}
      <mesh>
        <sphereGeometry args={[2.22, 64, 64]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.25}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Pure Satellite Imagery Earth Surface (3D Terrain Relief & Oceans) */}
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          map={colorMap}
          bumpMap={bumpMap}
          bumpScale={0.04}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Earth Night Lights Layer (Glowing Cities on Night Side) */}
      <mesh>
        <sphereGeometry args={[2.002, 64, 64]} />
        <meshBasicMaterial
          map={lightsMap}
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Satellite Cloud Layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.035, 64, 64]} />
        <meshStandardMaterial
          map={cloudsMap}
          transparent
          opacity={0.32}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Animated Flight Path Arcs */}
      {FLIGHT_ROUTES.map((route, i) => {
        const start = cityVectors.get(route.from);
        const end = cityVectors.get(route.to);
        if (!start || !end) return null;
        return <FlightArc key={i} start={start} end={end} color={route.color} />;
      })}

      {/* Subtle 3D Glowing City Pins (NO text labels over globe) */}
      {CITIES.map((city) => {
        const pos = cityVectors.get(city.id) || new THREE.Vector3();
        const isSelected = selectedCity?.id === city.id;
        const pinHeadPos = pos.clone().normalize().multiplyScalar(2.08);

        return (
          <group key={city.id}>
            {/* Pulsing Ground Ring */}
            <mesh position={pos} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.02, 0.05, 24]} />
              <meshBasicMaterial color={city.color} transparent opacity={0.85} side={THREE.DoubleSide} />
            </mesh>

            {/* Glowing Pin Marker Dot */}
            <mesh position={pinHeadPos} onClick={() => onSelectCity(city)}>
              <sphereGeometry args={[isSelected ? 0.055 : 0.035, 24, 24]} />
              <meshBasicMaterial color={isSelected ? '#FFFFFF' : city.color} />
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
      <div className="w-full h-[480px] md:h-[580px] flex items-center justify-center bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  // 2D Fallback map if WebGL unsupported
  if (!hasWebGL) {
    return (
      <div className="relative w-full h-[480px] md:h-[580px] bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl p-6 flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute top-6 left-6 text-left">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">3D Earth Explorer</span>
          <h3 className="font-serif text-2xl text-white mt-1">Global Travel Hub</h3>
        </div>

        <div className="relative w-72 h-72 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-cyan-500/20 bg-slate-900/50 flex items-center justify-center">
            <div className="w-[85%] h-[85%] rounded-full border border-cyan-500/10 absolute" />
            <div className="w-[60%] h-[60%] rounded-full border border-cyan-500/10 absolute" />
          </div>

          <div className="w-16 h-16 rounded-full bg-slate-900 shadow-2xl flex items-center justify-center border border-cyan-500/30 z-20">
            <GlobeIcon className="w-7 h-7 text-cyan-400 animate-spin-slow" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[520px] md:h-[620px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
      
      {/* 3D WebGL Canvas with Real Satellite Earth */}
      <Canvas camera={{ position: [0, 0, 4.5], fov: 55 }} className="w-full h-full">
        {/* Photorealistic Space & Solar Lighting */}
        <ambientLight intensity={0.65} />
        <directionalLight position={[6, 3, 6]} intensity={2.2} />
        <directionalLight position={[-6, -3, -6]} intensity={0.6} color="#0284c7" />
        
        {/* Cosmic Background Starfield */}
        <Stars radius={100} depth={50} count={3500} factor={4} saturation={0} fade speed={1.5} />
        
        <Suspense fallback={null}>
          <SatelliteEarthMesh onSelectCity={setSelectedCity} selectedCity={selectedCity} />
        </Suspense>
        
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={3.1}
          maxDistance={5.8}
          rotateSpeed={0.5}
          autoRotate={!selectedCity}
          autoRotateSpeed={0.4}
        />
      </Canvas>

      {/* Header Overlay */}
      <div className="absolute top-5 left-5 md:top-7 md:left-7 pointer-events-none text-left z-10">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-[10px] md:text-xs font-extrabold uppercase tracking-widest mb-1.5 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real Satellite Earth</span>
        </div>
        <h3 className="font-serif text-2xl md:text-3xl text-white font-extrabold tracking-tight">Interactive 3D Satellite Map</h3>
        <p className="text-[10px] md:text-xs text-slate-400 font-medium mt-0.5">DRAG TO ROTATE • CLICK PINS TO INSPECT</p>
      </div>

      {/* Selected Destination Modal Card */}
      <AnimatePresence>
        {selectedCity && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-5 left-5 right-5 md:bottom-7 md:left-auto md:right-7 md:w-88 bg-slate-900/90 backdrop-blur-2xl border border-slate-700/80 rounded-3xl p-4 md:p-5 shadow-2xl z-20 text-left flex flex-col gap-3"
          >
            <div className="relative h-38 w-full rounded-2xl overflow-hidden shadow-inner">
              <img src={selectedCity.image} alt={selectedCity.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
              <button
                onClick={() => setSelectedCity(null)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center text-xs font-bold focus:outline-none transition-colors cursor-pointer border border-white/20"
              >
                ✕
              </button>
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-500/90 text-slate-950">
                  {selectedCity.country}
                </span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <h4 className="font-serif text-2xl font-extrabold text-white leading-tight">{selectedCity.name}</h4>
                <div className="bg-slate-800/90 px-2.5 py-1 rounded-full border border-slate-700">
                  <span className="text-[10px] font-bold text-cyan-400">Rating: {selectedCity.pop}</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed font-sans">{selectedCity.desc}</p>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-xs font-semibold text-slate-400">
              <span>Budget: <strong className="text-emerald-400">{selectedCity.cost}</strong></span>
              <Link
                href={`/explore/cities?search=${selectedCity.name}`}
                className="inline-flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold px-4 py-2 rounded-full transition-all text-xs shadow-lg hover:scale-105"
              >
                <span>Plan Trip</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
