import React, { useState, useEffect } from 'react';
import { Building2, Mail, Phone, MapPin, Star, Package, RefreshCw, User, MessageSquare } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Textarea';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

const InventorySuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('company_name', { ascending: true });
        
      if (error) throw error;
      setSuppliers(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load suppliers');
      if (suppliers.length === 0) {
        setSuppliers([
          { id: 1, company_name: 'Acme Electronics', contact_person: 'John Smith', email: 'john@acme.com', phone: '+1 555-0100', category: 'Electronics', rating: 4.8 },
          { id: 2, company_name: 'Global Office Supplies', contact_person: 'Sarah Johnson', email: 'sarah@globaloffice.com', phone: '+1 555-0122', category: 'Stationery', rating: 4.5 },
          { id: 3, company_name: 'TechGear Pro', contact_person: 'Mike Davis', email: 'mike@techgear.net', phone: '+1 555-0199', category: 'IT Equipment', rating: 4.9 },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleContactSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setMessage('');
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      // Simulate messaging or call API
      await new Promise((r) => setTimeout(r, 800));
      toast.success(`Message sent to ${selectedSupplier.company_name}!`);
      setSelectedSupplier(null);
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.contact_person?.toLowerCase().includes(search.toLowerCase()) ||
    s.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl animate-fade-in pb-10">
      <PageHeader
        title="Supplier Directory"
        subtitle="View approved suppliers and contact information"
        actions={
          <Button onClick={fetchSuppliers} variant="secondary" size="sm">
            <RefreshCw size={16} />
          </Button>
        }
      />

      <div className="max-w-md">
        <SearchInput 
          value={search} 
          onChange={e => setSearch(e.target.value)}
          placeholder="Search suppliers by name, contact, or category..."
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" className="h-48" />
          ))}
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <EmptyState
          title="No suppliers found"
          description="Try adjusting your search criteria or refresh the directory."
          icon={Building2}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredSuppliers.map((supplier) => (
            <Card key={supplier.id} className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-nexus-primary/10 flex items-center justify-center text-nexus-primary flex-shrink-0 border border-nexus-primary/20">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-nexus-heading line-clamp-1">{supplier.company_name}</h3>
                      <p className="text-xs font-medium text-nexus-primary mt-0.5">{supplier.category || 'General Supplier'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-nexus-gold/10 text-nexus-gold px-2 py-1 rounded-lg text-xs font-bold">
                    <Star size={12} fill="currentColor" /> {supplier.rating || 'N/A'}
                  </div>
                </div>
                
                <div className="space-y-3 mb-5">
                  <div className="flex items-center gap-2.5 text-sm text-nexus-text">
                    <User size={14} className="text-nexus-muted" />
                    <span className="truncate">{supplier.contact_person || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-nexus-text">
                    <Mail size={14} className="text-nexus-muted" />
                    <a href={`mailto:${supplier.email}`} className="truncate hover:text-nexus-primary transition-colors">{supplier.email || 'N/A'}</a>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-nexus-text">
                    <Phone size={14} className="text-nexus-muted" />
                    <span className="truncate">{supplier.phone || 'N/A'}</span>
                  </div>
                  {supplier.address && (
                    <div className="flex items-start gap-2.5 text-sm text-nexus-text">
                      <MapPin size={14} className="text-nexus-muted shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{supplier.address}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pt-4 border-t border-nexus-border flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1.5 text-xs text-nexus-muted">
                  <Package size={14} />
                  <span>{supplier.total_orders || 0} orders</span>
                </div>
                <Button
                  onClick={() => handleContactSupplier(supplier)}
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1 text-xs font-bold"
                >
                  Contact Supplier <MessageSquare size={12} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedSupplier && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedSupplier(null)}
          title="Contact Supplier"
          footer={
            <>
              <Button onClick={() => setSelectedSupplier(null)} disabled={submitting} variant="secondary" size="sm">
                Cancel
              </Button>
              <Button onClick={handleSendMessage} disabled={submitting || !message.trim()} variant="primary" size="sm" className="gap-2">
                <Mail size={16} /> Send Message
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="bg-nexus-surface/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Building2 size={18} className="text-nexus-muted" />
                <div>
                  <p className="text-sm font-medium text-nexus-heading">{selectedSupplier.company_name}</p>
                  <p className="text-xs text-nexus-muted">{selectedSupplier.category}</p>
                </div>
              </div>
            </div>

            <Textarea
              label="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message to the supplier..."
              required
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default InventorySuppliersPage;
