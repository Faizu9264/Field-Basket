import { create } from 'zustand';
import { Product } from './cartStore';

interface ProductPaginationState {
  productPages: { [key: string]: Product[] };
  setProductPage: (key: string, products: Product[]) => void;
  clearProductPages: () => void;
}

export const useProductPaginationStore = create<ProductPaginationState>((set) => ({
  productPages: {},
  setProductPage: (key, products) =>
    set((state) => ({
      productPages: { ...state.productPages, [key]: products }
    })),
  clearProductPages: () => set({ productPages: {} }),
}));
