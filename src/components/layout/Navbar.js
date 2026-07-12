"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Settings, Sun, Moon, Heart, ShoppingBag, User, ChevronDown, Menu, X, UserCircle2, LogOut, Search as SearchIcon } from "lucide-react";
import Button from "@/components/ui/button";
import SearchBar from "@/components/ui/SearchBar";
import toast from "react-hot-toast";
import { signOut } from "next-auth/react";

const NAV_LINKS = [
  // { label: "Home", href: "/" },
  // { label: "Shop", href: "/shop" },
  // { label: "Collections", href: "/collections" },
  // { label: "New Arrivals", href: "/new-arrivals" },
  // { label: "About", href: "/about" },
  // { label: "Contact", href: "/contact" },
];

export default function Navbar({ cartCount = 0, wishlistCount = 0, cartItems = [], searchSuggestions = [], onSearch }) {
  const pathname = usePathname();
  const router = useRouter();

  const [theme, setTheme] = useState("light");
  const [themeOpen, setThemeOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const isActive = (href) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));

  const applyTheme = (mode) => {
    setTheme(mode);
    if (mode === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    setThemeOpen(false);
  };

  const handleSearch = (query, suggestion) => {
    if (onSearch) {
      onSearch(query, suggestion);
      return;
    }
    if (!query?.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const onLogout = () => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="text-[13px] font-semibold text-neutral-900">Log out of your account?</p>
          <div className="flex gap-2">
            <Button
              variant="danger"
              size="sm"
              fullWidth
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await fetch("/api/auth/logout", { method: "POST" });
                  await signOut({ redirect: false });
                  window.location.href = "/login";
                } catch (e) {
                  window.location.href = "/login";
                }
              }}
            >
              Log out
            </Button>
            <Button variant="secondary" size="sm" fullWidth onClick={() => toast.dismiss(t.id)}>
              Cancel
            </Button>
          </div>
        </div>
      ),
      { duration: 5000, position: "top-center" },
    );
  };

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-neutral-200 dark:border-gray-800 px-4 sm:px-6 py-3 transition-colors sticky top-0 z-40">
      {/* Desktop */}
      <div className="hidden md:flex items-center justify-between gap-6">
        <div className="flex items-center gap-5 shrink-0">
          {/* Brand mark */}
          <Link href="/" className="flex items-baseline gap-1.5">
            <span className="text-lg font-semibold text-neutral-900 dark:text-white" style={{ fontFamily: "'Fraunces', serif" }}>
              Bashitha
            </span>
            <span className="text-[11px] font-semibold tracking-[0.18em] text-brand-700 dark:text-brand-400 uppercase">Ceramics</span>
          </Link>

          <span className="h-5 w-px bg-neutral-200 dark:bg-gray-700" />

          {/* Theme */}
          <div className="relative">
            <button
              onClick={() => setThemeOpen((s) => !s)}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2.5 py-1.5 text-xs font-medium text-neutral-600 dark:text-gray-300 hover:bg-neutral-50 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === "dark" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
              <ChevronDown className="h-3 w-3 text-neutral-400" />
            </button>
            {themeOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setThemeOpen(false)} />
                <div className="absolute z-20 mt-2 w-36 rounded-xl border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg shadow-neutral-900/10 p-1">
                  {[
                    { mode: "light", icon: Sun, label: "Light" },
                    { mode: "dark", icon: Moon, label: "Dark" },
                  ].map(({ mode, icon: Icon, label }) => (
                    <button
                      key={mode}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                        theme === mode
                          ? "bg-brand-50 text-brand-800 dark:bg-brand-400/10 dark:text-brand-400"
                          : "text-neutral-600 dark:text-gray-300 hover:bg-neutral-50 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => applyTheme(mode)}
                    >
                      <Icon className="h-3.5 w-3.5" /> {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <span className="h-5 w-px bg-neutral-200 dark:bg-gray-700" />

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center px-2.5 py-1.5 text-[13px] font-medium rounded-lg transition-colors ${
                  isActive(link.href)
                    ? "text-brand-800 dark:text-brand-400 bg-brand-50 dark:bg-brand-400/10"
                    : "text-neutral-600 dark:text-gray-300 hover:bg-neutral-50 dark:hover:bg-gray-800"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <SearchBar onSearch={handleSearch} suggestions={searchSuggestions} />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button variant="ghost" size="icon" title="Wishlist" className="relative">
            <Heart className="h-4 w-4" />
            {wishlistCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger-500 ring-2 ring-white dark:ring-gray-900" />
            )}
          </Button>

          {/* Cart with preview dropdown — same pattern as the notification dropdown */}
          <div className="relative">
            <Button variant="ghost" size="icon" onClick={() => setCartOpen((s) => !s)} title="Cart" className="relative">
              <ShoppingBag className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger-500 ring-2 ring-white dark:ring-gray-900" />
              )}
            </Button>
            {cartOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setCartOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] max-h-96 rounded-2xl border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl shadow-neutral-900/10 z-20 overflow-hidden">
                  <div className="border-b border-neutral-100 dark:border-gray-700 px-4 py-3.5">
                    <h3 className="text-[13.5px] font-semibold text-neutral-900 dark:text-white">Your cart</h3>
                    <p className="text-xs text-neutral-500 dark:text-gray-400 mt-0.5">
                      {cartItems.length > 0 ? `${cartItems.length} item${cartItems.length !== 1 ? "s" : ""}` : "Your cart is empty"}
                    </p>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {cartItems.length > 0 ? (
                      <div className="divide-y divide-neutral-100 dark:divide-gray-700">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex gap-3 items-center px-4 py-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-400/10 text-brand-800 dark:text-brand-400 font-bold text-[11px]">
                              {item.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-medium text-neutral-900 dark:text-white truncate">{item.name}</p>
                              <p className="text-[11px] text-neutral-400">Qty {item.quantity || 1}</p>
                            </div>
                            <span className="text-[13px] font-bold text-neutral-900 dark:text-white shrink-0">${item.price || 0}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-10 text-center">
                        <p className="text-xs text-neutral-400">Add items to see them here</p>
                      </div>
                    )}
                  </div>
                  {cartItems.length > 0 && (
                    <div className="border-t border-neutral-100 dark:border-gray-700 px-4 py-2.5">
                      <button
                        onClick={() => {
                          setCartOpen(false);
                          router.push("/cart");
                        }}
                        className="text-xs font-semibold text-brand-800 dark:text-brand-400 hover:underline w-full text-center"
                      >
                        View cart & checkout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <span className="h-5 w-px bg-neutral-200 dark:bg-gray-700 mx-1" />

          <Link
            href="/account"
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-neutral-600 dark:text-gray-300 hover:bg-neutral-50 dark:hover:bg-gray-700 transition-colors"
            title="Account"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-800 text-white">
              <User className="h-4 w-4" />
            </span>
            <span className="text-[13px] font-medium hidden lg:inline">Account</span>
          </Link>

          <Button variant="ghost" size="icon" onClick={() => router.push("/settings")} title="Settings">
            <Settings className="h-4 w-4" />
          </Button>

          <span className="h-5 w-px bg-neutral-200 dark:bg-gray-700 mx-1" />



          <Button variant="secondary" size="sm" icon={LogOut} onClick={onLogout} className="ml-1 text-danger-500 hover:border-danger-500">
            Log out
          </Button>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden flex items-center justify-between gap-2">
        <Link href="/" className="flex items-baseline gap-1.5">
          <span className="text-base font-semibold text-neutral-900 dark:text-white" style={{ fontFamily: "'Fraunces', serif" }}>
            Bashitha
          </span>
          <span className="text-[10px] font-semibold tracking-[0.16em] text-brand-700 dark:text-brand-400 uppercase">Ceramics</span>
        </Link>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setMobileSearchOpen((s) => !s)} title="Search">
            {mobileSearchOpen ? <X className="h-4 w-4" /> : <SearchIcon className="h-4 w-4" />}
          </Button>

          <Button variant="ghost" size="icon" title="Cart" className="relative" onClick={() => router.push("/cart")}>
            <ShoppingBag className="h-4 w-4" />
            {cartCount > 0 && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger-500 ring-2 ring-white dark:ring-gray-900" />}
          </Button>

          <Button variant="ghost" size="icon" onClick={() => setMobileOpen((s) => !s)} title="Menu">
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="md:hidden pt-3">
          <SearchBar onSearch={handleSearch} suggestions={searchSuggestions} variant="overlay" />
        </div>
      )}

      {mobileOpen && (
        <div className="md:hidden mt-3 space-y-0.5 border-t border-neutral-100 dark:border-gray-700 pt-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center h-9 px-3 rounded-lg text-[13px] font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-brand-50 text-brand-800 dark:bg-brand-400/10 dark:text-brand-400"
                  : "text-neutral-600 dark:text-gray-300 hover:bg-neutral-50 dark:hover:bg-gray-800"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/account"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 h-9 px-3 rounded-lg text-[13px] font-medium text-neutral-600 dark:text-gray-300 hover:bg-neutral-50 dark:hover:bg-gray-800"
          >
            <User className="h-3.5 w-3.5" /> Account
          </Link>
          <Link
            href="/wishlist"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 h-9 px-3 rounded-lg text-[13px] font-medium text-neutral-600 dark:text-gray-300 hover:bg-neutral-50 dark:hover:bg-gray-800"
          >
            <Heart className="h-3.5 w-3.5" /> Wishlist
          </Link>
        </div>
      )}
    </header>
  );
}
