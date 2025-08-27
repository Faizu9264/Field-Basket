"use client";
import React, { useState, useEffect } from "react";
import ProductGrid from "../components/ProductGrid";
import { Product } from "../store/cartStore";
import { useProductPaginationStore } from "../store/productPaginationStore";

interface ProductBrowserProps {
  initialProducts: Product[];
  initialTotal: number;
  initialLimit: number;
  activeTab: 'fruit' | 'vegetable' | 'all';
  search: string;
}

const ProductBrowser: React.FC<ProductBrowserProps> = ({
  initialProducts,
  initialTotal,
  initialLimit,
  activeTab,
  search
}) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [limit] = useState(initialLimit);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { productPages, setProductPage } = useProductPaginationStore();

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
        const cacheKey = `page=1&limit=${limit}&search=${search.trim()}`;
        if (productPages[cacheKey]) {
          setProducts(productPages[cacheKey]);
          setFetching(false);
          return;
        }
        fetchProducts(1, search, cacheKey);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
    // eslint-disable-next-line
  }, [search]);

  useEffect(() => {
    if (page === 1 && search === "") return; // already loaded
    const cacheKey = `page=${page}&limit=${limit}&search=${search.trim()}`;
    if (productPages[cacheKey]) {
      setProducts(productPages[cacheKey]);
      setFetching(false);
      return;
    }
    fetchProducts(page, search, cacheKey);
    // eslint-disable-next-line
  }, [page]);

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
      if (err instanceof Error) {
        setError(err.message || "Failed to load products");
      } else {
        setError("Failed to load products");
      }
    } finally {
      setFetching(false);
    }
  };

  const fruits = products.filter(p => p.type?.toLowerCase() === "fruit");
  const vegetables = products.filter(p => p.type?.toLowerCase() === "vegetable");
  const totalPages = Math.ceil(total / limit);
  // Only show pagination if not searching, or if search results are more than one page
  const showPagination = (!search && totalPages > 1) || (search && total > limit);

  return (
    <div>
      {/* Search and filter UI removed; handled by Header */}
      {error && <div className="text-red-600 font-bold mb-4">{error}</div>}
      <ProductGrid
        fruits={activeTab === "vegetable" ? [] : fruits}
        vegetables={activeTab === "fruit" ? [] : vegetables}
        activeTab={activeTab}
        onAddToCart={() => {}}
        isMobile={false}
        fetching={fetching}
      />
      {showPagination && (
        <div className="flex gap-2 mt-6 justify-center">
          <button
            className="px-3 py-1 rounded bg-green-200 text-green-900 font-semibold disabled:opacity-50"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || fetching}
          >
            Previous
          </button>
          <span className="px-2 py-1 text-green-800 font-bold">Page {page} of {totalPages}</span>
          <button
            className="px-3 py-1 rounded bg-green-200 text-green-900 font-semibold disabled:opacity-50"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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
