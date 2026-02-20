import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-surface-200 bg-surface-900 text-surface-200">
      <div className="container mx-auto grid gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <h3 className="text-base font-bold text-white">QeetMart</h3>
          <p className="text-sm text-surface-300">
            Production storefront foundation with scalable architecture and mock APIs.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">Shop</h4>
          <ul className="space-y-2 text-sm text-surface-300">
            <li>
              <Link href="/products" className="hover:text-white">
                All Products
              </Link>
            </li>
            <li>
              <Link href="/wishlist" className="hover:text-white">
                Wishlist
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-white">
                Cart
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">Account</h4>
          <ul className="space-y-2 text-sm text-surface-300">
            <li>
              <Link href="/account" className="hover:text-white">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/auth/login" className="hover:text-white">
                Login
              </Link>
            </li>
            <li>
              <Link href="/auth/signup" className="hover:text-white">
                Signup
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">Support</h4>
          <ul className="space-y-2 text-sm text-surface-300">
            <li>24x7 Support</li>
            <li>Easy Returns</li>
            <li>Secure Payments</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
