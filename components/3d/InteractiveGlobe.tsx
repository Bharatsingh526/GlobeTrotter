'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Stars } from '@react-three/drei';
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

// Flight route pairs connecting major hubs
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

// Procedural Canvas Texture Generator for vibrant realistic Earth fallback
function createProceduralEarthTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Deep ocean gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024);
  oceanGrad.addColorStop(0, '#040d1a');
  oceanGrad.addColorStop(0.2, '#0a2342');
  oceanGrad.addColorStop(0.5, '#0f3860');
  oceanGrad.addColorStop(0.8, '#0a2342');
  oceanGrad.addColorStop(1, '#040d1a');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, 2048, 1024);

  // Grid latitude / longitude lines
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= 2048; x += 128) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }
  for (let y = 0; y <= 1024; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(2048, y);
    ctx.stroke();
  }

  // Draw Stylized Continents (North America, South America, Eurasia, Africa, Australia)
  ctx.fillStyle = '#1b4332'; // Lush emerald landmass
  const drawLand = (pathCoords: [number, number][]) => {
    ctx.beginPath();
    pathCoords.forEach(([px, py], i) => {
      const x = (px / 360) * 2048;
      const y = (py / 180) * 1024;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
  };

  // North America
  drawLand([[50, 20], [130, 20], [140, 45], [170, 50], [160, 70], [100, 75], [60, 60]]);
  // South America
  drawLand([[100, 85], [130, 90], [120, 150], [100, 170], [90, 110]]);
  // Eurasia & Europe
  drawLand([[170, 30], [280, 20], [340, 30], [350, 70], [290, 80], [220, 70], [180, 50]]);
  // Africa
  drawLand([[170, 75], [220, 75], [230, 120], [200, 150], [180, 120]]);
  // Australia
  drawLand([[290, 120], [330, 120], [330, 150], [290, 150]]);

  // City lights dots
  ctx.fillStyle = '#ffb703';
  for (let i = 0; i < 400; i++) {
    const rx = Math.random() * 2048;
    const ry = Math.random() * 1024;
    ctx.beginPath();
    ctx.arc(rx, ry, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Curved 3D Flight Arc component
function FlightArc({ start, end, color }: { start: THREE.Vector3; end: THREE.Vector3; color: string }) {
  const curve = useMemo(() => {
    // Elevate the midpoint to create a curved flight arch above Earth
    const mid = start.clone().add(end).multiplyScalar(0.5);
    const distance = start.distanceTo(end);
    mid.normalize().multiplyScalar(2 + distance * 0.25);

    return new THREE.QuadraticBezierCurve3(start, mid, end);
  }, [start, end]);

  const tubeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 44, 0.008, 8, false);
  }, [curve]);

  const particleRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (particleRef.current) {
      const t = (state.clock.getElapsedTime() * 0.3) % 1;
      const point = curve.getPoint(t);
      particleRef.current.position.copy(point);
    }
  });

  return (
    <group>
      {/* Glowing Tube Arc */}
      <mesh geometry={tubeGeometry}>
        <meshBasicMaterial color={color} transparent opacity={0.65} />
      </mesh>

      {/* Traveling Flight Particle */}
      <mesh ref={particleRef}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
    </group>
  );
}

