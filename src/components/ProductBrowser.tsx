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
  const [total, setTotal] = useState(initialTotal);
  const [limit] = useState(initialLimit);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { productPages, setProductPage, clearProductPages } = useProductPaginationStore();
  const isFirstLoad = useRef(true);

  // Helper to fetch and cache products
  const fetchProducts = async (pageNum: number, searchTerm: string, cacheKey: string) => {
    setFetching(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: limit.toString(),
      });
      if (searchTerm.trim()) params.append("search", searchTerm.trim());
      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error(await res.text() || "API error");
      const data = await res.json();
      setProducts(data.products || []);
      setProductPage(cacheKey, data.products || []);
      setTotal(data.total || 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setFetching(false);
    }
  };

  // On first mount, use SSR data for page 1 only, and always set cache for page 1
  useEffect(() => {
    if (page === 1 && search === "") {
      setProducts(initialProducts);
      setTotal(initialTotal);
      setProductPage(`page=1&limit=${limit}&search=`, initialProducts);
      setFetching(false);
    }
    isFirstLoad.current = false;
    // eslint-disable-next-line
  }, []);

  // Handle search: reset to page 1, clear cache, fetch fresh
  useEffect(() => {
    if (search !== "") {
      setPage(1);
      clearProductPages();
      setFetching(true);
      const handler = setTimeout(() => {
        const cacheKey = `page=1&limit=${limit}&search=${search.trim()}`;
        fetchProducts(1, search, cacheKey);
      }, 400);
      return () => clearTimeout(handler);
    }
    // eslint-disable-next-line
  }, [search]);

  // Handle page changes (and also page 1 after first mount)
  useEffect(() => {
    const cacheKey = `page=${page}&limit=${limit}&search=${search.trim()}`;
    // Use cache if available
    if (productPages[cacheKey]) {
      setProducts(productPages[cacheKey]);
      setFetching(false);
      return;
    }
    // If SSR initial page, skip (handled by first mount effect)
    if (isFirstLoad.current && page === 1 && search === "") return;
    // Otherwise fetch
    fetchProducts(page, search, cacheKey);
    // eslint-disable-next-line
  }, [page, search, initialProducts, initialTotal]);

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
      />
      {showPagination && (
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
