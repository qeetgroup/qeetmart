"use client";

import { Facebook, Link2, Send } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonsProps {
  title: string;
  url: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  return (
    <div className="flex items-center gap-2">
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border border-surface-300 p-2 text-surface-700 hover:border-brand-300 hover:text-brand-700"
        aria-label="Share on Facebook"
      >
        <Facebook className="h-4 w-4" />
      </a>
      <a
        href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border border-surface-300 p-2 text-surface-700 hover:border-brand-300 hover:text-brand-700"
        aria-label="Share on Telegram"
      >
        <Send className="h-4 w-4" />
      </a>
      <button
        type="button"
        className="rounded-full border border-surface-300 p-2 text-surface-700 hover:border-brand-300 hover:text-brand-700"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            toast.success("Product link copied");
          } catch {
            toast.error("Could not copy link");
          }
        }}
        aria-label="Copy product link"
      >
        <Link2 className="h-4 w-4" />
      </button>
    </div>
  );
}
