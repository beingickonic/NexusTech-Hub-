import { supabase } from './supabaseClient';

const getCategories = async () => {
  try {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) throw error;
    return { success: true, data: { categories: data } };
  } catch (error) {
    console.error("Error fetching categories", error);
    return { success: false, message: "Network error", data: { categories: [] } };
  }
};

const categoryService = {
  getCategories,
};

export default categoryService;
