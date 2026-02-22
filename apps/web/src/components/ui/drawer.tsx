"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  side?: "left" | "right";
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  side = "right",
}: DrawerProps) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/45 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        aria-label={title}
        className={cn(
          "fixed top-0 z-50 h-full w-[min(90vw,380px)] bg-white shadow-xl transition-transform duration-300",
          side === "right"
            ? "right-0"
            : "left-0",
          open
            ? "translate-x-0"
            : side === "right"
              ? "translate-x-full"
              : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-surface-200 px-4 py-3">
          <h3 className="text-base font-semibold text-surface-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-surface-600 hover:bg-surface-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="h-[calc(100%-56px)] overflow-y-auto p-4">{children}</div>
      </aside>
    </>
  );
}
