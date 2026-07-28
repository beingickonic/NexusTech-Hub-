import React, { useState, useEffect } from 'react';
import DashboardStats from '../../components/admin/DashboardStats';
import RevenueChart from '../../components/admin/RevenueChart';
import RecentOrdersWidget from '../../components/admin/widgets/RecentOrdersWidget';
import InventoryHealthWidget from '../../components/admin/widgets/InventoryHealthWidget';
import ActivityFeedWidget from '../../components/admin/widgets/ActivityFeedWidget';
import QuickActionsPanel from '../../components/admin/widgets/QuickActionsPanel';
import DispatchWidget from '../../components/admin/widgets/DispatchWidget';
import DriverStatusWidget from '../../components/admin/widgets/DriverStatusWidget';
import { adminService } from '../../services/adminService';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../auth/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ revenue: 0, orders: 0, customers: 0, products: 0 });
  const [chartData, setChartData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getGreeting = (name) => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return `Good Morning, ${name} ☀️`;
    if (hour >= 12 && hour < 17) return `Good Afternoon, ${name} 🌤️`;
    if (hour >= 17 && hour <= 23) return `Good Evening, ${name} 🌙`;
    return `Working Late, ${name} 🚀`;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, ordersRes, inventoryRes] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getOrders(),
          adminService.getInventory()
        ]);

        if (statsRes.status === 'success') {
          setStats(statsRes.stats);
          if (statsRes.chartData?.length > 0) setChartData(statsRes.chartData);
        }

        if (ordersRes.success) {
          setRecentOrders(ordersRes.data || []);
        }

        if (inventoryRes.success) {
          setInventory(inventoryRes.data || []);
        }

      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();

    // Real-time synchronization
    const channel = supabase.channel('dashboard-events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchDashboardData)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-4 md:space-y-8 pb-10 px-0 md:px-0">
      {/* Dashboard Hero */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 md:gap-4 px-1 md:px-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
            {getGreeting(user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Admin')}
          </h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium">Here's what's happening with your store today.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <DashboardStats stats={stats} />

      {/* Main Grid: Revenue & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 h-full">
          <RevenueChart data={chartData} />
        </div>
        <div className="flex flex-col gap-4 md:gap-6">
          <QuickActionsPanel />
          <InventoryHealthWidget products={inventory} />
        </div>
      </div>

      {/* Secondary Grid: Orders & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <RecentOrdersWidget orders={recentOrders} />
        </div>
        <div className="h-full">
          <ActivityFeedWidget />
        </div>
      </div>

      {/* ERP Widgets Row: Dispatch & Drivers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        <DispatchWidget />
        <DriverStatusWidget />
      </div>
    </div>
  );
};

export default DashboardPage;
