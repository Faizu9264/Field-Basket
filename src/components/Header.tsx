"use client";
// ...existing code...
import React from "react";
import { FaFilter } from "react-icons/fa";
import Image from "next/image";

export default function Header({ cartCount, onCartClick, activeTab, setActiveTab, isMobile, search, setSearch }: {
  cartCount: number;
  onCartClick: () => void;
  activeTab: 'fruit' | 'vegetable' | 'all';
  setActiveTab: (tab: 'fruit' | 'vegetable' | 'all') => void;
  isMobile: boolean;
  search: string;
  setSearch: (value: string) => void;
}) {
  return (
    <header className="sticky top-0 z-50 w-full max-w-5xl mx-auto bg-gradient-to-r from-lime-50/80 to-yellow-50/80 backdrop-blur-md py-4 px-2">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2 select-none">
          <Image src="/field-basket-logo.svg" alt="Field Basket Logo" width={40} height={40} className="w-10 h-10 rounded-lg shadow" />
          <span className="text-xl sm:text-2xl font-extrabold text-green-700 tracking-tight drop-shadow">FIELD BASKET</span>
        </div>
        <button
          className="relative inline-block group focus:outline-none ml-auto sm:ml-0 mt-0"
          onClick={onCartClick}
          aria-label="Open cart"
        >
          <span className="text-3xl drop-shadow">🛒</span>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow-lg border-2 border-white">
              {cartCount}
            </span>
          )}
          <span className="sr-only">View cart</span>
        </button>
      </div>
      {/* Search bar and filter dropdown for both desktop and mobile */}
      <div className={`flex w-full items-center gap-2 mt-4 ${isMobile ? '' : 'justify-center'}`}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search for fruits or vegetables..."
          className="flex-1 min-w-[180px] max-w-full sm:min-w-[280px] sm:max-w-[480px] border border-green-300 rounded-xl px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 text-lg bg-white text-green-900 placeholder:text-green-500 placeholder:opacity-100"
          style={{ WebkitTextFillColor: '#14532d' }}
        />
        <div className="relative min-w-[90px] max-w-[150px] sm:min-w-[110px] sm:max-w-[180px]">
          <button
            className="flex items-center gap-1 px-3 py-2 sm:px-4 rounded-full font-bold transition text-green-700 bg-white hover:bg-lime-100 border border-green-200 shadow w-full"
            aria-haspopup="listbox"
            aria-expanded="false"
            tabIndex={0}
            onClick={() => {
              const dropdown = document.getElementById('filter-dropdown');
              if (dropdown) dropdown.classList.toggle('hidden');
            }}
          >
            <FaFilter color="#16a34a" size={18} />
            <span className="inline">Filter</span>
          </button>
          <ul
            id="filter-dropdown"
            className="hidden absolute right-0 mt-2 w-36 sm:w-40 bg-white border border-green-200 rounded-xl shadow-lg z-50"
            tabIndex={-1}
            role="listbox"
          >
            <li
              className={`px-4 py-2 cursor-pointer hover:bg-lime-100 text-green-900 bg-white ${activeTab === 'fruit' ? 'font-bold bg-lime-50' : ''}`}
              onClick={() => { setActiveTab('fruit'); document.getElementById('filter-dropdown')?.classList.add('hidden'); }}
              role="option"
              aria-selected={activeTab === 'fruit'}
            >Fruits</li>
            <li
              className={`px-4 py-2 cursor-pointer hover:bg-lime-100 text-green-900 bg-white ${activeTab === 'vegetable' ? 'font-bold bg-lime-50' : ''}`}
              onClick={() => { setActiveTab('vegetable'); document.getElementById('filter-dropdown')?.classList.add('hidden'); }}
              role="option"
              aria-selected={activeTab === 'vegetable'}
            >Vegetables</li>
            <li
              className={`px-4 py-2 cursor-pointer hover:bg-lime-100 text-green-900 bg-white ${activeTab === 'all' ? 'font-bold bg-lime-50' : ''}`}
              onClick={() => { setActiveTab('all'); document.getElementById('filter-dropdown')?.classList.add('hidden'); }}
              role="option"
              aria-selected={activeTab === 'all'}
            >All</li>
          </ul>
        </div>
      </div>
    </header>
  );
}
