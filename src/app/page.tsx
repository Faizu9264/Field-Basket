"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Hero from "../components/Hero";
import ProductGrid from "../components/ProductGrid";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";
import StoreSpinner from "../components/StoreSpinner";
import { fruits } from "../data/fruits";
import { vegetables } from "../data/vegetables";
import { useCartStore, Product } from "../store/cartStore";
import { useIsMobile } from "../hooks/useIsMobile";

export default function Home() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [cartOpen, setCartOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'fruit' | 'vegetable' | 'all'>("fruit");
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);
  const cartCount = useCartStore((state) => state.cart.reduce((sum, item) => sum + item.quantity, 0));
  const addToCart = useCartStore((state) => state.addToCart);
  const handleCartIconClick = () => {
    if (isMobile) {
      setCartOpen(true);
    } else {
      router.push("/cart");
    }
  };

  // Buy Now handler: add to cart, then open cart drawer (mobile) or redirect to cart (desktop)
  const handleBuyNow = (product: Product) => {
    addToCart(product);
    if (isMobile) {
      setCartOpen(true);
    } else {
      router.push("/cart");
    }
  };

  // Filter logic: if search is non-empty, show all matching fruits and vegetables regardless of tab
  let filteredFruits = fruits;
  let filteredVegetables = vegetables;
  if (search.trim() !== "") {
    const keyword = search.toLowerCase();
    filteredFruits = fruits.filter(fruit => fruit.name.toLowerCase().includes(keyword));
    filteredVegetables = vegetables.filter(veg => veg.name.toLowerCase().includes(keyword));
  } else {
    // If no search, filter by tab
    if (activeTab === "fruit") {
      filteredVegetables = [];
    } else if (activeTab === "vegetable") {
      filteredFruits = [];
    }
    // If 'all', show both
  }

  if (loading) {
    return <StoreSpinner />;
  }

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
        activeTab={search.trim() !== "" ? "all" : activeTab}
        onAddToCart={addToCart}
        onBuyNow={handleBuyNow}
        isMobile={isMobile}
      />
      <Footer />
    </div>
  );
}
