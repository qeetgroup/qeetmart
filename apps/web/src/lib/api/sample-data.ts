import type { Category, Product, Review } from "@/types";
import { slugify } from "@/lib/utils";

const categorySeed = [
  {
    slug: "electronics",
    name: "Electronics",
    description: "Mobiles, laptops, accessories and smart gadgets",
    icon: "Laptop",
    bannerColor: "from-blue-600 to-cyan-500",
  },
  {
    slug: "fashion",
    name: "Fashion",
    description: "Everyday fashion for men, women and kids",
    icon: "Shirt",
    bannerColor: "from-pink-600 to-rose-500",
  },
  {
    slug: "home-kitchen",
    name: "Home & Kitchen",
    description: "Cookware, decor and smart home essentials",
    icon: "House",
    bannerColor: "from-amber-600 to-orange-500",
  },
  {
    slug: "beauty",
    name: "Beauty",
    description: "Skincare, makeup and personal care",
    icon: "Sparkles",
    bannerColor: "from-fuchsia-600 to-pink-500",
  },
  {
    slug: "sports-fitness",
    name: "Sports & Fitness",
    description: "Activewear, gym and sports equipment",
    icon: "Dumbbell",
    bannerColor: "from-emerald-600 to-lime-500",
  },
  {
    slug: "books",
    name: "Books",
    description: "Bestselling books and educational titles",
    icon: "BookOpen",
    bannerColor: "from-indigo-600 to-violet-500",
  },
  {
    slug: "toys-games",
    name: "Toys & Games",
    description: "Creative toys and fun family games",
    icon: "Puzzle",
    bannerColor: "from-yellow-600 to-amber-500",
  },
  {
    slug: "grocery",
    name: "Grocery",
    description: "Daily essentials delivered fast",
    icon: "ShoppingBasket",
    bannerColor: "from-green-600 to-emerald-500",
  },
  {
    slug: "appliances",
    name: "Appliances",
    description: "Large and small appliances for your home",
    icon: "Refrigerator",
    bannerColor: "from-slate-700 to-gray-600",
  },
  {
    slug: "furniture",
    name: "Furniture",
    description: "Modern furniture for home and office",
    icon: "Sofa",
    bannerColor: "from-stone-700 to-neutral-600",
  },
  {
    slug: "automotive",
    name: "Automotive",
    description: "Car care and riding accessories",
    icon: "Car",
    bannerColor: "from-red-700 to-orange-600",
  },
  {
    slug: "pet-supplies",
    name: "Pet Supplies",
    description: "Food, toys and care for your pets",
    icon: "PawPrint",
    bannerColor: "from-teal-600 to-cyan-500",
  },
] as const;

const descriptors = [
  "Ultra",
  "Pro",
  "Prime",
  "Edge",
  "Smart",
  "Elite",
  "Air",
  "Max",
  "Nova",
  "Core",
  "Fusion",
  "Signature",
  "Eco",
  "Daily",
  "Active",
  "Premium",
  "Classic",
];

