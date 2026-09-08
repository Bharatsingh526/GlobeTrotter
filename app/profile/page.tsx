'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { User, LogOut, Trash2, Heart, Save, Globe, Loader2, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/navigation/Navbar';

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, update } = useSession();

  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [language, setLanguage] = useState('English');
  const [email, setEmail] = useState('');
  const [savedDests, setSavedDests] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchProfileData();
    }
  }, [session]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      // 1. Fetch saved destinations
      const savedRes = await fetch('/api/saved-destinations');
      if (savedRes.ok) {
        const savedData = await savedRes.json();
        setSavedDests(savedData);
      }

      // 2. Fetch profile info
      setEmail(session?.user?.email || '');
      setName(session?.user?.name || '');
      setAvatarUrl(session?.user?.image || '');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          avatarUrl,
          language,
        }),
      });

      if (!res.ok) throw new Error('Failed to update profile settings');

      // Update local next-auth session cookie
      await update({
        name,
        image: avatarUrl,
      });

      alert('Profile settings updated successfully!');
    } catch (e: any) {
      alert(e.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const handleUnsaveDest = async (cityId: string) => {
    try {
      const res = await fetch(`/api/saved-destinations/${cityId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSavedDests(savedDests.filter((sd) => sd.cityId !== cityId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete account');

      // Sign out session
      signOut({ callbackUrl: '/' });
    } catch (e: any) {
      alert(e.message || 'Error occurred.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-background flex flex-col">
        <Navbar />
        <div className="flex-grow flex justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-background flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-brand-border/60">
          <div>
            <span className="text-xs font-bold text-brand-accent uppercase tracking-widest">
              Profile Control
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-brand-dark mt-1">
              Account Settings
            </h1>
          </div>
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-brand-muted hover:text-brand-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Settings Form Column */}
          <div className="lg:col-span-1 bg-brand-surface border border-brand-border/60 rounded-3xl p-6 shadow-premium h-fit">
            <h3 className="font-serif text-lg font-bold text-brand-dark mb-4">Edit Profile</h3>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full px-3 py-2 bg-brand-background border border-brand-border rounded-xl text-xs font-semibold text-brand-muted focus:outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark mb-1">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-background border border-brand-border rounded-xl text-xs font-semibold focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark mb-1">Avatar Image URL</label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-background border border-brand-border rounded-xl text-xs font-semibold focus:outline-none"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark mb-1">Preferred Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-background border border-brand-border rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="Japanese">Japanese</option>
                </select>
              </div>

              <div className="border-t border-brand-border/60 pt-4 mt-6 flex justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 border border-brand-accent/20 hover:bg-brand-accent/5 text-brand-accent rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Delete Account
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-brand-primary text-brand-surface rounded-full text-[10px] font-bold uppercase tracking-wider shadow-premium flex items-center gap-1 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>

          {/* Saved Destinations List Column */}
          <div className="lg:col-span-2 bg-brand-surface border border-brand-border/60 rounded-3xl p-6 shadow-premium text-left">
            <h3 className="font-serif text-lg font-bold text-brand-dark flex items-center gap-2 mb-6">
              <Heart className="w-5 h-5 text-brand-accent fill-brand-accent" />
              <span>Saved Destinations Bucket List</span>
            </h3>

            {savedDests.length === 0 ? (
              <div className="text-center py-10">
                <Compass className="w-8 h-8 text-brand-primary/20 mx-auto" />
                <p className="text-xs text-brand-muted font-medium mt-3 leading-relaxed">
                  You do not have any saved destinations. Browse cities in explorer tab and save items.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {savedDests.map((sd) => (
                  <div
                    key={sd.id}
                    className="border border-brand-border/60 rounded-2xl overflow-hidden bg-brand-background/30 hover:bg-brand-background transition-colors flex flex-col justify-between group"
                  >
                    <div className="h-28 relative">
                      <img src={sd.city.imageUrl} alt={sd.city.name} className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleUnsaveDest(sd.cityId)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-brand-surface border border-brand-border text-brand-accent shadow-premium flex items-center justify-center focus:outline-none cursor-pointer hover:bg-brand-accent hover:text-brand-surface transition-colors"
                        title="Unsave Destination"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-4 text-left">
                      <h4 className="font-serif text-base font-bold text-brand-primary leading-tight">{sd.city.name}</h4>
                      <p className="text-[9px] text-brand-accent font-bold uppercase tracking-wider">{sd.city.country}</p>
                      <p className="text-[11px] text-brand-muted mt-2 leading-snug line-clamp-2">{sd.city.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm">
            <div className="bg-brand-surface border border-brand-border/60 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-depth text-center">
              <span className="text-3xl">⚠️</span>
              <h3 className="font-serif text-xl font-bold text-brand-dark mt-4">Delete your account?</h3>
              <p className="text-xs text-brand-muted mt-2 leading-relaxed font-semibold">
                Are you sure you want to permanently delete your account? This action is irreversible and all your planned trips, scheduled days, and expense ledgers will be permanently deleted from MySQL.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="px-5 py-2.5 rounded-full border border-brand-border hover:bg-brand-background text-brand-muted text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="px-5 py-2.5 rounded-full bg-brand-accent hover:bg-brand-accent/90 text-brand-surface text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {deleting ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
