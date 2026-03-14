'use client';

import { useState } from 'react';

export default function ShareLink() {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={copyLink}
      className={`px-3.5 py-2 text-xs font-medium border rounded-lg transition-all duration-200 ${
        copied
          ? 'border-accent/30 text-accent bg-accent/5'
          : 'border-card-border text-foreground/40 hover:text-foreground/60 hover:border-foreground/20'
      }`}
    >
      {copied ? 'Copied!' : 'Share'}
    </button>
  );
}
