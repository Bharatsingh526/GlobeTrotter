import React from 'react';
import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GlobeTrotter — Personalized Travel Planning',
  description: 'Plan your next multi-city journey elegantly and effortlessly with interactive 3D, budgeting, maps, and schedules.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="bg-brand-background text-brand-text min-h-screen antialiased flex flex-col font-sans">
        <Providers>
          <div className="flex-grow flex flex-col">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
