
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '../types';
import { useProducts } from '../hooks/useProducts';

interface CartContextType {
  items: CartItem[];
  addToCart: (productId: string, packageId: string, isComboItem?: boolean) => void;
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
        setItems(parsedCart);
        console.log('Loaded cart from localStorage:', parsedCart);
      } catch (error) {
        console.error('Error parsing saved cart:', error);
        setItems([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
    console.log('Saved cart to localStorage:', items);
  }, [items]);

  const addToCart = (productId: string, packageId: string, isComboItem: boolean = false) => {
    console.log('Adding to cart:', { productId, packageId, isComboItem });
    
    setItems(prev => {
      const existingItem = prev.find(item => 
        item.productId === productId && item.packageId === packageId
      );
      
      if (existingItem) {
        console.log('Item already exists, updating quantity');
        return prev.map(item =>
          item.productId === productId && item.packageId === packageId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      console.log('Adding new item to cart');
      const newItem = { 
        productId, 
        packageId, 
        quantity: 1,
        isComboItem: isComboItem || false
      };
      return [...prev, newItem];
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
    const total = items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const pkg = product.packages.find(p => p.id === item.packageId);
        if (pkg) {
          const itemTotal = pkg.price * item.quantity;
          console.log(`Item ${item.productId}-${item.packageId}: ৳${pkg.price} x ${item.quantity} = ৳${itemTotal}`);
          return sum + itemTotal;
        }
      }
      
      // Fallback for combo packages - use a default price calculation
      // This handles cases where products from combo offers might not be found in regular products
      const fallbackPrice = 100; // You can adjust this or get it from somewhere else
      console.log(`Fallback pricing for ${item.productId}-${item.packageId}: ৳${fallbackPrice} x ${item.quantity}`);
      return sum + (fallbackPrice * item.quantity);
    }, 0);
    
    console.log('Cart total:', total);
    return total;
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
