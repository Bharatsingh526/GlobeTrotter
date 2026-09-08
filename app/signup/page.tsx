'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from '@/lib/validations';
import { z } from 'zod';
import { Loader2, Compass, User, Mail, Lock, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Signup failed. Please check your details.');
        setIsLoading(false);
        return;
      }

      // Automatically sign in the user after a successful signup
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        router.push('/login');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (e: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-950 font-sans overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Background High-Res Travel Photography Wallpaper */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=2000"
          alt="GlobeTrotter Travel Destination"
          className="w-full h-full object-cover scale-105 filter brightness-75 contrast-110"
        />
        {/* Dark Vignette & Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/40" />
      </div>

      {/* Main Glassmorphic Container Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Compass className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <span className="font-serif text-3xl font-extrabold text-white tracking-tight">
              GlobeTrotter
            </span>
          </Link>

          <div className="mt-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-widest backdrop-blur-md mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Join The Adventure</span>
            </div>
            <h2 className="font-serif text-3xl font-extrabold text-white tracking-tight">
              Create your account
            </h2>
            <p className="mt-1 text-sm text-slate-300 font-medium">
              Start planning your dream journeys today
            </p>
          </div>
        </div>

        {/* Glassmorphic Form Card */}
        <div className="bg-slate-900/85 backdrop-blur-2xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-2xl p-3.5 font-semibold flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Full Name Input */}
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  {...register('name')}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm font-semibold transition-all"
                  placeholder="Bharatsingh Rajput"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-rose-400 font-semibold">{errors.name.message}</p>
              )}
            </div>

            {/* Email Address Input */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm font-semibold transition-all"
                  placeholder="rajputbharatsingh526@gmail.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-rose-400 font-semibold">{errors.email.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Password (min 6 characters)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register('password')}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm font-semibold transition-all"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-400 font-semibold">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl shadow-xl text-xs font-extrabold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 hover:scale-[1.02] active:scale-[0.98] focus:outline-none transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Navigation Link */}
          <div className="mt-6 border-t border-slate-800 pt-5 text-center">
            <p className="text-xs text-slate-400 font-medium">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