// Main 3D Earth Globe Mesh Component
function EarthGlobe({ onSelectCity, selectedCity }: { onSelectCity: (city: any) => void; selectedCity: any }) {
  const globeRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  // Earth textures
  const [earthTexture, setEarthTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    // Try loading realistic NASA blue marble texture from CDN
    loader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        setEarthTexture(tex);
      },
      undefined,
      () => {
        // Fallback to rich procedural texture
        setEarthTexture(createProceduralEarthTexture());
      }
    );
  }, []);

  // Smooth rotation
  useFrame((state, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.06;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.08;
    }
  });

  const cityVectors = useMemo(() => {
    const map = new Map<string, THREE.Vector3>();
    CITIES.forEach((c) => {
      map.set(c.id, convertLatLngToVector3(c.lat, c.lon, 2.02));
    });
    return map;
  }, []);

  return (
    <group ref={globeRef}>
      {/* Outer Atmosphere Glow Halo */}
      <mesh>
        <sphereGeometry args={[2.22, 64, 64]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.18}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Main Photorealistic Earth Sphere */}
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture || undefined}
          color={earthTexture ? '#ffffff' : '#0f2b48'}
          roughness={0.65}
          metalness={0.1}
        />
      </mesh>

      {/* Atmospheric Cloud Layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.035, 64, 64]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Flight Path Arcs */}
      {FLIGHT_ROUTES.map((route, i) => {
        const start = cityVectors.get(route.from);
        const end = cityVectors.get(route.to);
        if (!start || !end) return null;
        return <FlightArc key={i} start={start} end={end} color={route.color} />;
      })}

      {/* Interactive City 3D Pin Markers */}
      {CITIES.map((city) => {
        const pos = cityVectors.get(city.id) || new THREE.Vector3();
        const isSelected = selectedCity?.id === city.id;

        // Elevated position for pin head
        const pinHeadPos = pos.clone().normalize().multiplyScalar(2.14);

        return (
          <group key={city.id}>
            {/* Pulsing Base Ring on Earth Surface */}
            <mesh position={pos} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.03, 0.065, 24]} />
              <meshBasicMaterial color={city.color} transparent opacity={0.8} side={THREE.DoubleSide} />
            </mesh>

            {/* Glowing 3D Pin Head */}
            <mesh position={pinHeadPos} onClick={() => onSelectCity(city)}>
              <sphereGeometry args={[isSelected ? 0.065 : 0.045, 24, 24]} />
              <meshBasicMaterial color={isSelected ? '#FFFFFF' : city.color} />
            </mesh>

            {/* Interactive HTML Hover / Click Label */}
            <Html position={pinHeadPos} distanceFactor={8} zIndexRange={[100, 0]}>
              <div
                onClick={() => onSelectCity(city)}
                className={`group cursor-pointer select-none transition-all duration-300 transform -translate-x-1/2 -translate-y-full mb-2 ${
                  isSelected ? 'scale-110 z-30' : 'hover:scale-105 z-10'
                }`}
              >
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md border shadow-lg transition-all ${
                    isSelected
                      ? 'bg-brand-primary text-white border-white'
                      : 'bg-slate-900/85 text-slate-200 border-slate-700/60 hover:bg-brand-primary/90 hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: city.color }} />
                  <span className="text-[11px] font-bold tracking-wide whitespace-nowrap">{city.name}</span>
                </div>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

export default function InteractiveGlobe() {
  const [selectedCity, setSelectedCity] = useState<any>(CITIES[0]); // Default to Paris
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
      <div className="w-full h-[450px] md:h-[550px] flex items-center justify-center bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  // Graceful 2D Fallback Map in SVG format if WebGL is not supported
  if (!hasWebGL) {
    return (
      <div className="relative w-full h-[450px] md:h-[550px] bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl p-6 flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute top-6 left-6 text-left">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">3D Earth Explorer</span>
          <h3 className="font-serif text-2xl text-white mt-1">Global Travel Hub</h3>
        </div>

        <div className="relative w-72 h-72 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-cyan-500/20 bg-slate-900/50 flex items-center justify-center">
            <div className="w-[85%] h-[85%] rounded-full border border-cyan-500/10 absolute" />
            <div className="w-[60%] h-[60%] rounded-full border border-cyan-500/10 absolute" />
          </div>

          <div className="absolute inset-0 z-10">
            {CITIES.map((city, idx) => {
              const xPos = 144 + Math.sin((city.lon * Math.PI) / 180) * 110;
              const yPos = 144 - Math.sin((city.lat * Math.PI) / 180) * 80;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedCity(city)}
                  style={{ left: `${xPos}px`, top: `${yPos}px` }}
                  className="absolute w-5 h-5 -ml-2.5 -mt-2.5 rounded-full flex items-center justify-center cursor-pointer focus:outline-none transition-transform hover:scale-125 z-20"
                >
                  <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-75" />
                  <span className="relative w-3 h-3 rounded-full bg-cyan-400 border border-white" />
                </button>
              );
            })}
          </div>

          <div className="w-16 h-16 rounded-full bg-slate-900 shadow-2xl flex items-center justify-center border border-cyan-500/30 z-20">
            <GlobeIcon className="w-7 h-7 text-cyan-400 animate-spin-slow" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] md:h-[600px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
      
      {/* Dynamic Cosmic Background & 3D WebGL Canvas */}
      <Canvas camera={{ position: [0, 0, 4.5], fov: 55 }} className="w-full h-full">
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 3, 5]} intensity={2.2} />
        <pointLight position={[-5, -3, -5]} intensity={0.8} color="#38bdf8" />
        
        {/* Background Starfield */}
        <Stars radius={100} depth={50} count={2500} factor={4} saturation={0} fade speed={1} />
        
        <EarthGlobe onSelectCity={setSelectedCity} selectedCity={selectedCity} />
        
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={3.2}
          maxDistance={5.8}
          rotateSpeed={0.5}
          autoRotate={!selectedCity}
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* Header Overlay */}
      <div className="absolute top-5 left-5 md:top-7 md:left-7 pointer-events-none text-left z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1.5 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive 3D Earth</span>
        </div>
        <h3 className="font-serif text-2xl md:text-3xl text-white font-extrabold tracking-tight">Explore Destinations</h3>
        <p className="text-[10px] md:text-xs text-slate-400 font-medium mt-0.5">DRAG TO ROTATE • CLICK PINS OR LABELS</p>
      </div>

      {/* Selected City Preview Card */}
      <AnimatePresence>
        {selectedCity && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-5 left-5 right-5 md:bottom-7 md:left-auto md:right-7 md:w-84 bg-slate-900/90 backdrop-blur-xl border border-slate-700/70 rounded-3xl p-4 md:p-5 shadow-2xl z-20 text-left flex flex-col gap-3"
          >
            <div className="relative h-36 w-full rounded-2xl overflow-hidden shadow-inner">
              <img src={selectedCity.image} alt={selectedCity.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <button
                onClick={() => setSelectedCity(null)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white flex items-center justify-center text-xs font-bold focus:outline-none transition-colors cursor-pointer border border-white/20"
              >
                ✕
              </button>
              <div className="absolute bottom-3 left-3">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-500/90 text-slate-950">
                  {selectedCity.country}
                </span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <h4 className="font-serif text-2xl font-extrabold text-white leading-tight">{selectedCity.name}</h4>
                <div className="bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
                  <span className="text-[10px] font-bold text-cyan-400">Rating: {selectedCity.pop}</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed font-sans">{selectedCity.desc}</p>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-xs font-semibold text-slate-400">
              <span>Budget: <strong className="text-emerald-400">{selectedCity.cost}</strong></span>
              <Link
                href={`/explore/cities?search=${selectedCity.name}`}
                className="inline-flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-full transition-all text-xs shadow-md hover:scale-105"
              >
                <span>Plan Trip</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
