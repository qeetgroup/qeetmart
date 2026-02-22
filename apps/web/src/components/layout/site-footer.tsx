"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, ShieldCheck, Lock } from "lucide-react";
import { Newsletter } from "./newsletter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const footerLinks = {
  shop: [
    { name: "All Products", href: "/products" },
    { name: "New Arrivals", href: "/products/category/new" },
    { name: "Best Sellers", href: "/products/category/best-sellers" },
    { name: "Gift Cards", href: "#" },
  ],
  support: [
    { name: "Contact Us", href: "#" },
    { name: "FAQs", href: "#" },
    { name: "Shipping & Returns", href: "#" },
    { name: "Order Tracking", href: "#" },
  ],
  company: [
    { name: "About QeetMart", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Sustainability", href: "#" },
    { name: "Press", href: "#" },
  ],
  policies: [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Accessibility", href: "#" },
    { name: "Cookie Settings", href: "#" },
  ],
};

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-surface-950 text-surface-200" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>

      {/* Top Section: Newsletter */}
      <div className="container mx-auto px-4 py-12 lg:px-8 lg:py-16">
        <Newsletter />
      </div>

      <div className="container mx-auto px-4 pb-8 lg:px-8">
        <div className="xl:grid xl:grid-cols-5 xl:gap-8 border-t border-surface-800 pt-16">
          <div className="space-y-8 xl:col-span-1">
            <Link href="/" className="inline-block">
              <span className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600 text-sm font-black tracking-wide text-white">
                  QM
                </span>
                <span className="text-xl font-bold tracking-tight text-white">
                  QeetMart
                </span>
              </span>
            </Link>
            <p className="text-sm leading-6 text-surface-400">
              Premium storefront foundation offering a flawless commerce experience with best-in-class UI and UX.
            </p>
            <div className="flex gap-x-5">
              <Link href="#" className="text-surface-400 hover:text-white transition-colors">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-surface-400 hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-surface-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="mt-16 xl:col-span-4 xl:mt-0">
            {/* Desktop Navigation */}
            <div className="hidden md:grid md:grid-cols-4 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white uppercase tracking-wider">Shop</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {footerLinks.shop.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm leading-6 text-surface-400 transition-colors hover:text-white hover:underline underline-offset-4 font-medium">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white uppercase tracking-wider">Support</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {footerLinks.support.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm leading-6 text-surface-400 transition-colors hover:text-white hover:underline underline-offset-4 font-medium">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white uppercase tracking-wider">Company</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {footerLinks.company.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm leading-6 text-surface-400 transition-colors hover:text-white hover:underline underline-offset-4 font-medium">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white uppercase tracking-wider">Legal</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {footerLinks.policies.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm leading-6 text-surface-400 transition-colors hover:text-white hover:underline underline-offset-4 font-medium">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Mobile Navigation Accordion */}
            <div className="md:hidden">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="shop" className="border-surface-800">
                  <AccordionTrigger className="text-white hover:text-brand-400">Shop</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-3 pb-2">
                      {footerLinks.shop.map((item) => (
                        <li key={item.name}>
                          <Link href={item.href} className="text-sm text-surface-400 hover:text-white">{item.name}</Link>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="support" className="border-surface-800">
                  <AccordionTrigger className="text-white hover:text-brand-400">Support</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-3 pb-2">
                      {footerLinks.support.map((item) => (
                        <li key={item.name}>
                          <Link href={item.href} className="text-sm text-surface-400 hover:text-white">{item.name}</Link>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="company" className="border-surface-800">
                  <AccordionTrigger className="text-white hover:text-brand-400">Company</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-3 pb-2">
                      {footerLinks.company.map((item) => (
                        <li key={item.name}>
                          <Link href={item.href} className="text-sm text-surface-400 hover:text-white">{item.name}</Link>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="legal" className="border-surface-800">
                  <AccordionTrigger className="text-white hover:text-brand-400">Legal</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-3 pb-2">
                      {footerLinks.policies.map((item) => (
                        <li key={item.name}>
                          <Link href={item.href} className="text-sm text-surface-400 hover:text-white">{item.name}</Link>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 border-t border-surface-800 pt-8 sm:mt-20 lg:mt-24">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <p className="text-xs leading-5 text-surface-500">
              &copy; {new Date().getFullYear()} QeetMart Inc. All rights reserved.
            </p>

            <div className="flex items-center gap-4 text-surface-500">
              <div className="flex items-center gap-1.5 rounded-full border border-surface-800 bg-surface-900 px-3 py-1 text-xs">
                <Lock className="h-3 w-3" /> Secure Checkout
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-surface-800 bg-surface-900 px-3 py-1 text-xs">
                <ShieldCheck className="h-3 w-3" /> Fraud Protection
              </div>
            </div>

            <div className="flex gap-2 opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
              {/* Payment Mock Icons */}
              <div className="h-6 w-10 rounded bg-surface-800 flex items-center justify-center text-[10px] font-bold text-white">VISA</div>
              <div className="h-6 w-10 rounded bg-surface-800 flex items-center justify-center text-[10px] font-bold text-white">MC</div>
              <div className="h-6 w-10 rounded bg-surface-800 flex items-center justify-center text-[10px] font-bold text-white">AMEX</div>
              <div className="h-6 w-10 rounded bg-surface-800 flex items-center justify-center text-[10px] font-bold text-white">PAY</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
