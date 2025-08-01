
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
      try {
        const parsedCart = JSON.parse(savedCart);
        console.log('Loading cart from localStorage:', parsedCart);
        setItems(parsedCart);
      } catch (error) {
        console.error('Error parsing saved cart:', error);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  useEffect(() => {
    console.log('Saving cart to localStorage:', items);
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (productId: string, packageId: string) => {
    console.log('Adding to cart:', { productId, packageId });
    
    setItems(prev => {
      const existingItem = prev.find(item => 
        item.productId === productId && item.packageId === packageId
      );
      
      if (existingItem) {
        console.log('Item exists, updating quantity');
        return prev.map(item =>
          item.productId === productId && item.packageId === packageId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      console.log('Adding new item to cart');
      const newItem = { productId, packageId, quantity: 1 };
      return [...prev, newItem];
    });
  };

  const removeFromCart = (productId: string, packageId: string) => {
    console.log('Removing from cart:', { productId, packageId });
    setItems(prev => prev.filter(item => 
      !(item.productId === productId && item.packageId === packageId)
    ));
  };

  const updateQuantity = (productId: string, packageId: string, quantity: number) => {
    console.log('Updating quantity:', { productId, packageId, quantity });
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
    console.log('Clearing cart');
    setItems([]);
  };

  const getCartTotal = () => {
    const total = items.reduce((total, item) => {
      console.log('Calculating total for item:', item);
      const product = products.find(p => {
        console.log('Comparing product:', p.id, 'with item productId:', item.productId);
        return p.id === item.productId;
      });
      
      if (!product) {
        console.log('Product not found for item:', item);
        return total;
      }
      
      const pkg = product.packages.find(p => {
        console.log('Comparing package:', p.id, 'with item packageId:', item.packageId);
        return p.id === item.packageId;
      });
      
      if (!pkg) {
        console.log('Package not found for item:', item);
        return total;
      }
      
      const itemTotal = pkg.price * item.quantity;
      console.log('Item total:', itemTotal);
      return total + itemTotal;
    }, 0);
    
    console.log('Final cart total:', total);
    return total;
  };

  const getCartItemsCount = () => {
    const count = items.reduce((count, item) => count + item.quantity, 0);
    console.log('Cart items count:', count);
    return count;
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
