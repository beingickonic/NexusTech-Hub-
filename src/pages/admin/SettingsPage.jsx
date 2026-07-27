import { useState, useEffect } from 'react';
import { Save, Store, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { adminService } from '../../services/adminService';
import { getImageUrl } from '../../utils/imageHelper';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    store_name: '',
    contact_email: '',
    contact_phone: '',
    currency: '',
    theme_primary_color: '#FF724C'
  });
  
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  
  const [logoPreview, setLogoPreview] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await adminService.getSettings();
        if (res.status === 'success') {
          const data = res.data;
          setSettings({
            store_name: data.store_name || '',
            contact_email: data.contact_email || '',
            contact_phone: data.contact_phone || '',
            currency: data.currency || '',
            theme_primary_color: data.theme_primary_color || '#FF724C'
          });
          if (data.logo_url) {
            setLogoPreview(getImageUrl(data.logo_url));
          }
          if (data.favicon_url) {
            setFaviconPreview(getImageUrl(data.favicon_url));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'logo') {
        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
      } else {
        setFaviconFile(file);
        setFaviconPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      Object.keys(settings).forEach(key => formData.append(key, settings[key]));
      
      if (logoFile) formData.append('logo', logoFile);
      if (faviconFile) formData.append('favicon', faviconFile);
      
      await adminService.updateSettings(formData);
      alert('Settings saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Platform Settings</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your store details, branding, and contact info.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-orange-500/30 disabled:opacity-70"
        >
          <Save size={18} /> {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-lg"><Store size={20} /></div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Store Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Store Name</label>
              <input type="text" name="store_name" value={settings.store_name} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Contact Email</label>
              <input type="email" name="contact_email" value={settings.contact_email} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Contact Phone</label>
              <input type="text" name="contact_phone" value={settings.contact_phone} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Default Currency</label>
              <select name="currency" value={settings.currency} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-all">
                <option value="KES">KES (Kenya Shilling)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="EUR">EUR (Euro)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Theme Primary Color</label>
              <input type="color" name="theme_primary_color" value={settings.theme_primary_color} onChange={handleChange} className="w-full h-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-1 px-2 text-slate-900 dark:text-white cursor-pointer" />
            </div>
          </div>
        </motion.div>

        {/* Branding & Media */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <div className="p-2 bg-orange-50 dark:bg-orange-500/10 text-orange-500 rounded-lg"><ImageIcon size={20} /></div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Branding & Media</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">Store Logo</label>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-900">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <span className="text-xs text-slate-400">No Logo</span>
                  )}
                </div>
                <div>
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} className="text-sm" />
                  <p className="mt-2 text-xs text-slate-500">Recommended: 200x50 PNG transparent</p>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">Favicon</label>
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-900">
                  {faviconPreview ? (
                    <img src={faviconPreview} alt="Favicon Preview" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-xs text-slate-400">No Fav</span>
                  )}
                </div>
                <div>
                  <input type="file" accept="image/png, image/x-icon" onChange={(e) => handleFileChange(e, 'favicon')} className="text-sm" />
                  <p className="mt-2 text-xs text-slate-500">Recommended: 32x32 ICO or PNG</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;
