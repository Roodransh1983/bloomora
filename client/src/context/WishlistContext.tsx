import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlistIds: Set<string>;
  wishlistCount: number;
  isWishlisted: (productId: string) => boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistIds(new Set());
      return;
    }
    try {
      const data = await api.wishlist.get() as { items?: Array<{ productId: string }> } | Array<{ productId: string }>;
      const items = Array.isArray(data) ? data : (data as { items?: Array<{ productId: string }> }).items || [];
      setWishlistIds(new Set(items.map((i) => i.productId)));
    } catch {
      setWishlistIds(new Set());
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isWishlisted = (productId: string) => wishlistIds.has(productId);

  const addToWishlist = async (productId: string) => {
    if (!user) return;
    await api.wishlist.add(productId);
    setWishlistIds((prev) => new Set([...prev, productId]));
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;
    await api.wishlist.remove(productId);
    setWishlistIds((prev) => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
  };

  const toggleWishlist = async (productId: string) => {
    if (isWishlisted(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  return (
    <WishlistContext.Provider
      value={{ wishlistIds, wishlistCount: wishlistIds.size, isWishlisted, addToWishlist, removeFromWishlist, toggleWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
