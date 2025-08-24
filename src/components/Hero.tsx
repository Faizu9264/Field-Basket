import React from "react";

export default function Hero() {
  return (
    <div className="w-full max-w-3xl text-center py-8 flex flex-col items-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="text-4xl">🍎</span>
        <span className="text-4xl">🍌</span>
        <span className="text-4xl">🥦</span>
        <span className="text-4xl">🍊</span>
      </div>
      <h1 className="text-4xl sm:text-5xl font-extrabold text-green-700 mb-2 drop-shadow-lg">Fresh Fruits & Veggies Delivered</h1>
      <p className="text-lg sm:text-xl text-green-900/80 mb-6">Order the best quality fruits and vegetables, delivered to your doorstep. Healthy, tasty, and always fresh!</p>
  <a href="#products" className="inline-block bg-gradient-to-r from-green-500 to-lime-400 hover:from-green-600 hover:to-lime-500 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg transition">Shop Now</a>
    </div>
  );
}
