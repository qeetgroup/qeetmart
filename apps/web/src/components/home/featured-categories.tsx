import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/types";

interface FeaturedCategoriesProps {
    categories: Category[];
}

export function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
    // Take 6 items to match "4-6 category cards" instruction
    const displayCategories = categories.slice(0, 6);

    return (
        <section className="container mx-auto px-4 py-12 md:py-16">
            <div className="mb-8 flex flex-col items-center text-center">
                <h2 className="text-2xl font-semibold tracking-tight text-surface-900 md:text-3xl">
                    Shop by Category
                </h2>
                <p className="mt-2 max-w-2xl text-surface-600">
                    Explore our carefully curated collections designed to elevate your everyday experience.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-6">
                {displayCategories.map((category) => (
                    <Link
                        key={category.id}
                        href={`/products/category/${category.slug}`}
                        className="group relative flex flex-col overflow-hidden rounded-2xl bg-surface-50 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-surface-200/50"
                    >
                        <div className="relative aspect-square w-full overflow-hidden bg-surface-100">
                            <Image
                                src={category.image}
                                alt={category.name}
                                fill
                                className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                                sizes="(max-width: 768px) 50vw, 16vw"
                            />
                            {/* Subtle dark gradient at bottom for text contrast if overlaid, but here we place text distinctly below image or overlay */}
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-surface-900/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 lg:hidden" />
                        </div>

                        <div className="flex flex-1 flex-col justify-center p-4 text-center">
                            <h3 className="text-base font-semibold text-surface-900 transition-colors duration-300 group-hover:text-brand-700">
                                {category.name}
                            </h3>
                            {/* Optional: Show description on larger screens if desired */}
                            {/* <p className="mt-1 hidden text-sm text-surface-500 lg:line-clamp-2">
                {category.description}
              </p> */}
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
