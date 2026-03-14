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
      className="px-4 py-2 text-sm border border-card-border rounded-lg text-foreground/60 hover:text-foreground hover:border-foreground/30 transition-colors"
    >
      {copied ? 'Copied!' : 'Share Link'}
    </button>
  );
}
