import { supabase } from './supabaseClient';

export const productService = {
  getProducts: async (filters = {}) => {
    try {
      let query = supabase.from('products').select('*, categories(name)');

      if (filters.search) query = query.ilike('title', `%${filters.search}%`);
      if (filters.category_id) query = query.eq('category_id', filters.category_id);
      if (filters.featured !== undefined) query = query.eq('featured', !!filters.featured);
      if (filters.new_arrival !== undefined) query = query.eq('new_arrival', !!filters.new_arrival);
      
      const page = filters.page ? parseInt(filters.page) : 1;
      const limit = filters.limit ? parseInt(filters.limit) : 10;
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      query = query.range(from, to).order('created_at', { ascending: false });

      const { data, error } = await query;
      
      if (error) throw error;
      
      const mappedData = data.map(product => ({
        ...product,
        category: product.categories?.name || product.category_name || 'Uncategorized'
      }));
      
      return { success: true, data: { products: mappedData } };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  getProductById: async (id) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      const product = {
        ...data,
        category: data.categories?.name || data.category_name || 'Uncategorized'
      };
      
      return { success: true, data: { product } };
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },
  
  getFeaturedProducts: async (limit = 4) => {
    return await productService.getProducts({ featured: true, limit });
  },

  getNewArrivals: async (limit = 4) => {
    return await productService.getProducts({ new_arrival: true, limit });
  }
};
