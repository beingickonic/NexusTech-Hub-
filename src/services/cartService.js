import { supabase } from './supabaseClient';

const getUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
};

const addToCart = async (productId, quantity = 1) => {
  try {
    const userId = await getUserId();
    if (!userId) throw new Error("Not authenticated");
    
    const { data: existing } = await supabase.from('cart_items').select('*').eq('user_id', userId).eq('product_id', productId).maybeSingle();
    
    if (existing) {
      const { error } = await supabase.from('cart_items').update({ quantity: existing.quantity + quantity }).eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('cart_items').insert({ user_id: userId, product_id: productId, quantity });
      if (error) throw error;
    }
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const removeFromCart = async (productId) => {
  try {
    const userId = await getUserId();
    if (!userId) throw new Error("Not authenticated");
    
    const { error } = await supabase.from('cart_items').delete().eq('user_id', userId).eq('product_id', productId);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const updateCart = async (productId, quantity) => {
  try {
    const userId = await getUserId();
    if (!userId) throw new Error("Not authenticated");
    
    const { error } = await supabase.from('cart_items').update({ quantity }).eq('user_id', userId).eq('product_id', productId);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const getCart = async () => {
  try {
    const userId = await getUserId();
    if (!userId) return { success: true, data: { cart_items: [] } };
    
    const { data: items, error } = await supabase.from('cart_items').select('*, products(*)').eq('user_id', userId);
    if (error) throw error;
    return { success: true, data: { cart_items: items || [] } };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const cartService = {
  addToCart,
  removeFromCart,
  updateCart,
  getCart,
};

export default cartService;
