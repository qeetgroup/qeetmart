import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export function FaqAccordion() {
    return (
        <section className="mx-auto max-w-3xl px-4 py-16">
            <div className="mb-8 text-center space-y-2">
                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-surface-900">
                    Frequently Asked Questions
                </h2>
                <p className="text-surface-600 font-medium text-lg">
                    Everything you need to know about shipping, returns, and warranty.
                </p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
                <AccordionItem value="shipping" className="rounded-2xl border border-surface-200 bg-white px-6 py-2 shadow-sm">
                    <AccordionTrigger className="text-lg font-bold text-surface-900 hover:no-underline hover:text-brand-600 transition-colors">
                        Shipping details
                    </AccordionTrigger>
                    <AccordionContent className="text-base text-surface-600 leading-relaxed pb-4 pt-2">
                        We offer free standard shipping on all orders over ₹499. Most orders are processed within 24 hours and delivered within 3-5 business days. Express delivery options are available at checkout for an additional fee.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="returns" className="rounded-2xl border border-surface-200 bg-white px-6 py-2 shadow-sm">
                    <AccordionTrigger className="text-lg font-bold text-surface-900 hover:no-underline hover:text-brand-600 transition-colors">
                        Returns policy
                    </AccordionTrigger>
                    <AccordionContent className="text-base text-surface-600 leading-relaxed pb-4 pt-2">
                        If you're not completely satisfied with your purchase, you can return it within 7 days of delivery for a full refund or exchange. The item must be in its original condition and packaging. Return shipping is free for all orders.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="warranty" className="rounded-2xl border border-surface-200 bg-white px-6 py-2 shadow-sm">
                    <AccordionTrigger className="text-lg font-bold text-surface-900 hover:no-underline hover:text-brand-600 transition-colors">
                        Warranty info
                    </AccordionTrigger>
                    <AccordionContent className="text-base text-surface-600 leading-relaxed pb-4 pt-2">
                        All our products come with a standard 1-year manufacturer warranty covering any defects in materials or workmanship. For extended coverage, you can purchase one of our protection plans during checkout.
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </section>
    );
}
