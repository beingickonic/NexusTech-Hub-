import { supabase } from './supabaseClient';

/**
 * Fetch approved reviews for a product, including reviewer profile info.
 */
export const getProductReviews = async (productId) => {
  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .select(`
        id, rating, title, body, created_at, approved, user_id,
        profiles:user_id (full_name, avatar_url)
      `)
      .eq('product_id', productId)
      .eq('approved', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, data: [], message: error.message };
  }
};

/**
 * Get the current user's review for a product (if any).
 */
export const getMyReview = async (productId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, data: null };

    const { data, error } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, data: null, message: error.message };
  }
};

/**
 * Submit a new product review.
 */
export const submitReview = async (productId, { rating, title, body }) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'You must be logged in to submit a review.' };

    const { data, error } = await supabase
      .from('product_reviews')
      .insert({
        product_id: productId,
        user_id: user.id,
        rating: Number(rating),
        title: title?.trim() || null,
        body: body?.trim() || null,
        approved: true,
      })
      .select()
      .single();

    if (error) {
      // Unique violation — user already reviewed
      if (error.code === '23505') {
        return { success: false, message: 'You have already reviewed this product. Edit your existing review.' };
      }
      throw error;
    }
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

/**
 * Update the current user's review.
 */
export const updateReview = async (reviewId, { rating, title, body }) => {
  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .update({
        rating: Number(rating),
        title: title?.trim() || null,
        body: body?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

/**
 * Delete a review (own review or admin).
 */
export const deleteReview = async (reviewId) => {
  try {
    const { error } = await supabase
      .from('product_reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

/**
 * Admin: get all reviews (including unapproved).
 */
export const getAllReviews = async ({ page = 1, limit = 20 } = {}) => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await supabase
      .from('product_reviews')
      .select(`
        id, rating, title, body, approved, created_at, product_id, user_id,
        profiles:user_id (full_name, email),
        products:product_id (title)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return { success: true, data: data || [], total: count || 0 };
  } catch (error) {
    return { success: false, data: [], total: 0, message: error.message };
  }
};

/**
 * Admin: approve or hide a review.
 */
export const setReviewApproval = async (reviewId, approved) => {
  try {
    const { error } = await supabase
      .from('product_reviews')
      .update({ approved })
      .eq('id', reviewId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const reviewService = {
  getProductReviews,
  getMyReview,
  submitReview,
  updateReview,
  deleteReview,
  getAllReviews,
  setReviewApproval,
};

export default reviewService;
