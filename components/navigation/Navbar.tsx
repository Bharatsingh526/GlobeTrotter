'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Compass, Calendar, Globe, User, LogOut, Menu, X, ShieldAlert, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isLoggedIn = status === 'authenticated';
  const isAdmin = session?.user?.role === 'ADMIN';

  const navLinks = [
    { name: 'Cities', href: '/explore/cities', icon: Compass },
    { name: 'Activities', href: '/explore/activities', icon: Compass },
    ...(isLoggedIn
      ? [
          { name: 'Dashboard', href: '/dashboard', icon: Globe },
          { name: 'My Trips', href: '/trips', icon: Calendar },
        ]
      : []),
  ];

  return (
    <nav className="sticky top-0 z-40 w-full bg-brand-surface/80 backdrop-blur-md border-b border-brand-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-brand-surface font-semibold text-base transition-transform group-hover:rotate-12 duration-300">
                🧭
              </span>
              <span className="font-serif text-2xl font-bold text-brand-primary tracking-tight">
                GlobeTrotter
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold tracking-wide transition-colors",
                    isActive
                      ? "bg-brand-primary/10 text-brand-primary"
                      : "text-brand-text/80 hover:text-brand-primary hover:bg-brand-primary/5"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold text-brand-accent hover:bg-brand-accent/10 transition-colors",
                  pathname.startsWith('/admin') && "bg-brand-accent/10"
                )}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            )}
          </div>

          {/* Right actions (Auth/Profile) */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <Link href="/profile" className="flex items-center gap-2 group">
                  <div className="w-8 h-8 rounded-full border border-brand-border bg-brand-primary/15 flex items-center justify-center overflow-hidden">
                    {session.user.image ? (
                      <img src={session.user.image} alt={session.user.name || 'Avatar'} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-brand-primary font-bold text-xs uppercase">
                        {session.user.name?.charAt(0) || session.user.email?.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-brand-text group-hover:text-brand-primary transition-colors">
                    {session.user.name || 'Profile'}
                  </span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="p-2 rounded-full text-brand-muted hover:text-brand-accent hover:bg-brand-accent/10 transition-all cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-sm font-bold text-brand-text hover:text-brand-primary px-3 py-2"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-brand-primary hover:bg-brand-primary/90 text-brand-surface text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full shadow-premium hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-brand-text hover:text-brand-primary focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-brand-surface border-t border-brand-border/60 py-3 px-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "block px-3 py-2.5 rounded-xl text-base font-semibold",
                pathname.startsWith(link.href)
                  ? "bg-brand-primary/10 text-brand-primary"
                  : "text-brand-text hover:bg-brand-primary/5 hover:text-brand-primary"
              )}
            >
              {link.name}
            </Link>
          ))}

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-base font-semibold text-brand-accent hover:bg-brand-accent/5"
            >
              Admin Dashboard
            </Link>
          )}

          <div className="border-t border-brand-border/60 pt-3 mt-3">
            {isLoggedIn ? (
              <div className="space-y-2">
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-3 py-2"
                >
                  <div className="w-8 h-8 rounded-full border border-brand-border bg-brand-primary/15 flex items-center justify-center overflow-hidden">
                    {session.user.image ? (
                      <img src={session.user.image} alt={session.user.name || 'Avatar'} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-brand-primary font-bold text-xs uppercase">
                        {session.user.name?.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-brand-text">
                    {session.user.name}
                  </span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-brand-accent font-semibold hover:bg-brand-accent/5 rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 px-3">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-center py-2 text-base font-bold text-brand-text"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsOpen(false)}
                  className="text-center py-2.5 bg-brand-primary text-brand-surface text-sm font-bold uppercase tracking-wider rounded-full shadow-premium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
