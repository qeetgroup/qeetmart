import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Newsletter() {
    return (
        <div className="rounded-2xl bg-surface-800 p-8 sm:p-12 lg:p-16">
            <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Join our newsletter
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-lg text-surface-300">
                    Subscribe to get exclusive offers, early access to new collections, and the latest trends delivered straight to your inbox.
                </p>
                <form className="mx-auto mt-8 flex max-w-md gap-x-4 sm:justify-center">
                    <div className="relative flex-1">
                        <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
                        <Input
                            type="email"
                            placeholder="Enter your email address"
                            className="h-12 w-full rounded-full border-surface-600 bg-surface-900/50 pl-12 pr-4 text-white placeholder-surface-400 focus:border-brand-500 focus:bg-surface-900 focus:ring-brand-500/20"
                            required
                        />
                    </div>
                    <Button type="submit" className="h-12 shrink-0 rounded-full bg-brand-600 px-6 font-semibold text-white transition-all hover:bg-brand-500 hover:shadow-lg">
                        Subscribe <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </form>
                <p className="mt-4 text-xs text-surface-400">
                    By subscribing, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
}
