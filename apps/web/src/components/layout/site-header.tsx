"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, Menu, ShoppingCart, UserCircle2 } from "lucide-react";
import { useSessionStore } from "@/store/session-store";
import { getCartCount, useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { MegaMenu } from "@/components/layout/mega-menu";
import { SearchBar } from "@/components/search/search-bar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { MiniCartDrawer } from "@/components/cart/mini-cart-drawer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const cartCount = useCartStore((state) => getCartCount(state.items));
  const user = useSessionStore((state) => state.user);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b transition-all duration-300 ease-out",
          isScrolled
            ? "border-surface-200/50 bg-white/80 py-2 shadow-sm backdrop-blur-md dark:bg-surface-950/80"
            : "border-surface-200 bg-white py-3 dark:bg-surface-950"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-4 lg:gap-8 py-1 md:py-0">
            {/* Left Section: Logo + Navigation */}
            <div className="flex items-center gap-3 lg:gap-8">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-surface-200 text-surface-700 transition-colors hover:bg-surface-100 hover:text-surface-900 lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              <Link
                href="/"
                className="group flex items-center gap-2 transition-opacity hover:opacity-90 shrink-0"
                aria-label="QeetMart Home"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600 text-sm font-black tracking-wide text-white transition-transform duration-300 group-hover:scale-105">
                  QM
                </div>
                <span className="hidden text-xl font-bold tracking-tight text-surface-900 dark:text-white sm:block">
                  QeetMart
                </span>
              </Link>

              {/* Desktop Navigation Links */}
              <nav className="hidden lg:flex items-center gap-6">
                <MegaMenu />
                <Link href="/" className="text-sm font-semibold text-surface-700 hover:text-brand-600 dark:text-surface-200 dark:hover:text-brand-400 transition-colors">
                  Home
                </Link>
                <Link href="/products" className="text-sm font-semibold text-surface-700 hover:text-brand-600 dark:text-surface-200 dark:hover:text-brand-400 transition-colors">
                  Shop
                </Link>
                <Link href="/products/category/new" className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors">
                  New Arrivals
                </Link>
              </nav>
            </div>

            {/* Center Section: Search Bar */}
            <div className="order-last md:order-none w-full md:w-auto md:flex-1 md:max-w-2xl mt-1 md:mt-0">
              <SearchBar />
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center justify-end gap-1 sm:gap-2 shrink-0">
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>

              <Button
                variant="ghost"
                size="icon"
                asChild
                className="hidden sm:flex transition-transform hover:scale-105"
              >
                <Link href="/wishlist" aria-label="Wishlist">
                  <Heart className="h-5 w-5" />
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="relative transition-transform hover:scale-105"
                onClick={() => setMiniCartOpen(true)}
                aria-label="Open cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 ? (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold tracking-tight text-white animate-in zoom-in spin-in-12 duration-300">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                ) : null}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                asChild
                className="transition-transform hover:scale-105"
              >
                <Link href={user ? "/account" : "/auth/login"} aria-label={user ? "Account" : "Login"}>
                  <UserCircle2 className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <MobileNav open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <MiniCartDrawer open={miniCartOpen} onClose={() => setMiniCartOpen(false)} />
    </>
  );
}
