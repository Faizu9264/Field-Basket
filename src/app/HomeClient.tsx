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
  // Remove showBrowser logic
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
      {/* Always use ProductBrowser for all tab/search/page changes except very first SSR render */}
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
    </div>
  );
}
