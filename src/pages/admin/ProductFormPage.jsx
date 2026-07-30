import { useState, useEffect, useRef } from 'react';
import { adminService } from '../../services/adminService';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Image as ImageIcon, UploadCloud, X, Link } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import SmartImage from '../../components/SmartImage';
import { getImageUrl } from '../../utils/imageHelper';
import { supabase } from '../../services/supabaseClient';

// Fallback static list in case DB fetch fails
const FALLBACK_CATEGORIES = [
  { id: 1, name: 'Laptops & Notebooks' },
  { id: 2, name: 'Smartphones & Tablets' },
  { id: 3, name: 'Desktops & Workstations' },
  { id: 4, name: 'Networking' },
  { id: 5, name: 'Accessories' },
  { id: 6, name: 'Software & Licenses' },
  { id: 7, name: 'Storage' },
  { id: 8, name: 'Printers & Scanners' },
  { id: 9, name: 'Gaming' },
  { id: 10, name: 'Monitors & Displays' }
];

const ProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    sku: '',
    price: '',
    old_price: '',
    stock: '',
    short_desc: '',
    description: '',
    category_id: 1,
    availability: true,
    features: '',
    featured: false,
    new_arrival: false,
    image_url: ''
  });
  
  const [imageSourceType, setImageSourceType] = useState('upload'); // 'upload' or 'url'
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch categories from DB
  useEffect(() => {
    supabase.from('categories').select('id, name').order('name')
      .then(({ data }) => {
        if (data && data.length > 0) setCategories(data);
      })
      .catch(() => { /* keep fallback */ })
      .finally(() => setCategoriesLoading(false));
  }, []);

  useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          const res = await adminService.getProductById(id);
          if (res.status === 'success') {
            const product = res.data;
            if (product) {
              setFormData({
                id: product.id,
                title: product.title,
                brand: product.brand || '',
                sku: product.sku || '',
                price: product.price,
                old_price: product.old_price || '',
                stock: product.stock,
                short_desc: product.short_desc || '',
                description: product.description || '',
                category_id: product.category_id || 1,
                availability: product.availability ?? true,
                features: product.features || '',
                featured: product.featured ?? false,
                new_arrival: product.new_arrival ?? false,
                image_url: product.image_url && product.image_url.startsWith('http') ? product.image_url : ''
              });
              
              if (product.image_url) {
                if (product.image_url.startsWith('http')) {
                  setImageSourceType('url');
                } else {
                  setExistingImages([getImageUrl(product.image_url)]);
                }
              }
            }
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchProduct();
    }
  }, [id, isEditMode]);

  const validateUrl = (url) => {
    if (!url) {
      setUrlError('');
      return true;
    }
    
    // Check if the URL is valid format at all
    try {
      new URL(url);
    } catch (_) {
      setUrlError('Please enter a valid HTTP/HTTPS URL.');
      return false;
    }

    // Must have a valid image extension or match typical image CDNs
    const hasImageExtension = /\.(jpeg|jpg|gif|png|webp|svg|psd|bmp|tiff)(\?.*)?$/i.test(url);
    const isImageCdn = url.includes('images.unsplash.com') || url.includes('i.dell.com/is/image/');

    if (!hasImageExtension && !isImageCdn) {
      setUrlError('Invalid Image URL. The link does not appear to be an image file. Please provide a direct link ending in .jpg, .png, .webp, etc.');
      return false;
    }

    setUrlError('');
    return true;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'image_url') {
      validateUrl(value);
    }

    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  // Drag and Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (imageSourceType !== 'upload') return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files) => {
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    const newFilesWithPreview = validFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }));

    setImageFiles(prev => [...prev, ...newFilesWithPreview]);
  };

  const removeFile = (index) => {
    setImageFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  useEffect(() => {
    return () => {
      imageFiles.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, [imageFiles]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (imageSourceType === 'url' && urlError) {
      alert("Please fix the image URL before saving.");
      return;
    }

    setIsSaving(true);
    
    try {
      const dataToSubmit = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          if (key === 'image_url' && imageSourceType !== 'url') return;
          // Convert boolean values to strings for FormData
          if (typeof formData[key] === 'boolean') {
            dataToSubmit.append(key, formData[key] ? 'true' : 'false');
          } else {
            dataToSubmit.append(key, formData[key]);
          }
        }
      });
      
      if (imageSourceType === 'upload') {
        if (imageFiles.length > 0) {
          dataToSubmit.append('image', imageFiles[0]);
        }
      }

      if (isEditMode) {
        await adminService.updateProduct(dataToSubmit);
      } else {
        await adminService.createProduct(dataToSubmit);
      }
      navigate('/admin/products');
    } catch (err) {
      console.error("ProductFormPage Save Error:", err);
      const exactError = err?.message || err?.response?.data?.message || err?.data?.error || JSON.stringify(err) || "Unknown error";
      alert(`Error saving product: ${exactError}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Preview Data Object
  const previewProduct = {
    id: formData.id || 999,
    title: formData.title || 'Product Name',
    category: formData.category_id == 1 ? 'Laptops' : 'Gadgets',
    price: parseFloat(formData.price) || 0,
    oldPrice: formData.old_price ? parseFloat(formData.old_price) : null,
    rating: 4.5,
    reviews: 120,
    image_url: imageSourceType === 'url' && formData.image_url 
      ? (!urlError ? formData.image_url : '') 
      : (imageFiles.length > 0 ? imageFiles[0].preview : (existingImages.length > 0 ? existingImages[0] : null)),
    isSale: !!formData.old_price,
    isNew: !!formData.new_arrival
  };
  
  if (formData.old_price) {
    previewProduct.oldPrice = parseFloat(formData.old_price);
  }

  return (
    <div className="animate-fade-in max-w-7xl mx-auto pb-12">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/products')} className="p-2 text-nexus-textSecondary hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {isEditMode ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-nexus-textSecondary dark:text-nexus-textSecondary">Fill in the product details, features, and imagery.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Main Info Column */}
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-nexus-border shadow-sm p-6 sm:p-8">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Basic Information</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-nexus-textSecondary mb-2">Product Name *</label>
                  <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-slate-50 dark:bg-nexus-surface border border-slate-200 dark:border-nexus-border rounded-lg py-2.5 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-all" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-nexus-textSecondary mb-2">Category *</label>
                    <select required name="category_id" value={formData.category_id} onChange={handleChange} disabled={categoriesLoading} className="w-full bg-slate-50 dark:bg-nexus-surface border border-slate-200 dark:border-nexus-border rounded-lg py-2.5 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-all disabled:opacity-60">
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-nexus-textSecondary mb-2">Brand</label>
                    <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full bg-slate-50 dark:bg-nexus-surface border border-slate-200 dark:border-nexus-border rounded-lg py-2.5 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-nexus-textSecondary mb-2">Short Description</label>
                  <textarea name="short_desc" value={formData.short_desc} onChange={handleChange} rows="2" className="w-full bg-slate-50 dark:bg-nexus-surface border border-slate-200 dark:border-nexus-border rounded-lg py-2.5 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-all"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-nexus-textSecondary mb-2">Full Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows="5" className="w-full bg-slate-50 dark:bg-nexus-surface border border-slate-200 dark:border-nexus-border rounded-lg py-2.5 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-all"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-nexus-textSecondary mb-2">Features (comma or newline separated)</label>
                  <textarea name="features" value={formData.features} onChange={handleChange} rows="4" placeholder="e.g. 4K Resolution, 120Hz Refresh Rate, HDR10" className="w-full bg-slate-50 dark:bg-nexus-surface border border-slate-200 dark:border-nexus-border rounded-lg py-2.5 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-all"></textarea>
                </div>
              </div>
            </div>

            {/* Media Upload */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-nexus-border shadow-sm p-6 sm:p-8">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Product Image Source</h2>
              
              <div className="flex gap-4 mb-6">
                <label className={`flex items-center gap-2 cursor-pointer p-4 border rounded-xl flex-1 transition-all ${imageSourceType === 'upload' ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-500/10' : 'border-slate-200 dark:border-nexus-border'}`}>
                  <input type="radio" name="imageSource" checked={imageSourceType === 'upload'} onChange={() => setImageSourceType('upload')} className="hidden" />
                  <UploadCloud size={20} className={imageSourceType === 'upload' ? 'text-orange-500' : 'text-nexus-textSecondary'} />
                  <span className={`font-medium ${imageSourceType === 'upload' ? 'text-orange-700 dark:text-orange-400' : 'text-slate-700 dark:text-nexus-textSecondary'}`}>Upload File</span>
                </label>
                <label className={`flex items-center gap-2 cursor-pointer p-4 border rounded-xl flex-1 transition-all ${imageSourceType === 'url' ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-500/10' : 'border-slate-200 dark:border-nexus-border'}`}>
                  <input type="radio" name="imageSource" checked={imageSourceType === 'url'} onChange={() => setImageSourceType('url')} className="hidden" />
                  <Link size={20} className={imageSourceType === 'url' ? 'text-orange-500' : 'text-nexus-textSecondary'} />
                  <span className={`font-medium ${imageSourceType === 'url' ? 'text-orange-700 dark:text-orange-400' : 'text-slate-700 dark:text-nexus-textSecondary'}`}>Image URL</span>
                </label>
              </div>

              {imageSourceType === 'upload' ? (
                <>
                  <div 
                    className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-colors cursor-pointer ${isDragOver ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-500/10' : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-nexus-surface/50 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                    />
                    <div className="w-16 h-16 mb-4 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-500 flex items-center justify-center">
                      <UploadCloud size={28} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Click to upload or drag and drop</h3>
                    <p className="text-sm text-nexus-textSecondary dark:text-nexus-textSecondary">SVG, PNG, JPG or GIF</p>
                  </div>

                  {(imageFiles.length > 0 || existingImages.length > 0) && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-slate-700 dark:text-nexus-textSecondary mb-3">Preview</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {existingImages.map((src, index) => (
                          <div key={`existing-${index}`} className="relative aspect-square rounded-xl border border-slate-200 dark:border-nexus-border overflow-hidden group">
                            <SmartImage src={src} className="w-full h-full" iconClassName="w-4 h-4" />
                            <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded z-20">Existing</div>
                          </div>
                        ))}
                        {imageFiles.map((file, index) => (
                          <div key={`new-${index}`} className="relative aspect-square rounded-xl border border-slate-200 dark:border-nexus-border overflow-hidden group">
                            <SmartImage src={file.preview} className="w-full h-full" iconClassName="w-4 h-4" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                              <button type="button" onClick={(e) => { e.stopPropagation(); removeFile(index); }} className="w-8 h-8 bg-white text-red-500 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors">
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-nexus-textSecondary">Direct Image URL</label>
                  <input 
                    type="url" 
                    name="image_url" 
                    placeholder="https://example.com/image.jpg"
                    value={formData.image_url} 
                    onChange={handleChange} 
                    className={`w-full bg-slate-50 dark:bg-nexus-surface border ${urlError ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-200 dark:border-nexus-border focus:ring-orange-500/50'} rounded-lg py-2.5 px-4 text-slate-900 dark:text-white focus:ring-2 outline-none transition-all`}
                  />
                  {urlError && <p className="text-red-500 text-sm mt-1">{urlError}</p>}
                  {formData.image_url && !urlError && (
                    <div className="mt-4 p-4 border border-slate-200 dark:border-nexus-border rounded-xl bg-slate-50 dark:bg-nexus-surface/50">
                      <p className="text-xs text-nexus-textSecondary mb-2">URL Preview:</p>
                      <div className="h-40 relative rounded-lg overflow-hidden border border-slate-200 dark:border-nexus-border">
                        <SmartImage src={formData.image_url} className="w-full h-full" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            {/* Live Preview Card */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-nexus-border shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <ImageIcon size={18} className="text-orange-500" />
                Live Preview
              </h2>
              <div className="pointer-events-none">
                <ProductCard product={previewProduct} />
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-nexus-border shadow-sm p-6 sm:p-8">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Pricing & Inventory</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-nexus-textSecondary mb-2">Regular Price (Ksh) *</label>
                  <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="w-full bg-slate-50 dark:bg-nexus-surface border border-slate-200 dark:border-nexus-border rounded-lg py-2.5 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-nexus-textSecondary mb-2">Sale Price (Ksh)</label>
                  <input type="number" step="0.01" name="old_price" value={formData.old_price} onChange={handleChange} className="w-full bg-slate-50 dark:bg-nexus-surface border border-slate-200 dark:border-nexus-border rounded-lg py-2.5 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-nexus-textSecondary mb-2">SKU (Stock Keeping Unit)</label>
                  <input type="text" name="sku" value={formData.sku} onChange={handleChange} className="w-full bg-slate-50 dark:bg-nexus-surface border border-slate-200 dark:border-nexus-border rounded-lg py-2.5 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-nexus-textSecondary mb-2">Stock Quantity *</label>
                  <input required type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full bg-slate-50 dark:bg-nexus-surface border border-slate-200 dark:border-nexus-border rounded-lg py-2.5 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-all" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-nexus-border shadow-sm p-6 sm:p-8">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Status & Visibility</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-nexus-textSecondary mb-2">Product Status</label>
                  <select name="availability" value={formData.availability} onChange={handleChange} className="w-full bg-slate-50 dark:bg-nexus-surface border border-slate-200 dark:border-nexus-border rounded-lg py-2.5 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-all">
                    <option value={true}>Active</option>
                    <option value={false}>Draft</option>
                  </select>
                </div>
                
                <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-nexus-border rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <input type="checkbox" name="featured" checked={!!formData.featured} onChange={handleChange} className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500 border-slate-300" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white text-sm">Featured Product</p>
                    <p className="text-xs text-nexus-textSecondary">Show on homepage featured section</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-nexus-border rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <input type="checkbox" name="new_arrival" checked={!!formData.new_arrival} onChange={handleChange} className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500 border-slate-300" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white text-sm">New Arrival</p>
                    <p className="text-xs text-nexus-textSecondary">Show "New" badge and in arrivals section</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

        </div>

        <div className="flex justify-end gap-4 sticky bottom-6 z-10 bg-white/80 dark:bg-nexus-surface/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-nexus-border shadow-lg">
          <button type="button" onClick={() => navigate('/admin/products')} className="px-6 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-medium rounded-xl transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={isSaving || (imageSourceType === 'url' && !!urlError)} className="flex items-center gap-2 px-8 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-orange-500/30 disabled:opacity-70 disabled:hover:bg-orange-500">
            <Save size={18} />
            {isSaving ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductFormPage;
