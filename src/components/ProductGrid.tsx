"use client";
import React, { useState } from "react";
import ProductCard from "./ProductCard";
import { Product } from "../store/cartStore";

export default function ProductGrid({
  fruits,
  vegetables,
  activeTab,
  onAddToCart,
  onBuyNow,
  isMobile
}: {
  fruits: Product[];
  vegetables: Product[];
  activeTab: 'fruit' | 'vegetable' | 'all';
  onAddToCart: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
  isMobile: boolean;
}) {
  const FRUIT_LIMIT = isMobile ? 4 : 6;
  const VEG_LIMIT = isMobile ? 4 : 6;
  const [showAllFruits, setShowAllFruits] = useState(false);
  const [showAllVeggies, setShowAllVeggies] = useState(false);

  return (
    <div id="products" className="w-full max-w-5xl mt-2">
      {activeTab === 'fruit' && fruits.length > 0 && (
        <section className="mb-10">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-2xl font-bold text-green-700">Fruits</h2>
            {fruits.length > FRUIT_LIMIT && (
              <button
                className="text-green-600 underline font-semibold text-sm hover:text-green-800"
                onClick={() => setShowAllFruits((v) => !v)}
              >
                {showAllFruits ? 'Show Less' : 'View All'}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {(showAllFruits ? fruits : fruits.slice(0, FRUIT_LIMIT)).map((fruit) => (
              <ProductCard
                key={fruit.id}
                image={fruit.image}
                name={fruit.name}
                price={fruit.price}
                unit={fruit.unit}
                description={fruit.description}
                onAddToCart={() => onAddToCart(fruit)}
                onBuyNow={onBuyNow ? () => onBuyNow(fruit) : undefined}
              />
            ))}
          </div>
        </section>
      )}
      {activeTab === 'vegetable' && vegetables.length > 0 && (
        <section className="mb-10">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-2xl font-bold text-green-700">Vegetables</h2>
            {vegetables.length > VEG_LIMIT && (
              <button
                className="text-green-600 underline font-semibold text-sm hover:text-green-800"
                onClick={() => setShowAllVeggies((v) => !v)}
              >
                {showAllVeggies ? 'Show Less' : 'View All'}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {(showAllVeggies ? vegetables : vegetables.slice(0, VEG_LIMIT)).map((veg) => (
              <ProductCard
                key={veg.id}
                image={veg.image}
                name={veg.name}
                price={veg.price}
                unit={veg.unit}
                description={veg.description}
                onAddToCart={() => onAddToCart(veg)}
                onBuyNow={onBuyNow ? () => onBuyNow(veg) : undefined}
              />
            ))}
          </div>
        </section>
      )}
      {activeTab === 'all' && (
        <>
          {fruits.length > 0 && (
            <section className="mb-10">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-2xl font-bold text-green-700">Fruits</h2>
                {fruits.length > FRUIT_LIMIT && (
                  <button
                    className="text-green-600 underline font-semibold text-sm hover:text-green-800"
                    onClick={() => setShowAllFruits((v) => !v)}
                  >
                    {showAllFruits ? 'Show Less' : 'View All'}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {(showAllFruits ? fruits : fruits.slice(0, FRUIT_LIMIT)).map((fruit) => (
                  <ProductCard
                    key={fruit.id}
                    image={fruit.image}
                    name={fruit.name}
                    price={fruit.price}
                    unit={fruit.unit}
                    description={fruit.description}
                    onAddToCart={() => onAddToCart(fruit)}
                  />
                ))}
              </div>
            </section>
          )}
          {vegetables.length > 0 && (
            <section>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-2xl font-bold text-green-700">Vegetables</h2>
                {vegetables.length > VEG_LIMIT && (
                  <button
                    className="text-green-600 underline font-semibold text-sm hover:text-green-800"
                    onClick={() => setShowAllVeggies((v) => !v)}
                  >
                    {showAllVeggies ? 'Show Less' : 'View All'}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {(showAllVeggies ? vegetables : vegetables.slice(0, VEG_LIMIT)).map((veg) => (
                  <ProductCard
                    key={veg.id}
                    image={veg.image}
                    name={veg.name}
                    price={veg.price}
                    unit={veg.unit}
                    description={veg.description}
                    onAddToCart={() => onAddToCart(veg)}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
