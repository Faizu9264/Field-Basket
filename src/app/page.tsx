"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Hero from "../components/Hero";
import ProductGrid from "../components/ProductGrid";
import Footer from "../components/Footer";
import InstallPWAButton from "../components/InstallPWAButton";
import CartDrawer from "../components/CartDrawer";
import StoreSpinner from "../components/StoreSpinner";
import { useCartStore, Product } from "../store/cartStore";
import { useIsMobile } from "../hooks/useIsMobile";
import { useProductPaginationStore } from "../store/productPaginationStore";

export default function Home() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [cartOpen, setCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'fruit' | 'vegetable' | 'all'>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [fetching, setFetching] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(3); // You can make this user-configurable if you want
  const [total, setTotal] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  React.useEffect(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1200);
  }, []);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400); // 400ms debounce
    return () => clearTimeout(handler);
  }, [search]);

  const [error, setError] = React.useState<string | null>(null);
  const { productPages, setProductPage, clearProductPages } = useProductPaginationStore();
  const cacheKey = `page=${page}&limit=${limit}&search=${debouncedSearch.trim()}`;

  React.useEffect(() => {
    setFetching(true);
    setError(null);
    // Check cache first
    if (productPages[cacheKey]) {
      setProducts(productPages[cacheKey]);
      setFetching(false);
      return;
    }
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (debouncedSearch.trim()) params.append("search", debouncedSearch.trim());
    fetch(`/api/products?${params.toString()}`)
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'API error');
        }
        return res.json();
      })
      .then(data => {
        setProducts(data.products || []);
        setProductPage(cacheKey, data.products || []);
        setTotal(data.total || 0);
        setFetching(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load products');
        setFetching(false);
      });
  }, [page, limit, debouncedSearch, productPages, setProductPage, cacheKey]);

  // Clear cache when debounced search changes
  React.useEffect(() => {
    clearProductPages();
  }, [debouncedSearch, clearProductPages]);

  const cart = useCartStore((state) => state.cart);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const addToCart = useCartStore((state) => state.addToCart);
  const lastBuyNowProduct = React.useRef<Product | null>(null);
  const handleCartIconClick = () => {
    if (isMobile) {
      setCartOpen(true);
    } else {
      router.push("/cart");
    }
  };

  // Buy Now handler: add to cart, then open cart drawer (mobile) or redirect to cart (desktop)
  const handleBuyNow = React.useCallback((product: Product) => {
    lastBuyNowProduct.current = product;
    addToCart(product);
  }, [addToCart]);

  // Effect: when cart changes and lastBuyNowProduct is set, open drawer or redirect
  React.useEffect(() => {
    if (!lastBuyNowProduct.current) return;
    const inCart = cart.find(item => item.product.id === lastBuyNowProduct.current?.id);
    if (inCart) {
      if (isMobile) {
        setCartOpen(true);
      } else {
        router.push("/cart");
      }
      lastBuyNowProduct.current = null;
    }
  }, [cart, isMobile, router]);

  // Split products into fruits and vegetables (case-insensitive)
  const fruits = products.filter(p => p.type?.toLowerCase() === "fruit");
  const vegetables = products.filter(p => p.type?.toLowerCase() === "vegetable");


  if (loading) {
    return <StoreSpinner />;
  }
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-lime-100 via-green-50 to-yellow-100">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-red-200 flex flex-col items-center">
          <span className="text-4xl mb-4">❌</span>
          <div className="text-lg font-bold text-red-700 mb-2">Failed to load products</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  // Pagination controls
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-100 via-green-50 to-yellow-100 flex flex-col items-center px-2 pb-8">
      <Header
        cartCount={cartCount}
        onCartClick={handleCartIconClick}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobile={isMobile}
        search={search}
        setSearch={setSearch}
      />

      {/* Cart Drawer Modal (mobile only) */}
      {isMobile && (
        <CartDrawer
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
        />
      )}

      <Hero />

      <ProductGrid
        fruits={fruits}
        vegetables={vegetables}
        activeTab={search.trim() !== "" ? "all" : activeTab}
        onAddToCart={addToCart}
        onBuyNow={handleBuyNow}
        isMobile={isMobile}
        fetching={fetching}
      />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex gap-2 mt-6">
          <button
            className="px-3 py-1 rounded bg-green-200 text-green-900 font-semibold disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="px-2 py-1 text-green-800 font-bold">Page {page} of {totalPages}</span>
          <button
            className="px-3 py-1 rounded bg-green-200 text-green-900 font-semibold disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}

      <Footer />
      <InstallPWAButton />
    </div>
  );
}
