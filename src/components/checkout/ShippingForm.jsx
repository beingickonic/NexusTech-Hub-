import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import authService from '../../auth/authService';

const ShippingForm = ({ formData, setFormData }) => {
  const { user, updateUser } = useAuth();
  
  const hasSavedAddress = user?.address && user?.city && user?.phone;
  const [isEditing, setIsEditing] = useState(!hasSavedAddress);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (hasSavedAddress && !isEditing) {
      setFormData(prev => ({
        ...prev,
        fullName: user.full_name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        postalCode: user.postal_code || ''
      }));
    }
  }, [hasSavedAddress, isEditing, user, setFormData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city) {
      alert("Please fill all required fields.");
      return;
    }
    
    setIsSaving(true);
    const updates = {
      full_name: formData.fullName,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      postal_code: formData.postalCode
    };
    
    const res = await authService.updateProfile(user.id, updates);
    if (res.success) {
      updateUser(updates);
      setIsEditing(false);
    } else {
      alert("Failed to save address. Please try again.");
    }
    setIsSaving(false);
  };

  if (!isEditing && hasSavedAddress) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Shipping Information</h3>
          <button 
            onClick={() => setIsEditing(true)}
            className="text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
          >
            Edit Address
          </button>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-nexus-border/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            <div>
              <p className="text-xs font-semibold text-nexus-textSecondary dark:text-nexus-textSecondary uppercase tracking-wider mb-1">Name</p>
              <p className="text-slate-900 dark:text-white font-medium">{user.full_name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-nexus-textSecondary dark:text-nexus-textSecondary uppercase tracking-wider mb-1">Phone</p>
              <p className="text-slate-900 dark:text-white font-medium">{user.phone}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-nexus-textSecondary dark:text-nexus-textSecondary uppercase tracking-wider mb-1">Email</p>
              <p className="text-slate-900 dark:text-white font-medium">{user.email}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs font-semibold text-nexus-textSecondary dark:text-nexus-textSecondary uppercase tracking-wider mb-1">Delivery Address</p>
              <p className="text-slate-900 dark:text-white font-medium">
                {user.address}, {user.city} {user.postal_code ? `- ${user.postal_code}` : ''}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
        {hasSavedAddress ? 'Edit Shipping Information' : 'Shipping Information'}
      </h3>
      
      {!hasSavedAddress && (
        <p className="text-sm text-nexus-textSecondary dark:text-nexus-textSecondary mb-4">
          Please complete your profile details to proceed with checkout. These will be saved for future orders.
        </p>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-nexus-textSecondary mb-1">Full Name</label>
          <input 
            type="text" 
            name="fullName"
            required
            value={formData.fullName || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-nexus-surface border border-slate-200 dark:border-nexus-border focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white"
            placeholder="Mary Ivy"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-nexus-textSecondary mb-1">Phone Number</label>
          <input 
            type="tel" 
            name="phone"
            required
            value={formData.phone || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-nexus-surface border border-slate-200 dark:border-nexus-border focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white"
            placeholder="+254 700 000000"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-nexus-textSecondary mb-1">Address</label>
        <input 
          type="text" 
          name="address"
          required
          value={formData.address || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl bg-white dark:bg-nexus-surface border border-slate-200 dark:border-nexus-border focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white"
          placeholder="123 Tech Hub Street, CBD"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-nexus-textSecondary mb-1">City</label>
          <input 
            type="text" 
            name="city"
            required
            value={formData.city || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-nexus-surface border border-slate-200 dark:border-nexus-border focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white"
            placeholder="Nairobi"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-nexus-textSecondary mb-1">Postal Code</label>
          <input 
            type="text" 
            name="postalCode"
            value={formData.postalCode || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-nexus-surface border border-slate-200 dark:border-nexus-border focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white"
            placeholder="00100"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        {hasSavedAddress && (
          <button 
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 mr-3 rounded-lg font-medium text-slate-600 dark:text-nexus-textSecondary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
        )}
        <button 
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 rounded-lg font-medium text-white bg-nexus-surface dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition-colors disabled:opacity-70"
        >
          {isSaving ? 'Saving...' : 'Save & Continue'}
        </button>
      </div>
    </div>
  );
};

export default ShippingForm;
