/**
 * OPTIMIZED: Memoized Chart Components
 * Prevents unnecessary re-renders when data hasn't changed
 */
import React, { memo } from 'react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

// Memoized Revenue Chart
export const MemoizedRevenueChart = memo(({ data }) => (
    <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
            <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0a58d0" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0a58d0" stopOpacity={0} />
                </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip 
                contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px'
                }}
            />
            <Legend />
            <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#0a58d0" 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                name="Doanh thu (K ₫)"
            />
        </AreaChart>
    </ResponsiveContainer>
), (prevProps, nextProps) => {
    return JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data);
});

MemoizedRevenueChart.displayName = 'MemoizedRevenueChart';

// Memoized Order Status Pie Chart
export const MemoizedOrderStatusChart = memo(({ data }) => (
    <ResponsiveContainer width="100%" height={300}>
        <PieChart>
            <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
            >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
            </Pie>
            <Tooltip />
        </PieChart>
    </ResponsiveContainer>
), (prevProps, nextProps) => {
    return JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data);
});

MemoizedOrderStatusChart.displayName = 'MemoizedOrderStatusChart';

// Memoized Category Bar Chart
export const MemoizedCategoryChart = memo(({ data }) => (
    <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip 
                contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px'
                }}
            />
            <Legend />
            <Bar dataKey="sales" fill="#1976d2" name="Số lượng bán" />
        </BarChart>
    </ResponsiveContainer>
), (prevProps, nextProps) => {
    return JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data);
});

MemoizedCategoryChart.displayName = 'MemoizedCategoryChart';

// Memoized Line Chart (for trends)
export const MemoizedTrendChart = memo(({ data }) => (
    <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#666" />
            <YAxis yAxisId="left" stroke="#666" />
            <YAxis yAxisId="right" orientation="right" stroke="#666" />
            <Tooltip 
                contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px'
                }}
            />
            <Legend />
            <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="revenue" 
                stroke="#0a58d0" 
                strokeWidth={2}
                name="Doanh thu (K ₫)"
            />
            <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="orders" 
                stroke="#52c41a" 
                strokeWidth={2}
                name="Đơn hàng"
            />
        </LineChart>
    </ResponsiveContainer>
), (prevProps, nextProps) => {
    return JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data);
});

MemoizedTrendChart.displayName = 'MemoizedTrendChart';
