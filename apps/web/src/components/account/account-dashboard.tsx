"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { getOrdersByUser } from "@/lib/api/orders-api";
import { getProductsByIds } from "@/lib/api/products-api";
import { queryKeys } from "@/lib/query-keys";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useSessionStore } from "@/store/session-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { AuthGuard } from "@/components/common/auth-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/common/empty-state";

const sections = ["orders", "profile", "addresses", "wishlist"] as const;

export function AccountDashboard() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<(typeof sections)[number]>("orders");

  const user = useSessionStore((state) => state.user);
  const logout = useSessionStore((state) => state.logout);
  const updateProfile = useSessionStore((state) => state.updateProfile);
  const upsertAddress = useSessionStore((state) => state.upsertAddress);
  const removeAddress = useSessionStore((state) => state.removeAddress);

  const addItem = useCartStore((state) => state.addItem);

  const getWishlistByUser = useWishlistStore((state) => state.getWishlistByUser);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);

  const wishlistIds = user ? getWishlistByUser(user.id) : [];

  const { data: orders = [] } = useQuery({
    queryKey: user ? queryKeys.orders(user.id) : ["orders", "guest"],
    queryFn: () => getOrdersByUser(user!.id),
    enabled: Boolean(user),
  });

  const { data: wishlistProducts = [] } = useQuery({
    queryKey: queryKeys.cartProducts(wishlistIds),
    queryFn: () => getProductsByIds(wishlistIds),
    enabled: wishlistIds.length > 0,
  });

  const [profileDraft, setProfileDraft] = useState(() => ({
    name: user?.name ?? "",
    email: user?.email ?? "",
  }));

  const [addressDraft, setAddressDraft] = useState(() => ({
    id: "",
    fullName: user?.name ?? "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    phone: "",
  }));

  const totals = useMemo(() => {
    return {
      orders: orders.length,
      spent: orders.reduce((sum, order) => sum + order.total, 0),
    };
  }, [orders]);

  return (
    <AuthGuard>
      <div className="container mx-auto space-y-6 px-4 py-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-surface-900 md:text-3xl">
              My Account
            </h1>
            <p className="text-sm text-surface-600">
              Manage orders, profile, addresses and wishlist from one dashboard.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              logout();
              router.push("/");
            }}
          >
            Logout
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-surface-600">Total Orders</p>
              <p className="text-2xl font-black text-surface-900">{totals.orders}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-surface-600">Total Spend</p>
              <p className="text-2xl font-black text-surface-900">{formatCurrency(totals.spent)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-surface-600">Wishlist Items</p>
              <p className="text-2xl font-black text-surface-900">{wishlistProducts.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-surface-600">Primary Email</p>
              <p className="truncate text-sm font-semibold text-surface-900">{user?.email}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[220px,1fr]">
          <Card>
            <CardContent className="space-y-2 p-3">
              {sections.map((section) => (
                <button
                  key={section}
                  type="button"
                  onClick={() => setActiveSection(section)}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition ${
                    activeSection === section
                      ? "bg-brand-50 text-brand-800"
                      : "text-surface-700 hover:bg-surface-100"
                  }`}
                >
                  {section[0].toUpperCase() + section.slice(1)}
                </button>
              ))}
            </CardContent>
          </Card>

          <section className="space-y-4">
            {activeSection === "orders" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <EmptyState
                      title="No orders yet"
                      description="Orders placed from checkout will appear here."
                      actionHref="/products"
                    />
                  ) : (
                    <div className="space-y-3">
                      {orders.map((order) => (
                        <div key={order.id} className="rounded-lg border border-surface-200 p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-surface-900">#{order.id}</p>
                            <p className="text-xs text-surface-600">{formatDate(order.createdAt)}</p>
                          </div>
                          <p className="mt-1 text-sm text-surface-700">
                            {order.items.length} items • {formatCurrency(order.total)}
                          </p>
                          <p className="mt-1 text-xs text-surface-600">
                            Status: {order.status}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : null}

            {activeSection === "profile" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <Label>Name</Label>
                    <Input
                      value={profileDraft.name}
                      onChange={(event) =>
                        setProfileDraft((previous) => ({
                          ...previous,
                          name: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={profileDraft.email}
                      onChange={(event) =>
                        setProfileDraft((previous) => ({
                          ...previous,
                          email: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <Button
                    onClick={() => {
                      updateProfile(profileDraft);
                      toast.success("Profile updated");
                    }}
                  >
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            ) : null}

            {activeSection === "addresses" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Address Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {user?.addresses.map((address) => (
                      <div key={address.id} className="rounded-lg border border-surface-200 p-3">
                        <p className="text-sm font-semibold text-surface-900">{address.fullName}</p>
                        <p className="text-xs text-surface-600">
                          {address.line1}, {address.city}, {address.state} - {address.postalCode}
                        </p>
                        <p className="text-xs text-surface-600">{address.phone}</p>
                        <button
                          type="button"
                          className="mt-2 text-xs font-medium text-red-600 hover:text-red-700"
                          onClick={() => removeAddress(address.id)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 rounded-lg border border-surface-200 p-3">
                    <p className="text-sm font-semibold text-surface-900">Add New Address</p>
                    <Input
                      placeholder="Full name"
                      value={addressDraft.fullName}
                      onChange={(event) =>
                        setAddressDraft((previous) => ({
                          ...previous,
                          fullName: event.target.value,
                        }))
                      }
                    />
                    <Input
                      placeholder="Address line"
                      value={addressDraft.line1}
                      onChange={(event) =>
                        setAddressDraft((previous) => ({
                          ...previous,
                          line1: event.target.value,
                        }))
                      }
                    />
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input
                        placeholder="City"
                        value={addressDraft.city}
                        onChange={(event) =>
                          setAddressDraft((previous) => ({
                            ...previous,
                            city: event.target.value,
                          }))
                        }
                      />
                      <Input
                        placeholder="State"
                        value={addressDraft.state}
                        onChange={(event) =>
                          setAddressDraft((previous) => ({
                            ...previous,
                            state: event.target.value,
                          }))
                        }
                      />
                      <Input
                        placeholder="Postal code"
                        value={addressDraft.postalCode}
                        onChange={(event) =>
                          setAddressDraft((previous) => ({
                            ...previous,
                            postalCode: event.target.value,
                          }))
                        }
                      />
                      <Input
                        placeholder="Phone"
                        value={addressDraft.phone}
                        onChange={(event) =>
                          setAddressDraft((previous) => ({
                            ...previous,
                            phone: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <Button
                      onClick={() => {
                        if (!addressDraft.fullName || !addressDraft.line1 || !addressDraft.city) {
                          toast.error("Please complete required address fields");
                          return;
                        }

                        upsertAddress({
                          ...addressDraft,
                          id: addressDraft.id || `addr_${nanoid(6)}`,
                          country: "India",
                        });
                        toast.success("Address saved");
                        setAddressDraft((previous) => ({
                          ...previous,
                          id: "",
                          line1: "",
                          line2: "",
                          city: "",
                          state: "",
                          postalCode: "",
                          phone: "",
                        }));
                      }}
                    >
                      Save Address
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {activeSection === "wishlist" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Wishlist</CardTitle>
                </CardHeader>
                <CardContent>
                  {wishlistProducts.length === 0 ? (
                    <EmptyState
                      title="Wishlist is empty"
                      description="Add products to wishlist while browsing."
                      actionHref="/products"
                    />
                  ) : (
                    <div className="space-y-3">
                      {wishlistProducts.map((product) => (
                        <div key={product.id} className="grid grid-cols-[64px,1fr,auto] items-center gap-3 rounded-lg border border-surface-200 p-2">
                          <Image
                            src={product.images[0]}
                            alt={product.title}
                            width={64}
                            height={64}
                            className="rounded-md border border-surface-200 object-cover"
                          />
                          <div>
                            <Link
                              href={`/products/${product.slug}`}
                              className="line-clamp-1 text-sm font-medium text-surface-900 hover:text-brand-700"
                            >
                              {product.title}
                            </Link>
                            <p className="text-xs text-surface-600">{formatCurrency(product.price)}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                addItem({ productId: product.id, quantity: 1 });
                                toast.success("Added to cart");
                              }}
                            >
                              Add
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => user && toggleWishlist(user.id, product.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : null}
          </section>
        </div>
      </div>
    </AuthGuard>
  );
}
