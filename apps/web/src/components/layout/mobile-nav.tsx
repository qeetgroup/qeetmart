"use client";

import Link from "next/link";
import { Heart, Menu, Search, ShoppingCart, UserCircle2, X } from "lucide-react";
import { useSessionStore } from "@/store/session-store";
import { getCartCount, useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/lib/api/categories-api";
import { queryKeys } from "@/lib/query-keys";
import { ThemeToggle } from "@/components/layout/theme-toggle";

interface MobileNavProps {
    open: boolean;
    onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
    const user = useSessionStore((state) => state.user);
    const cartCount = useCartStore((state) => getCartCount(state.items));

    const { data: categories = [] } = useQuery({
        queryKey: queryKeys.categories,
        queryFn: getCategories,
        staleTime: 30 * 60 * 1000,
    });

    return (
        <Drawer open={open} onClose={onClose} title="Menu" side="left">
            <div className="flex h-full flex-col">
                <div className="flex-1 overflow-y-auto py-2">
                    <div className="space-y-6">
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="categories" className="border-b-0">
                                <AccordionTrigger className="rounded-md border border-surface-200 px-4 py-3 text-sm font-semibold hover:bg-surface-50 hover:no-underline">
                                    Shop by Category
                                </AccordionTrigger>
                                <AccordionContent className="pt-2 pb-0">
                                    <div className="flex flex-col space-y-1 pl-4">
                                        <Link
                                            href="/products"
                                            onClick={onClose}
                                            className="block py-2 text-sm text-surface-600 hover:text-brand-700 font-medium"
                                        >
                                            All Products
                                        </Link>
                                        {categories.map((cat) => (
                                            <Link
                                                key={cat.id}
                                                href={`/products/category/${cat.slug}`}
                                                onClick={onClose}
                                                className="block py-2 text-sm text-surface-600 hover:text-brand-700"
                                            >
                                                {cat.name}
                                            </Link>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        <nav className="space-y-1">
                            <Link
                                href="/wishlist"
                                onClick={onClose}
                                className="flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium text-surface-800 hover:bg-surface-50 hover:text-brand-700"
                            >
                                <Heart className="h-5 w-5 text-surface-500" />
                                Wishlist
                            </Link>
                            <Link
                                href="/cart"
                                onClick={onClose}
                                className="flex items-center justify-between rounded-md px-4 py-3 text-sm font-medium text-surface-800 hover:bg-surface-50 hover:text-brand-700"
                            >
                                <div className="flex items-center gap-3">
                                    <ShoppingCart className="h-5 w-5 text-surface-500" />
                                    Cart
                                </div>
                                {cartCount > 0 && (
                                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                            <Link
                                href={user ? "/account" : "/auth/login"}
                                onClick={onClose}
                                className="flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium text-surface-800 hover:bg-surface-50 hover:text-brand-700"
                            >
                                <UserCircle2 className="h-5 w-5 text-surface-500" />
                                {user ? "Account Dashboard" : "Login / Sign Up"}
                            </Link>
                        </nav>
                    </div>
                </div>

                <div className="border-t border-surface-200 py-4 mt-auto">
                    <div className="flex items-center justify-between px-4">
                        <span className="text-sm font-medium text-surface-700">Theme</span>
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </Drawer>
    );
}
