import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Compass, Calendar, CheckCircle2, ChevronRight, Map, DollarSign, Share2 } from 'lucide-react';
import Navbar from '@/components/navigation/Navbar';

// Lazy-load the 3D globe component to optimize bundle size and prevent SSR issues
const InteractiveGlobe = dynamic(
  () => import('@/components/3d/InteractiveGlobe'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[450px] md:h-[550px] bg-brand-surface/40 rounded-3xl border border-brand-border/40 animate-pulse flex items-center justify-center">
        <span className="text-sm font-semibold text-brand-muted">Loading Globe Interface...</span>
      </div>
    ),
  }
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-background flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <header className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:py-24 text-center flex flex-col items-center">
        <span className="text-xs font-bold text-brand-accent uppercase tracking-widest bg-brand-accent/10 px-4 py-1.5 rounded-full border border-brand-accent/20">
          Personalized Travel Planning
        </span>
        <h1 className="mt-6 font-serif text-3xl sm:text-5xl md:text-7xl font-extrabold text-brand-dark tracking-tight max-w-4xl leading-[1.1]">
          YOUR NEXT JOURNEY <br />
          <span className="text-brand-primary">STARTS HERE.</span>
        </h1>
        <p className="mt-6 text-base md:text-lg text-brand-muted max-w-xl font-semibold leading-relaxed">
          Plan unforgettable multi-city trips, manage budgets, map custom routes, and build step-by-step itineraries without the planning headache.
        </p>
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="bg-brand-primary hover:bg-brand-primary/95 text-brand-surface text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded-full shadow-premium hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
          >
            <span>Plan My Trip</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            href="/explore/cities"
            className="bg-brand-surface hover:bg-brand-background border border-brand-border text-brand-primary text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded-full shadow-premium hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Explore Destinations
          </Link>
        </div>
      </header>

      {/* 3D Globe Section */}
      <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-20">
        <InteractiveGlobe />
      </section>

      {/* How It Works Section */}
      <section className="bg-brand-surface py-20 border-y border-brand-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold text-brand-accent uppercase tracking-widest">Simple Workflow</span>
          <h2 className="mt-2 font-serif text-3xl md:text-4xl font-bold text-brand-dark">How It Works</h2>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Step 1 */}
            <div className="flex flex-col items-center p-6 text-center group">
              <span className="font-serif text-5xl font-black text-brand-primary/10 group-hover:text-brand-primary/20 transition-colors duration-300">01</span>
              <h3 className="mt-4 font-serif text-xl font-bold text-brand-dark uppercase tracking-tight">DISCOVER</h3>
              <p className="mt-2 text-sm text-brand-muted font-medium leading-relaxed max-w-xs">
                Find curated cities and local experiences. Pin them directly to your destination board.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="flex flex-col items-center p-6 text-center group">
              <span className="font-serif text-5xl font-black text-brand-primary/10 group-hover:text-brand-primary/20 transition-colors duration-300">02</span>
              <h3 className="mt-4 font-serif text-xl font-bold text-brand-dark uppercase tracking-tight">DESIGN</h3>
              <p className="mt-2 text-sm text-brand-muted font-medium leading-relaxed max-w-xs">
                Build your perfect timeline. Drag and drop activities, assign times, and configure custom daily costs.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center p-6 text-center group">
              <span className="font-serif text-5xl font-black text-brand-primary/10 group-hover:text-brand-primary/20 transition-colors duration-300">03</span>
              <h3 className="mt-4 font-serif text-xl font-bold text-brand-dark uppercase tracking-tight">EXPERIENCE</h3>
              <p className="mt-2 text-sm text-brand-muted font-medium leading-relaxed max-w-xs">
                Travel with confidence. Keep all schedules, routes, shared member updates, and expenses organized in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Travel Experiences */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-xs font-bold text-brand-accent uppercase tracking-widest">Built For Explorers</span>
        <h2 className="mt-2 font-serif text-3xl md:text-4xl font-bold text-brand-dark">Unforgettable Travel Features</h2>
        
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-brand-surface p-8 rounded-3xl border border-brand-border/60 text-left shadow-premium flex flex-col justify-between h-64">
            <div className="w-10 h-10 rounded-full bg-brand-primary/5 flex items-center justify-center text-brand-primary">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-brand-dark">Multi-City Paths</h4>
              <p className="text-xs text-brand-muted mt-2 leading-relaxed">
                Connect multiple stops and order them smoothly to craft direct visual route pathways.
              </p>
            </div>
          </div>

          <div className="bg-brand-surface p-8 rounded-3xl border border-brand-border/60 text-left shadow-premium flex flex-col justify-between h-64">
            <div className="w-10 h-10 rounded-full bg-brand-primary/5 flex items-center justify-center text-brand-primary">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-brand-dark">Timeline Scheduler</h4>
              <p className="text-xs text-brand-muted mt-2 leading-relaxed">
                Schedule activities by the hour. Reorder items smoothly using drag-and-drop.
              </p>
            </div>
          </div>

          <div className="bg-brand-surface p-8 rounded-3xl border border-brand-border/60 text-left shadow-premium flex flex-col justify-between h-64">
            <div className="w-10 h-10 rounded-full bg-brand-primary/5 flex items-center justify-center text-brand-primary">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-brand-dark">Live Budgeting</h4>
              <p className="text-xs text-brand-muted mt-2 leading-relaxed">
                Track custom activity costs, categorise expenses, and receive over-budget alerts.
              </p>
            </div>
          </div>

          <div className="bg-brand-surface p-8 rounded-3xl border border-brand-border/60 text-left shadow-premium flex flex-col justify-between h-64">
            <div className="w-10 h-10 rounded-full bg-brand-primary/5 flex items-center justify-center text-brand-primary">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-brand-dark">Collaborative Sharing</h4>
              <p className="text-xs text-brand-muted mt-2 leading-relaxed">
                Make your trips public. Share custom itinerary links and let others duplicate them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-brand-primary text-brand-surface py-20 text-center border-t border-brand-primary/20">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-serif text-3xl md:text-5xl font-bold leading-tight">Ready to begin your adventure?</h2>
          <p className="mt-4 text-sm md:text-base text-brand-surface/85 max-w-xl mx-auto font-medium">
            Join thousands of travelers planning their multi-city journeys with absolute precision.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/signup"
              className="bg-brand-secondary hover:bg-brand-secondary/95 text-brand-dark text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded-full shadow-premium hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Sign Up Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-dark text-brand-surface/75 py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">
              🧭
            </span>
            <span className="font-serif text-lg font-bold text-white tracking-tight">
              GlobeTrotter
            </span>
          </div>
          <p className="text-xs font-medium text-brand-muted">
            &copy; {new Date().getFullYear()} GlobeTrotter Inc. Crafted with care for global explorers.
          </p>
        </div>
      </footer>
    </div>
  );
}
