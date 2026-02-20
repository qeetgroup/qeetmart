"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, Menu, ShoppingCart, UserCircle2 } from "lucide-react";
import { useSessionStore } from "@/store/session-store";
import { getCartCount, useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { MegaMenu } from "@/components/layout/mega-menu";
import { SearchBar } from "@/components/search/search-bar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { MiniCartDrawer } from "@/components/cart/mini-cart-drawer";

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const cartCount = useCartStore((state) => getCartCount(state.items));
  const user = useSessionStore((state) => state.user);

  return (
    <header className="sticky top-0 z-50 border-b border-surface-200 bg-white/95 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-[auto,1fr,auto] items-center gap-3 py-3 md:gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-surface-300 text-surface-700 hover:border-brand-300 hover:text-brand-700 md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <span className="rounded-md bg-brand-600 px-2 py-1 text-sm font-black tracking-wide text-white">
                QM
              </span>
              <span className="hidden text-lg font-bold tracking-tight text-surface-900 sm:block">
                QeetMart
              </span>
            </Link>
            <MegaMenu />
          </div>

          <SearchBar />

          <div className="flex items-center justify-end gap-1">
            <ThemeToggle />
            <Button variant="ghost" size="icon" asChild>
              <Link href="/wishlist" aria-label="Wishlist">
                <Heart className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setMiniCartOpen(true)}
              aria-label="Open cart"
            >
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 ? (
                <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              ) : null}
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href={user ? "/account" : "/auth/login"} aria-label="Account">
                <UserCircle2 className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Drawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        title="Browse"
        side="left"
      >
        <div className="space-y-2">
          <Link
            href="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-md border border-surface-200 px-3 py-2 text-sm font-medium text-surface-800 hover:border-brand-300 hover:text-brand-700"
          >
            All Products
          </Link>
          <Link
            href="/wishlist"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-md border border-surface-200 px-3 py-2 text-sm font-medium text-surface-800 hover:border-brand-300 hover:text-brand-700"
          >
            Wishlist
          </Link>
          <Link
            href="/cart"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-md border border-surface-200 px-3 py-2 text-sm font-medium text-surface-800 hover:border-brand-300 hover:text-brand-700"
          >
            Cart
          </Link>
          <Link
            href={user ? "/account" : "/auth/login"}
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-md border border-surface-200 px-3 py-2 text-sm font-medium text-surface-800 hover:border-brand-300 hover:text-brand-700"
          >
            {user ? "Account" : "Login / Signup"}
          </Link>
        </div>
      </Drawer>

      <MiniCartDrawer open={miniCartOpen} onClose={() => setMiniCartOpen(false)} />
    </header>
  );
}