const productBase: Record<string, string[]> = {
  electronics: [
    "Wireless Earbuds",
    "Gaming Laptop",
    "4K Smart TV",
    "Bluetooth Speaker",
    "Smartwatch",
    "Portable SSD",
    "Noise Cancelling Headphones",
    "Mechanical Keyboard",
    "Smartphone",
    "Tablet",
  ],
  fashion: [
    "Cotton Shirt",
    "Running Shoes",
    "Denim Jacket",
    "Casual Trousers",
    "Handbag",
    "Wrist Watch",
    "Sneakers",
    "Kurta Set",
    "Hoodie",
    "Leather Belt",
  ],
  "home-kitchen": [
    "Air Fryer",
    "Mixer Grinder",
    "Cookware Set",
    "Vacuum Cleaner",
    "Water Purifier",
    "Electric Kettle",
    "Wall Clock",
    "Dinner Set",
    "Storage Rack",
    "Bed Sheet",
  ],
  beauty: [
    "Vitamin C Serum",
    "Matte Lipstick",
    "Face Wash",
    "Hair Dryer",
    "Sunscreen SPF 50",
    "Body Lotion",
    "Perfume",
    "Eye Shadow Palette",
  ],
  "sports-fitness": [
    "Yoga Mat",
    "Adjustable Dumbbells",
    "Fitness Band",
    "Cycling Helmet",
    "Protein Powder",
    "Resistance Bands",
    "Treadmill",
    "Foam Roller",
  ],
  books: [
    "Productivity Blueprint",
    "Startup Playbook",
    "Design Masterclass",
    "Fiction Collection",
    "Kids Story Bundle",
    "Data Science Handbook",
    "Leadership Guide",
    "Cooking Stories",
  ],
  "toys-games": [
    "Building Blocks Set",
    "Remote Car",
    "Board Game",
    "STEM Robot Kit",
    "Puzzle Cube",
    "Doll House",
    "Art & Craft Kit",
  ],
  grocery: [
    "Organic Rice Pack",
    "Protein Oats",
    "Cold Pressed Oil",
    "Dry Fruits Combo",
    "Spice Box",
    "Instant Coffee",
    "Trail Mix",
  ],
  appliances: [
    "Front Load Washing Machine",
    "Double Door Refrigerator",
    "Microwave Oven",
    "Dishwasher",
    "Air Conditioner",
    "Room Heater",
  ],
  furniture: [
    "Ergonomic Office Chair",
    "Wooden Study Table",
    "3-Seater Sofa",
    "Bed Frame",
    "Bookshelf",
    "Coffee Table",
  ],
  automotive: [
    "Bike Helmet",
    "Car Vacuum",
    "Dash Cam",
    "Phone Mount",
    "Car Perfume",
    "Pressure Washer",
  ],
  "pet-supplies": [
    "Premium Dog Food",
    "Cat Litter Box",
    "Pet Grooming Kit",
    "Chew Toy Set",
    "Pet Bed",
    "Training Leash",
  ],
};

const brandPool = [
  "NovaCart",
  "ByteEdge",
  "UrbanNest",
  "HomeAura",
  "FitForge",
  "GlowLab",
  "Craftio",
  "Freshly",
  "AxisOne",
  "CloudNine",
  "TrailPro",
  "EcoLeaf",
  "EverPeak",
  "PrimePulse",
  "Astra",
  "Northline",
  "Mercury",
  "Radian",
];

const reviewTitles = [
  "Excellent quality",
  "Worth the price",
  "Solid performance",
  "Delivery was quick",
  "Better than expected",
  "Good value for money",
  "Packaging was great",
  "Perfect for daily use",
  "Would recommend",
  "Impressive product",
];

const reviewComments = [
  "Build quality is premium and usage has been smooth for weeks.",
  "Exceeded expectations on performance and fit for the price point.",
  "Using this daily and it has been reliable so far.",
  "Customer support and packaging both were surprisingly good.",
  "The product feels durable and practical for long-term use.",
  "Good balance of features and value; happy with the purchase.",
  "Arrived on time and setup was easy without extra effort.",
  "Exactly what I needed, especially for regular home usage.",
  "Looks modern and works as advertised with no issues yet.",
  "I would buy this again and suggest it to friends.",
];

function seeded(seed: number) {
  const x = Math.sin(seed * 9973) * 10000;
  return x - Math.floor(x);
}

function pick<T>(list: readonly T[] | T[], seed: number): T {
  return list[Math.floor(seeded(seed) * list.length)] as T;
}

function randomBetween(min: number, max: number, seed: number) {
  return Math.floor(seeded(seed) * (max - min + 1)) + min;
}

const baseDate = new Date("2024-01-01T00:00:00.000Z");

export const categoriesData: Category[] = categorySeed.map((category, index) => ({
  id: `cat_${index + 1}`,
  ...category,
  image: `https://picsum.photos/seed/category-${category.slug}/800/600`,
}));

function buildVariants(categorySlug: string, seed: number) {
  const colors = ["Black", "Blue", "Silver", "Green", "White", "Red"];
  const sizes = ["S", "M", "L", "XL"];
  const storage = ["64GB", "128GB", "256GB", "512GB"];

  if (categorySlug === "electronics") {
    return [
      { name: "Color", values: colors.slice(0, randomBetween(3, 5, seed + 3)) },
      {
        name: "Storage",
        values: storage.slice(0, randomBetween(2, 4, seed + 5)),
      },
    ];
  }

  if (["fashion", "sports-fitness"].includes(categorySlug)) {
    return [
      { name: "Color", values: colors.slice(0, randomBetween(3, 6, seed + 7)) },
      { name: "Size", values: sizes.slice(0, randomBetween(3, 4, seed + 9)) },
    ];
  }

  if (["beauty", "grocery"].includes(categorySlug)) {
    return [
      {
        name: "Pack",
        values: ["Single", "Pack of 2", "Pack of 4", "Family Pack"].slice(
          0,
          randomBetween(2, 4, seed + 11),
        ),
      },
    ];
  }

  return [
    { name: "Color", values: colors.slice(0, randomBetween(2, 4, seed + 13)) },
  ];
}

