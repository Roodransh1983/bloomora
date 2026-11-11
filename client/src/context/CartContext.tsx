import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  isLoading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function getSessionKey(): string {
  let key = localStorage.getItem('bloomora_session');
  if (!key) {
    key = `session_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    localStorage.setItem('bloomora_session', key);
  }
  return key;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const sessionKey = user ? undefined : getSessionKey();
      const data = await api.cart.get(sessionKey) as { items: CartItem[] } | CartItem[];
      const cartItems = Array.isArray(data) ? data : (data as { items: CartItem[] }).items || [];
      setItems(cartItems);
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId: string, quantity = 1) => {
    const sessionKey = user ? undefined : getSessionKey();
    await api.cart.addItem({ productId, quantity }, sessionKey);
    await refreshCart();
  };

  const removeFromCart = async (itemId: string) => {
    await api.cart.removeItem(itemId);
    await refreshCart();
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }
    await api.cart.updateItem(itemId, quantity);
    await refreshCart();
  };

  const clearCart = async () => {
    await api.cart.clear();
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{ items, itemCount, total, isLoading, addToCart, removeFromCart, updateQuantity, clearCart, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
