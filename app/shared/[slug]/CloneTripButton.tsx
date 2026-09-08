'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Copy, Loader2 } from 'lucide-react';

interface CloneTripButtonProps {
  tripId: string;
  slug: string;
}

export default function CloneTripButton({ tripId, slug }: CloneTripButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleCopy = async () => {
    if (!session?.user) {
      // Redirect to login page, returning to this shared route on success
      router.push(`/login?callbackUrl=/shared/${slug}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/clone`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Failed to copy trip');

      const data = await res.json();
      router.push(`/trips/${data.id}/builder`);
      router.refresh();
    } catch (e: any) {
      alert(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCopy}
      disabled={loading}
      className="w-full sm:w-auto justify-center bg-brand-primary hover:bg-brand-primary/95 text-brand-surface text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full flex items-center gap-1.5 shadow-premium hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 select-none cursor-pointer shrink-0"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <Copy className="w-4 h-4" />
          <span>Copy Trip to Profile</span>
        </>
      )}
    </button>
  );
}
