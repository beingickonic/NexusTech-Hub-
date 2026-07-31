import React, { useEffect, useState } from 'react';
import { ShoppingCart, Star, MessageSquare, CreditCard, UserPlus } from 'lucide-react';
import { adminService } from '../../../services/adminService';
import { supabase } from '../../../services/supabaseClient';

const getRelativeTime = (dateStr) => {
  if (!dateStr) return 'Just now';
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const diff = new Date(dateStr) - new Date();
  const mins = Math.round(diff / 60000);
  const hrs = Math.round(diff / 3600000);
  const days = Math.round(diff / 86400000);

  if (Math.abs(mins) < 60) return rtf.format(mins, 'minute');
  if (Math.abs(hrs) < 24) return rtf.format(hrs, 'hour');
  return rtf.format(days, 'day');
};

const ActivityFeedWidget = () => {
  const [activities, setActivities] = useState([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const [ordersRes, profilesRes] = await Promise.all([
          supabase.from('orders').select('id, total_amount, created_at, status').order('created_at', { ascending: false }).limit(10),
          supabase.from('profiles').select('id, email, created_at').order('created_at', { ascending: false }).limit(10)
        ]);

        const acts = [];
        (ordersRes.data || []).forEach(o => {
          acts.push({
            id: `ord-${o.id}`,
            type: o.status === 'completed' ? 'payment' : 'order',
            title: o.status === 'completed' ? 'Payment completed' : 'New order placed',
            description: `Order for KES ${Number(o.total_amount || 0).toLocaleString()}`,
            date: o.created_at,
          });
        });
        (profilesRes.data || []).forEach(p => {
          acts.push({
            id: `usr-${p.id}`,
            type: 'user',
            title: 'New customer registered',
            description: p.email,
            date: p.created_at,
          });
        });

        acts.sort((a, b) => new Date(b.date) - new Date(a.date));
        setActivities(acts.slice(0, 15));
      } catch (err) {
        console.error(err);
      }
    };

    fetchActivities();
    
    const interval = setInterval(() => setNow(Date.now()), 60000);

    const unsubscribeOrders = adminService.subscribeToNewOrders((newOrder) => {
      setActivities(prev => [{
        id: `ord-${newOrder.id}`,
        type: 'order',
        title: 'New order placed',
        description: `Order for KES ${Number(newOrder.total_amount || 0).toLocaleString()}`,
        date: newOrder.created_at || new Date().toISOString()
      }, ...prev].slice(0, 15));
    });

    return () => {
      clearInterval(interval);
      if (unsubscribeOrders) unsubscribeOrders();
    };
  }, []);

  const getIcon = (type) => {
    switch(type) {
      case 'order': return <div className="p-2 bg-nexus-info/10 text-nexus-info rounded-full border border-nexus-info/20"><ShoppingCart size={16} /></div>;
      case 'user': return <div className="p-2 bg-info/100/10 text-info rounded-full border border-info/20"><UserPlus size={16} /></div>;
      case 'payment': return <div className="p-2 bg-success/10 text-success rounded-full border border-success/20"><CreditCard size={16} /></div>;
      default: return <div className="p-2 bg-nexus-muted/10 text-nexus-textSecondary rounded-full border border-nexus-border/20"><Star size={16} /></div>;
    }
  };

  return (
    <div className="bg-nexus-card backdrop-blur-md p-4 md:p-6 rounded-xl md:rounded-2xl border border-nexus-border shadow-sm h-full max-h-[400px] md:max-h-[500px] overflow-hidden flex flex-col">
      <h3 className="text-base md:text-lg font-bold text-nexus-heading mb-4 md:mb-6">Live Activity Feed</h3>
      <div className="flex-1 overflow-y-auto pr-1 md:pr-2 space-y-4 md:space-y-6">
        {activities.map((activity, idx) => (
          <div key={activity.id} className="flex gap-4 relative">
            {idx !== activities.length - 1 && (
              <div className="absolute left-[17px] top-10 bottom-[-24px] w-[2px] bg-nexus-surface"></div>
            )}
            <div className="relative z-10">
              {getIcon(activity.type)}
            </div>
            <div>
              <p className="text-sm font-semibold text-nexus-heading">{activity.title}</p>
              <p className="text-xs text-nexus-muted mt-1">{activity.description}</p>
              <span className="text-[10px] font-medium text-nexus-muted mt-2 block">{getRelativeTime(activity.date)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeedWidget;