function buildProduct(index: number): Product {
  const category = categoriesData[index % categoriesData.length];
  const noun = pick(productBase[category.slug], index + 1);
  const descriptor = pick(descriptors, index + 2);
  const title = `${descriptor} ${noun}`;
  const slug = slugify(`${category.slug}-${title}-${index + 1}`);

  const price = randomBetween(499, 189999, index + 3);
  const originalPrice = price + randomBetween(100, Math.max(300, Math.floor(price * 0.45)), index + 4);
  const rating = Math.round((3 + seeded(index + 5) * 2) * 10) / 10;
  const reviewCount = randomBetween(35, 2500, index + 6);
  const stock = randomBetween(0, 70, index + 7);
  const createdAt = new Date(baseDate.getTime() + randomBetween(0, 650, index + 8) * 86400000).toISOString();

  return {
    id: `prod_${index + 1}`,
    slug,
    title,
    shortDescription: `${title} built for modern shoppers who want quality and reliability.`,
    description:
      `${title} combines premium materials, thoughtful design and optimized performance for daily use. ` +
      "Engineered for reliability with strong after-sales support and quick delivery options.",
    categorySlug: category.slug,
    brand: pick(brandPool, index + 9),
    tags: [category.name, pick(["Bestseller", "Value Deal", "Limited Offer", "Top Pick"], index + 10)],
    price,
    originalPrice,
    currency: "INR",
    rating,
    reviewCount,
    stock,
    images: Array.from({ length: 5 }, (_, imageIndex) => {
      return `https://picsum.photos/seed/${slug}-${imageIndex + 1}/1200/1200`;
    }),
    variants: buildVariants(category.slug, index + 11),
    specs: [
      { label: "Brand", value: pick(brandPool, index + 12) },
      { label: "Warranty", value: `${randomBetween(6, 24, index + 13)} months` },
      { label: "Dispatch", value: "Ships in 24 hours" },
      { label: "Return Policy", value: "7-day replacement" },
    ],
    features: [
      "Fast delivery across major cities",
      "Secure packaging with damage protection",
      "Quality tested before dispatch",
      "Dedicated support through chat and call",
    ],
    trustBadges: ["Secure Payment", "7-Day Return", "Genuine Products", "Trusted Seller"],
    isFeatured: index % 6 === 0,
    isTrending: index % 5 === 0,
    isNew: new Date(createdAt).getTime() > Date.now() - 120 * 86400000,
    createdAt,
  };
}

function buildReviews(product: Product, seed: number): Review[] {
  const count = randomBetween(3, 8, seed + 20);

  return Array.from({ length: count }, (_, index) => {
    const reviewSeed = seed * 100 + index;
    const rating = randomBetween(3, 5, reviewSeed + 1);
    const createdAt = new Date(
      Date.now() - randomBetween(1, 400, reviewSeed + 2) * 86400000,
    ).toISOString();

    return {
      id: `rev_${product.id}_${index + 1}`,
      productId: product.id,
      userName: pick(
        [
          "Ananya S.",
          "Rohan K.",
          "Meera P.",
          "Amit V.",
          "Sana J.",
          "Rahul T.",
          "Neha B.",
          "Priya D.",
          "Karan M.",
          "Ishita L.",
        ],
        reviewSeed + 3,
      ),
      rating,
      title: pick(reviewTitles, reviewSeed + 4),
      comment: pick(reviewComments, reviewSeed + 5),
      helpfulCount: randomBetween(0, 180, reviewSeed + 6),
      verifiedPurchase: seeded(reviewSeed + 7) > 0.18,
      createdAt,
    };
  });
}

export const productsData: Product[] = Array.from({ length: 132 }, (_, index) =>
  buildProduct(index),
);

export const reviewsData: Review[] = productsData.flatMap((product, index) =>
  buildReviews(product, index + 1),
);
