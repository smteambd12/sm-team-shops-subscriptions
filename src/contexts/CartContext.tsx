
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '../types';
import { useProducts } from '../hooks/useProducts';

interface CartContextType {
  items: CartItem[];
  addToCart: (productId: string, packageId: string) => void;
  removeFromCart: (productId: string, packageId: string) => void;
  updateQuantity: (productId: string, packageId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { products } = useProducts();

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (productId: string, packageId: string) => {
    setItems(prev => {
      const existingItem = prev.find(item => 
        item.productId === productId && item.packageId === packageId
      );
      
      if (existingItem) {
        return prev.map(item =>
          item.productId === productId && item.packageId === packageId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...prev, { productId, packageId, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string, packageId: string) => {
    setItems(prev => prev.filter(item => 
      !(item.productId === productId && item.packageId === packageId)
    ));
  };

  const updateQuantity = (productId: string, packageId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, packageId);
      return;
    }
    
    setItems(prev => prev.map(item =>
      item.productId === productId && item.packageId === packageId
        ? { ...item, quantity }
        : item
    ));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getCartTotal = () => {
    return items.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      const pkg = product?.packages.find(p => p.id === item.packageId);
      return total + (pkg?.price || 0) * item.quantity;
    }, 0);
  };

  const getCartItemsCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartItemsCount
    }}>
      {children}
    </CartContext.Provider>
  );
};
