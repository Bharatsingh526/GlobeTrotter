'use client';

import React, { useState } from 'react';
import { Globe, Lock, Copy, Check, ExternalLink, Loader2 } from 'lucide-react';

interface PublicShareWidgetProps {
  tripId: string;
  isPublicInitial: boolean;
  shareSlugInitial: string | null;
}

export default function PublicShareWidget({
  tripId,
  isPublicInitial,
  shareSlugInitial,
}: PublicShareWidgetProps) {
  const [isPublic, setIsPublic] = useState(isPublicInitial);
  const [shareSlug, setShareSlug] = useState<string | null>(shareSlugInitial);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleShare = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/shared', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId,
          isPublic: !isPublic,
        }),
      });

      if (!res.ok) throw new Error('Failed to update share settings');
      
      const data = await res.json();
      setIsPublic(data.isPublic);
      setShareSlug(data.slug);
    } catch (e: any) {
      alert(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!shareSlug) return;
    const url = `${window.location.origin}/shared/${shareSlug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = shareSlug ? `${window.location.origin}/shared/${shareSlug}` : '';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-brand-dark">
          {isPublic ? (
            <>
              <Globe className="w-4 h-4 text-brand-success" />
              <span>Visible to anyone</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 text-brand-muted" />
              <span>Private to you</span>
            </>
          )}
        </div>

        <button
          onClick={toggleShare}
          disabled={loading}
          className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
            isPublic
              ? 'border border-brand-border hover:bg-brand-background text-brand-muted'
              : 'bg-brand-primary text-brand-surface hover:bg-brand-primary/95 shadow-premium'
          }`}
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : isPublic ? (
            'Make Private'
          ) : (
            'Make Public'
          )}
        </button>
      </div>

      {isPublic && shareSlug && (
        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="w-full pl-3 pr-10 py-2 bg-brand-background border border-brand-border rounded-xl text-xs font-mono font-semibold focus:outline-none"
            />
            <button
              onClick={copyToClipboard}
              className="absolute right-2 top-1.5 p-1 text-brand-muted hover:text-brand-primary cursor-pointer"
              title="Copy link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-brand-success" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <a
            href={`/shared/${shareSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-brand-accent hover:text-brand-accent/90 transition-colors"
          >
            <span>Visit public page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
