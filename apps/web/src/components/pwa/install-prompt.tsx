"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

declare global {
  interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  }
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler as EventListener);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler as EventListener);
    };
  }, []);

  if (!deferredPrompt || dismissed) {
    return null;
  }

  return (
    <div className="fixed right-4 bottom-20 z-[70] w-[min(92vw,360px)] rounded-xl border border-surface-200 bg-white p-3 shadow-xl">
      <button
        type="button"
        className="absolute top-2 right-2 rounded-md p-1 text-surface-500 hover:bg-surface-100"
        onClick={() => setDismissed(true)}
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <p className="text-sm font-semibold text-surface-900">Install QeetMart App</p>
      <p className="mt-1 text-xs text-surface-600">
        Add to home screen for faster launch and offline browsing.
      </p>
      <Button
        size="sm"
        className="mt-3 w-full"
        onClick={async () => {
          await deferredPrompt.prompt();
          await deferredPrompt.userChoice;
          setDeferredPrompt(null);
        }}
      >
        <Download className="h-3.5 w-3.5" />
        Install
      </Button>
    </div>
  );
}
