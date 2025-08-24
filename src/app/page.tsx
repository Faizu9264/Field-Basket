
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useIsMobile } from "../hooks/useIsMobile";
import { fruits } from "../data/fruits";
import { vegetables } from "../data/vegetables";
import { useCartStore, Product } from "../store/cartStore";
import CartDrawer from "../components/CartDrawer";
import Header from "../components/Header";
import Hero from "../components/Hero";
import ProductGrid from "../components/ProductGrid";
import Footer from "../components/Footer";

export default function Home() {
  const addToCart = useCartStore((state) => state.addToCart);
  const cart = useCartStore((state) => state.cart);
  const [cartOpen, setCartOpen] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const isMobile = useIsMobile();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'fruit' | 'vegetable' | 'all'>('fruit');
  const [search, setSearch] = useState("");

  useEffect(() => {
    setHasHydrated(true);
  }, []);
  const cartCount = hasHydrated ? cart.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const handleAddToCart = (product: Product) => {
    addToCart(product);
    // Do not open cart drawer on mobile, just update cart
  };

  const handleCartIconClick = () => {
    if (isMobile) {
      setCartOpen(true);
    } else {
      router.push("/cart");
    }
  };

  // Filter products by search
  const filteredFruits = fruits.filter(fruit => fruit.name.toLowerCase().includes(search.toLowerCase()));
  const filteredVegetables = vegetables.filter(veg => veg.name.toLowerCase().includes(search.toLowerCase()));

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
          open={cartOpen}
          onClose={() => setCartOpen(false)}
        />
      )}


	  <Hero />


      <ProductGrid
        fruits={filteredFruits}
        vegetables={filteredVegetables}
        activeTab={activeTab}
        onAddToCart={handleAddToCart}
        isMobile={isMobile}
      />
      <Footer />
    </div>
  );
}
