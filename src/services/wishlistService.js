import { supabase } from './supabaseClient';

const getUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
};

const addToWishlist = async (productId) => {
  try {
    const userId = await getUserId();
    if (!userId) throw new Error("Not authenticated");
    
    const { error } = await supabase.from('wishlist').insert({ user_id: userId, product_id: productId });
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const removeFromWishlist = async (productId) => {
  try {
    const userId = await getUserId();
    if (!userId) throw new Error("Not authenticated");
    
    const { error } = await supabase.from('wishlist').delete().eq('user_id', userId).eq('product_id', productId);
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const getWishlist = async () => {
  try {
    const userId = await getUserId();
    if (!userId) return { success: true, data: { wishlist: [] } };
    
    const { data, error } = await supabase.from('wishlist').select('*, products(*)').eq('user_id', userId);
    if (error) throw error;
    
    return { success: true, data: { wishlist: data } };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const wishlistService = {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
};

export default wishlistService;
