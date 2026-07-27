
const ShippingForm = ({ formData, setFormData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Shipping Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
          <input 
            type="text" 
            name="fullName"
            required
            value={formData.fullName || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white"
            placeholder="Mary Ivy"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
          <input 
            type="tel" 
            name="phone"
            required
            value={formData.phone || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white"
            placeholder="+254 700 000000"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
        <input 
          type="text" 
          name="address"
          required
          value={formData.address || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white"
          placeholder="123 Tech Hub Street, CBD"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">City</label>
          <input 
            type="text" 
            name="city"
            required
            value={formData.city || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white"
            placeholder="Nairobi"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Postal Code</label>
          <input 
            type="text" 
            name="postalCode"
            value={formData.postalCode || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white"
            placeholder="00100"
          />
        </div>
      </div>
    </div>
  );
};

export default ShippingForm;
