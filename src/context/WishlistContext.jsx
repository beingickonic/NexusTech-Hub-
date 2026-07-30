/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import wishlistService from '../services/wishlistService';
import { useAuth } from '../auth/AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    if (user) {
      try {
        const res = await wishlistService.getWishlist();
        if (res.success) {
          const items = (res.data.wishlist || []).map(item => ({
            ...item,
            title: item.products?.title || 'Unknown Product',
            price: item.products?.price || 0,
            image_url: item.products?.image_url
          }));
          setWishlistItems(items);
        }
      } catch (error) {
        console.error("Failed to fetch wishlist", error);
      }
    } else {
      setWishlistItems([]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const addToWishlist = async (productId) => {
    if (!user) {
      toast.error("Please login to add items to your wishlist.");
      return false;
    }
    try {
      const res = await wishlistService.addToWishlist(productId);
      if (res.success) {
        await fetchWishlist();
        toast.success("Added to wishlist!");
        return true;
      }
    } catch (error) {
      console.error("Failed to add to wishlist", error);
      toast.error("Error adding item to wishlist.");
    }
    return false;
  };

  const removeFromWishlist = async (productId) => {
    if (!user) return;
    try {
      const res = await wishlistService.removeFromWishlist(productId);
      if (res.success) {
        await fetchWishlist();
        toast.success("Removed from wishlist");
      }
    } catch (error) {
      console.error("Failed to remove from wishlist", error);
      toast.error("Error removing item");
    }
  };

  const isWishlisted = (productId) => {
    return wishlistItems.some((item) => item.product_id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, loading, addToWishlist, removeFromWishlist, isWishlisted, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
