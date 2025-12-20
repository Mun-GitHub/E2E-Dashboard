import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { PRODUCTS, type ProductId } from '../types';

interface ProductContextValue {
  selectedProduct: ProductId;
  setSelectedProduct: (product: ProductId) => void;
  productInfo: typeof PRODUCTS[number];
}

const ProductContext = createContext<ProductContextValue | null>(null);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [selectedProduct, setSelectedProductState] = useState<ProductId>('DAM');

  const setSelectedProduct = useCallback((product: ProductId) => {
    setSelectedProductState(product);
    // Optionally save to localStorage
    localStorage.setItem('selectedProduct', product);
  }, []);

  const productInfo = PRODUCTS.find(p => p.id === selectedProduct) || PRODUCTS[0];

  return (
    <ProductContext.Provider value={{ selectedProduct, setSelectedProduct, productInfo }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProduct() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
}

