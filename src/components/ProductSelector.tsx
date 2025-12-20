import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { PRODUCTS, type ProductId } from '../types';
import { useProduct } from '../context/ProductContext';

export function ProductSelector() {
  const { selectedProduct, setSelectedProduct, productInfo } = useProduct();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (productId: ProductId) => {
    setSelectedProduct(productId);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1a1a1f] transition-colors"
      >
        <img
          src={productInfo.icon}
          alt={productInfo.name}
          className="w-8 h-8 rounded-lg object-contain"
        />
        <div className="text-left">
          <div className="text-sm font-medium text-white">{productInfo.name}</div>
          <div className="text-xs text-[#71717a]">E2E Dashboard</div>
        </div>
        <ChevronDown
          size={16}
          className={`text-[#71717a] transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-[#18181b] border border-[#27272a] rounded-xl shadow-xl z-50 overflow-hidden animate-fadeIn">
          <div className="p-2">
            <div className="text-xs text-[#71717a] px-3 py-2 font-medium">Select Product</div>
            {PRODUCTS.map((product) => (
              <button
                key={product.id}
                onClick={() => handleSelect(product.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  selectedProduct === product.id
                    ? 'bg-[#27272a]'
                    : 'hover:bg-[#1a1a1f]'
                }`}
              >
                <img
                  src={product.icon}
                  alt={product.name}
                  className="w-8 h-8 rounded-lg object-contain"
                />
                <span className="text-sm text-white flex-1 text-left">{product.name}</span>
                {selectedProduct === product.id && (
                  <Check size={16} className="text-green-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

