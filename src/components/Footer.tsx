import React from "react";

export default function Footer() {
  return (
    <footer className="w-full text-green-900/80 text-sm flex flex-col items-center justify-center mx-auto bg-gradient-to-r from-lime-50 to-green-100 border-t border-green-200 shadow-sm py-6 px-2">
      <div className="flex justify-center gap-2 mb-2">
        <span className="text-2xl">🥝</span>
        <span className="text-2xl">🍇</span>
        <span className="text-2xl">🥕</span>
      </div>
      <p className="text-center">&copy; {new Date().getFullYear()} Field Basket. Eat healthy, live happy!</p>
    </footer>
  );
}
