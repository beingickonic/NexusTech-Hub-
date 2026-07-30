import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import cartService from '../services/cartService';
import { useAuth } from '../auth/AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartSummary, setCartSummary] = useState({ subtotal: 0, tax: 0, shipping: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    if (user) {
      try {
        const res = await cartService.getCart();
        if (res.success) {
          const items = (res.data.cart_items || []).map(item => ({
            ...item,
            title: item.products?.title || 'Unknown Product',
            price: item.products?.price || 0,
            image_url: item.products?.image_url,
            subtotal: (item.products?.price || 0) * item.quantity
          }));
          setCartItems(items);
          
          let subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
          setCartSummary({ subtotal, tax: 0, shipping: 0, total: subtotal });
        }
      } catch (error) {
        console.error("Failed to fetch cart", error);
      }
    } else {
      setCartItems([]);
      setCartSummary({ subtotal: 0, tax: 0, shipping: 0, total: 0 });
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      toast.error("Please login to add items to cart.");
      return false;
    }
    try {
      const res = await cartService.addToCart(productId, quantity);
      if (res.success) {
        await fetchCart();
        toast.success("Added to cart!");
        return true;
      }
    } catch (error) {
      console.error("Failed to add to cart", error);
      toast.error("Error adding item to cart.");
    }
    return false;
  };

  const removeFromCart = async (productId) => {
    if (!user) return;
    try {
      const res = await cartService.removeFromCart(productId);
      if (res.success) {
        await fetchCart();
        toast.success("Item removed from cart");
      }
    } catch (error) {
      console.error("Failed to remove from cart", error);
      toast.error("Error removing item");
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!user) return;
    try {
      const res = await cartService.updateCart(productId, quantity);
      if (res.success) {
        await fetchCart();
      }
    } catch (error) {
      console.error("Failed to update cart quantity", error);
      toast.error("Failed to update quantity");
    }
  };

  const clearCartState = () => {
    setCartItems([]);
    setCartSummary({ subtotal: 0, tax: 0, shipping: 0, total: 0 });
  };

  return (
    <CartContext.Provider value={{ cartItems, cartSummary, loading, addToCart, removeFromCart, updateQuantity, fetchCart, clearCartState }}>
      {children}
    </CartContext.Provider>
  );
};
