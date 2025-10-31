import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

// Async thunk for loading dashboard data
export const loadDashboardData = createAsyncThunk(
    'dashboard/loadData',
    async ({ accessToken, shopId }, { rejectWithValue }) => {
        try {
            console.log('📊 [Redux] Loading dashboard data...');
            const response = await api.getDashboardData(accessToken, shopId);
            console.log('✅ [Redux] Dashboard data loaded:', response);
            return response;
        } catch (error) {
            console.error('❌ [Redux] Error loading dashboard:', error);
            return rejectWithValue(error.message);
        }
    }
);

// Transform Shopee data for charts
const transformShopeeData = (data) => {
    const orders = data.orders || [];
    const products = data.products || [];
    const performance = data.performance || {};
    
    // Revenue by month (last 6 months)
    const revenueByMonth = {};
    const now = new Date();
    
    orders.forEach(order => {
        if (order.order_status !== 'CANCELLED' && order.order_status !== 'UNPAID') {
            const date = new Date(order.create_time * 1000);
            const monthKey = `T${date.getMonth() + 1}`;
            
            if (!revenueByMonth[monthKey]) {
                revenueByMonth[monthKey] = { revenue: 0, orders: 0, profit: 0 };
            }
            
            const revenue = order.total_amount / 1000; // Convert to K VND
            revenueByMonth[monthKey].revenue += revenue;
            revenueByMonth[monthKey].orders += 1;
            revenueByMonth[monthKey].profit += revenue * 0.25; // Assume 25% profit margin
        }
    });

    const revenueData = Object.entries(revenueByMonth)
        .map(([month, data]) => ({
            month,
            revenue: Math.round(data.revenue),
            orders: data.orders,
            profit: Math.round(data.profit)
        }))
        .sort((a, b) => {
            const monthA = parseInt(a.month.replace('T', ''));
            const monthB = parseInt(b.month.replace('T', ''));
            return monthA - monthB;
        });

    // Top products with Real Shopee API structure
    const topProducts = products
        .map(p => {
            const currentPrice = p.price_info?.current_price || 0;
            const sales = p.sales || 0;
            const stock = p.stock_info?.current_stock || 0;
            
            return {
                key: p.item_id,
                name: p.item_name || 'Unknown Product',
                category: p.category_name || 'Khác',
                sales: sales,
                revenue: `₫${(currentPrice * sales).toLocaleString('vi-VN')}`,
                revenueValue: currentPrice * sales,
                growth: Math.random() * 20 - 5, // Mock growth for now
                stock: stock,
                status: stock < 20 ? 'low' : sales > 50 ? 'hot' : 'normal'
            };
        })
        .sort((a, b) => b.revenueValue - a.revenueValue)
        .slice(0, 10);

    // Order status distribution
    const orderStatusCount = {};
    orders.forEach(order => {
        const status = order.order_status;
        orderStatusCount[status] = (orderStatusCount[status] || 0) + 1;
    });

    const orderStatusData = Object.entries(orderStatusCount).map(([status, count]) => ({
        name: translateOrderStatus(status),
        value: count,
        color: getStatusColor(status)
    }));

    // Category distribution from products
    const categoryCount = {};
    products.forEach(product => {
        const category = product.category_name || 'Khác';
        if (!categoryCount[category]) {
            categoryCount[category] = { count: 0, sales: 0 };
        }
        categoryCount[category].count += 1;
        categoryCount[category].sales += product.sales || 0;
    });

    const categoryData = Object.entries(categoryCount)
        .map(([name, data]) => ({
            name,
            value: data.count,
            sales: data.sales
        }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

    // Calculate total revenue (completed orders only)
    const completedOrders = orders.filter(o => o.order_status === 'COMPLETED');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total_amount, 0);

    // Extract performance metrics
    const conversionRate = performance.conversion_rate || 9.8;
    const returnRate = performance.return_rate || 2.3;

    return {
        revenueData,
        topProducts,
        orderStatusData,
        categoryData,
        totalOrders: orders.length,
        totalRevenue: Math.round(totalRevenue / 1000), // K VND
        totalProducts: products.length,
        completedOrders: completedOrders.length,
        cancelledOrders: orders.filter(o => o.order_status === 'CANCELLED').length,
        avgOrderValue: completedOrders.length > 0 ? Math.round(totalRevenue / completedOrders.length / 1000) : 0,
        conversionRate,
        returnRate,
        shopInfo: data.shop || {},
        performance: performance,
        finance: data.finance || {}
    };
};

const getStatusColor = (status) => {
    const colorMap = {
        'UNPAID': '#faad14',
        'READY_TO_SHIP': '#1890ff',
        'PROCESSED': '#13c2c2',
        'SHIPPED': '#52c41a',
        'COMPLETED': '#52c41a',
        'CANCELLED': '#ff4d4f',
        'TO_RETURN': '#fa8c16',
    };
    return colorMap[status] || '#d9d9d9';
};

const translateOrderStatus = (status) => {
    const statusMap = {
        'UNPAID': 'Chưa thanh toán',
        'READY_TO_SHIP': 'Chờ lấy hàng',
        'PROCESSED': 'Đang xử lý',
        'SHIPPED': 'Đang giao',
        'COMPLETED': 'Hoàn thành',
        'CANCELLED': 'Đã hủy',
        'TO_RETURN': 'Trả hàng',
    };
    return statusMap[status] || status;
};

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState: {
        data: null,
        transformedData: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearDashboardData: (state) => {
            state.data = null;
            state.transformedData = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadDashboardData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loadDashboardData.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
                state.transformedData = transformShopeeData(action.payload);
            })
            .addCase(loadDashboardData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearDashboardData } = dashboardSlice.actions;
export default dashboardSlice.reducer;
