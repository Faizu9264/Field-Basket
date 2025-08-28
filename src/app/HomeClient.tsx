"use client";
import ProductGrid from "../components/ProductGrid";
import ProductBrowser from "../components/ProductBrowser";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Product } from "../store/cartStore";
import Header from "../components/Header";
import Hero from "../components/Hero";
import CartDrawer from "../components/CartDrawer";
import { useCartStore } from "../store/cartStore";
import { useIsMobile } from "../hooks/useIsMobile";
import StoreSpinner from "../components/StoreSpinner";



interface HomeClientProps {
  initialProducts: Product[];
  initialTotal: number;
  initialLimit: number;
}

export default function HomeClient({ initialProducts, initialTotal, initialLimit }: HomeClientProps) {
  const isMobile = useIsMobile();
  const [cartOpen, setCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'fruit' | 'vegetable' | 'all'>("all");
  const [search, setSearch] = useState("");
  const cart = useCartStore((state) => state.cart);
  const addToCart = useCartStore((state) => state.addToCart);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(initialTotal / initialLimit);
  const [showBrowser, setShowBrowser] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <StoreSpinner />;
  }

  const handleCartClick = () => {
    if (isMobile) {
      setCartOpen(true);
    } else {
      router.push("/cart");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-100 via-green-50 to-yellow-100 flex flex-col items-center px-2 pb-8">
      <Header
        cartCount={cartCount}
        onCartClick={handleCartClick}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobile={isMobile}
        search={search}
        setSearch={setSearch}
      />
      {isMobile && (
        <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      )}
      <Hero />
      {/* Show initial products instantly after spinner, use ProductBrowser for pagination/search or next/prev */}
      {(!showBrowser && search === "" && activeTab === "all") ? (
        <>
          <ProductGrid
            fruits={initialProducts.filter(p => (p.type?.toLowerCase?.() === 'fruit') || !p.type)}
            vegetables={initialProducts.filter(p => p.type?.toLowerCase?.() === 'vegetable')}
            activeTab={activeTab}
            onAddToCart={(product) => {
              addToCart(product);
              // Optionally show toast here
            }}
            onBuyNow={(product) => {
              addToCart(product);
              if (isMobile) {
                setCartOpen(true);
              } else {
                router.push("/cart");
              }
            }}
            isMobile={isMobile}
            fetching={false}
          />
          {totalPages > 1 && (
            <div className="flex gap-2 mt-6 justify-center">
              <span className="px-2 py-1 text-green-800 font-bold">Page {page} of {totalPages}</span>
              <button
                className="px-3 py-1 rounded bg-green-200 text-green-900 font-semibold disabled:opacity-50"
                onClick={() => { setShowBrowser(true); setPage(2); }}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <ProductBrowser
          initialProducts={initialProducts}
          initialTotal={initialTotal}
          initialLimit={initialLimit}
          activeTab={activeTab}
          search={search}
          page={page}
          setPage={setPage}
          isMobile={isMobile}
          onAddToCart={(product) => {
            addToCart(product);
          }}
          onBuyNow={(product) => {
            addToCart(product);
            if (isMobile) {
              setCartOpen(true);
            } else {
              router.push("/cart");
            }
          }}
        />
      )}
    </div>
  );
}
