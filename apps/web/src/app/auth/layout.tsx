import { ReactNode } from "react";
import Link from "next/link";
import { ShieldCheck, Lock } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
            <div className="relative flex-col justify-between bg-brand-900 p-8 text-white md:flex md:p-12 lg:p-16 overflow-hidden hidden">
                {/* Abstract Premium Background */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -left-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-brand-600/30 blur-[100px] mix-blend-screen" />
                    <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-brand-500/20 blur-[80px] mix-blend-screen" />
                    <div className="absolute inset-0 bg-gradient-to-b from-brand-900/40 via-transparent to-brand-900/90" />
                </div>

                {/* Top Header */}
                <div className="relative z-10 flex items-start justify-between">
                    <Link href="/" className="inline-flex items-center gap-2 transition-transform hover:scale-105">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-900 shadow-sm">
                            <span className="text-xl font-black">Q</span>
                        </div>
                        <span className="text-2xl font-black tracking-tight">QeetMart</span>
                    </Link>

                    <div className="flex items-center gap-1.5 rounded-full bg-brand-800/50 px-3 py-1.5 text-xs font-medium backdrop-blur-md border border-brand-700/50 shadow-sm mt-1">
                        <Lock className="h-3 w-3 text-brand-200" />
                        <span className="text-brand-50">Secure Request</span>
                    </div>
                </div>

                {/* Main Content Centered Vertically */}
                <div className="relative z-10 mb-10 flex flex-1 flex-col justify-center mt-16">
                    <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-[1.15] mb-6 text-white">
                        Premium commerce, <br />
                        uncompromised security.
                    </h1>
                    <p className="text-brand-200 mb-10 max-w-md text-lg leading-relaxed font-medium">
                        Join thousands of shoppers and experience the future of retail with bank-grade protection and a privacy first approach.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4 group cursor-default">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-inner group-hover:bg-white/10 transition-colors">
                                <ShieldCheck className="h-6 w-6 text-brand-300" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-white text-base">Secure & Encrypted</span>
                                <span className="text-sm text-brand-200/80 font-medium mt-0.5">256-bit encryption for all data</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 group cursor-default">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-inner group-hover:bg-white/10 transition-colors">
                                <Lock className="h-6 w-6 text-brand-300" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-white text-base">Privacy First</span>
                                <span className="text-sm text-brand-200/80 font-medium mt-0.5">We never share your personal details</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Footer or Trust Badges (Optional) */}
                <div className="relative z-10 text-sm font-medium text-brand-200/60">
                    © {new Date().getFullYear()} QeetMart. All rights reserved.
                </div>
            </div>

            {/* Right side - Auth Form */}
            <div className="flex items-center justify-center p-6 sm:p-12 md:p-16 bg-background dark:bg-[#0b1220] border-l border-surface-200 dark:border-surface-800">
                <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500 ease-out">
                    {children}
                </div>
            </div>
        </div>
    );
}
