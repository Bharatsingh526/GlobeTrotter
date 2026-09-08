'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from '@/lib/validations';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

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
        setError(data.message || 'Signup failed. Please try again.');
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
        setError('Account created, but automatic login failed. Please sign in manually.');
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
    <div className="min-h-screen bg-brand-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="font-serif text-3xl font-bold text-brand-primary tracking-tight">
          GlobeTrotter
        </Link>
        <h2 className="mt-6 text-center font-serif text-3xl font-extrabold text-brand-dark">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-brand-muted">
          Or{' '}
          <Link href="/login" className="font-semibold text-brand-accent hover:text-brand-accent/90 transition-colors">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-brand-surface py-8 px-4 shadow-premium sm:rounded-3xl sm:px-10 border border-brand-border/60">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-brand-accent/10 border border-brand-accent/30 text-brand-accent text-sm rounded-xl p-3 font-semibold">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-xs font-bold text-brand-dark uppercase tracking-wider">
                Full Name
              </label>
              <div className="mt-1.5">
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  {...register('name')}
                  className="block w-full px-4 py-3 bg-brand-background rounded-full border border-brand-border/60 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-sm font-semibold transition-all"
                  placeholder="Elena Rostova"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-brand-accent font-semibold">{errors.name.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-brand-dark uppercase tracking-wider">
                Email Address
              </label>
              <div className="mt-1.5">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  className="block w-full px-4 py-3 bg-brand-background rounded-full border border-brand-border/60 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-sm font-semibold transition-all"
                  placeholder="name@domain.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-brand-accent font-semibold">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-brand-dark uppercase tracking-wider">
                Password (min 6 chars)
              </label>
              <div className="mt-1.5">
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register('password')}
                  className="block w-full px-4 py-3 bg-brand-background rounded-full border border-brand-border/60 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-sm font-semibold transition-all"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-brand-accent font-semibold">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-premium text-xs font-bold uppercase tracking-wider text-brand-surface bg-brand-primary hover:bg-brand-primary/95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all disabled:opacity-50 select-none cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
