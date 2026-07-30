import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const RevenueChart = ({ data = [] }) => {
  const { isDarkMode } = useTheme();
  const [timeRange, setTimeRange] = useState('7D');

  const ranges = ['7D', '30D', '90D', '12M'];

  // Mock data generator for different ranges if empty
  const chartData = data.length > 0 ? data : [
    { name: 'Mon', revenue: 12000, orders: 40, customers: 12 },
    { name: 'Tue', revenue: 19000, orders: 60, customers: 18 },
    { name: 'Wed', revenue: 15000, orders: 45, customers: 10 },
    { name: 'Thu', revenue: 22000, orders: 70, customers: 22 },
    { name: 'Fri', revenue: 28000, orders: 85, customers: 30 },
    { name: 'Sat', revenue: 35000, orders: 110, customers: 45 },
    { name: 'Sun', revenue: 31000, orders: 95, customers: 38 }
  ];

  return (
    <div className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-200 dark:border-nexus-border shadow-sm h-full min-h-[350px] md:min-h-[450px] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-4">
        <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">Revenue Analytics</h3>
        <div className="flex bg-slate-100 dark:bg-nexus-surface/50 p-1 rounded-lg border border-slate-200 dark:border-nexus-border">
          {ranges.map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                timeRange === range 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-nexus-textSecondary dark:text-nexus-textSecondary hover:text-slate-700 dark:hover:text-nexus-textSecondary'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6B57" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#FF6B57" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="name" 
              stroke={isDarkMode ? '#475569' : '#94a3b8'} 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke={isDarkMode ? '#475569' : '#94a3b8'} 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `Ksh ${value >= 1000 ? (value/1000)+'k' : value}`}
            />
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDarkMode ? '#111827' : '#ffffff',
                borderColor: isDarkMode ? '#1F2937' : '#e2e8f0',
                borderRadius: '12px',
                color: isDarkMode ? '#f8fafc' : '#0f172a',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
              }}
              itemStyle={{ color: '#FF6B57', fontWeight: 'bold' }}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#FF6B57" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
