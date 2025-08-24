import React from "react";

export default function Footer() {
  return (
    <footer className="w-full max-w-3xl mt-12 text-center text-green-900/70 text-sm">
      <div className="flex justify-center gap-2 mb-2">
        <span className="text-2xl">🥝</span>
        <span className="text-2xl">🍇</span>
        <span className="text-2xl">🥕</span>
      </div>
      <p>&copy; {new Date().getFullYear()} Field Basket. Eat healthy, live happy!</p>
    </footer>
  );
}
