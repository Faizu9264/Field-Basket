"use client";
import React, { useState, useEffect, useRef } from "react";
import ProductGrid from "../components/ProductGrid";
import { Product } from "../store/cartStore";
import { useProductPaginationStore } from "../store/productPaginationStore";

interface ProductBrowserProps {
  initialProducts: Product[];
  initialTotal: number;
  initialLimit: number;
  activeTab: 'fruit' | 'vegetable' | 'all';
  search: string;
  page: number;
  setPage: (page: number) => void;
  isMobile: boolean;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

const ProductBrowser: React.FC<ProductBrowserProps> = ({
  initialProducts,
  initialTotal,
  initialLimit,
  activeTab,
  search,
  page,
  setPage,
  isMobile,
  onAddToCart,
  onBuyNow
}) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const [total, setTotal] = useState(initialTotal);
  const [limit] = useState(initialLimit);
  const [fetching, setFetching] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [pendingFilterTab, setPendingFilterTab] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { productPages, setProductPage, clearProductPages } = useProductPaginationStore();
  const isFirstLoad = useRef(true);

  // Helper to fetch and cache products
  // AbortController for request cancellation
  const abortRef = useRef<AbortController | null>(null);
  // Helper to fetch and cache products
  const fetchProducts = async (pageNum: number, searchTerm: string, cacheKey: string, tab: string = activeTab) => {
    setFetching(true);
    setShowSkeleton(true);
    setProducts([]); // Clear products so skeleton always shows
    setError(null);
    setHasFetched(false);
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: limit.toString(),
      });
      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim());
        // Do NOT send type param when searching
      } else if (tab !== "all" && tab !== "") {
        // Only send type param if not searching and not 'all'
        params.append("type", tab);
      }
      const res = await fetch(`/api/products?${params.toString()}`, { signal: controller.signal });
      if (!res.ok) throw new Error(await res.text() || "API error");
      const data = await res.json();
  setProducts(data.products || []);
  setProductPage(cacheKey, data.products || []);
  setTotal(data.total || 0);
  setHasFetched(true);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "name" in err && (err as { name: string }).name === "AbortError") return;
  setError(err instanceof Error ? err.message : "Failed to load products");
  setHasFetched(true);
    } finally {
      setFetching(false);
      setShowSkeleton(false);
    }
  };
  // Debounced search effect (700ms)
  useEffect(() => {
    if (search !== "") {
      setPage(1);
      clearProductPages();
      setShowSkeleton(true);
      setProducts([]);
      const handler = setTimeout(() => {
        setFetchTrigger(f => f + 1);
      }, 700);
      return () => clearTimeout(handler);
    }
    // eslint-disable-next-line
  }, [search, activeTab]);

  // Refetch when tab changes (filter changes)
  useEffect(() => {
    if (search === "") {
      setPage(1);
      clearProductPages();
      setShowSkeleton(true);
      setProducts([]);
      setPendingFilterTab(true);
      setFetchTrigger(f => f + 1);
    }
    // eslint-disable-next-line
  }, [activeTab]);

  // Handle page changes (and also page 1 after first mount)
  useEffect(() => {
    const cacheKey = `page=${page}&limit=${limit}&search=${search.trim()}&type=${activeTab}`;
    // Use cache if available
    setShowSkeleton(true);
    setProducts([]);
    if (productPages[cacheKey]) {
      setProducts(productPages[cacheKey]);
      setFetching(false);
      setHasFetched(true);
      setTimeout(() => setShowSkeleton(false), 300);
      return;
    }
    // If SSR initial page, skip (handled by first mount effect)
    if (isFirstLoad.current && page === 1 && search === "" && activeTab === "all") return;
    // Otherwise fetch
    setFetchTrigger(f => f + 1);
    // eslint-disable-next-line
  }, [page, search, activeTab, initialProducts, initialTotal]);

  // Effect to actually fetch products when fetchTrigger changes
  useEffect(() => {
    const cacheKey = `page=${page}&limit=${limit}&search=${search.trim()}&type=${activeTab}`;
    // If SSR initial page, skip
    if (isFirstLoad.current && page === 1 && search === "" && activeTab === "all") return;
    fetchProducts(page, search, cacheKey, activeTab);
    // eslint-disable-next-line
  }, [fetchTrigger]);

  const fruits = products.filter(p => p.type?.toLowerCase() === "fruit");
  const vegetables = products.filter(p => p.type?.toLowerCase() === "vegetable");
  const totalPages = Math.ceil(total / limit);
  const showPagination = totalPages > 1;

  return (
    <div>
      {error && <div className="text-red-600 font-bold mb-4">{error}</div>}
      <ProductGrid
        fruits={activeTab === "vegetable" ? [] : fruits}
        vegetables={activeTab === "fruit" ? [] : vegetables}
        activeTab={activeTab}
        onAddToCart={onAddToCart}
        onBuyNow={onBuyNow}
        isMobile={isMobile}
        fetching={fetching}
        forceShowSkeleton={showSkeleton}
        hasFetched={hasFetched}
      />
      {/* Show spinner over pagination if loading a new page */}
      {showSkeleton && (
        <div className="flex justify-center items-center py-8">
          <svg className="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        </div>
      )}
      {/* Hide pagination while loading/filtering, only show when not loading */}
      {showPagination && !showSkeleton && (
        <div className="flex gap-2 mt-6 justify-center">
          <button
            className="px-3 py-1 rounded bg-green-200 text-green-900 font-semibold disabled:opacity-50"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1 || fetching}
          >
            Previous
          </button>
          <span className="px-2 py-1 text-green-800 font-bold">Page {page} of {totalPages}</span>
          <button
            className="px-3 py-1 rounded bg-green-200 text-green-900 font-semibold disabled:opacity-50"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages || fetching}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductBrowser;
