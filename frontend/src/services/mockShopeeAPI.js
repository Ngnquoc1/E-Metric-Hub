// Mock Shopee API Service - Giả lập tất cả API endpoints của Shopee
import { mockShopeeData } from '../mockData/shopeeData';
import { mockShopeeAuth } from './mockShopeeAuth';

class MockShopeeAPIService {
    constructor() {
        this.BASE_URL = 'https://partner.shopeemobile.com'; // Mock - không call thật
        this.API_VERSION = 'api/v2';
    }

    /**
     * Validate access token trước khi gọi API
     */
    validateToken(accessToken, shopId) {
        const storedTokens = mockShopeeAuth.getStoredTokens(shopId);
        
        if (!storedTokens) {
            throw new Error('No valid token found. Please authenticate first.');
        }
        
        if (storedTokens.access_token !== accessToken) {
            throw new Error('Invalid access token');
        }
        
        return true;
    }

    /**
     * Simulate API call delay
     */
    async simulateAPICall(ms = 500) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * 1. Shop API - Get shop info
     */
    async getShopInfo(accessToken, shopId) {
        console.log('📡 API Call: shop.get_shop_info');
        this.validateToken(accessToken, shopId);
        
        await this.simulateAPICall();
        
        return {
            error: '',
            message: '',
            warning: '',
            request_id: `req-shop-${Date.now()}`,
            response: mockShopeeData.shop_info,
        };
    }

    /**
     * 2. Order API - Get order list
     */
    async getOrderList(accessToken, shopId, params = {}) {
        console.log('📡 API Call: order.get_order_list', params);
        this.validateToken(accessToken, shopId);
        
        await this.simulateAPICall(800);
        
        const {
            time_from = Math.floor(Date.now() / 1000) - 30 * 86400, // 30 days ago
            time_to = Math.floor(Date.now() / 1000),
            page_size = 50,
            cursor = '',
        } = params;
        
        // Filter orders by time range
        let orders = mockShopeeData.orders.filter((order) => {
            return order.create_time >= time_from && order.create_time <= time_to;
        });
        
        // Pagination
        const startIndex = cursor ? parseInt(cursor) : 0;
        const endIndex = startIndex + page_size;
        const paginatedOrders = orders.slice(startIndex, endIndex);
        
        return {
            error: '',
            message: '',
            warning: '',
            request_id: `req-orders-${Date.now()}`,
            response: {
                more: endIndex < orders.length,
                next_cursor: endIndex < orders.length ? endIndex.toString() : '',
                order_list: paginatedOrders.map((order) => ({
                    order_sn: order.order_sn,
                })),
            },
        };
    }

    /**
     * 3. Order API - Get order details
     */
    async getOrderDetail(accessToken, shopId, orderSnList) {
        console.log('📡 API Call: order.get_order_detail', { count: orderSnList.length });
        this.validateToken(accessToken, shopId);
        
        await this.simulateAPICall(600);
        
        const orderDetails = orderSnList
            .map((orderSn) => mockShopeeData.order_details[orderSn])
            .filter((order) => order !== undefined);
        
        return {
            error: '',
            message: '',
            warning: '',
            request_id: `req-order-detail-${Date.now()}`,
            response: {
                order_list: orderDetails,
            },
        };
    }

    /**
     * 4. Product API - Get product list
     */
    async getProductList(accessToken, shopId, params = {}) {
        console.log('📡 API Call: product.get_item_list', params);
        this.validateToken(accessToken, shopId);
        
        await this.simulateAPICall(700);
        
        const {
            offset = 0,
            page_size = 30,
            item_status = [], // ['NORMAL', 'DELETED', 'BANNED', 'UNLIST']
        } = params;
        
        // Filter by status
        let products = mockShopeeData.products;
        if (item_status.length > 0) {
            products = products.filter((p) => item_status.includes(p.item_status));
        }
        
        // Pagination
        const paginatedProducts = products.slice(offset, offset + page_size);
        
        return {
            error: '',
            message: '',
            warning: '',
            request_id: `req-products-${Date.now()}`,
            response: {
                item: paginatedProducts.map((p) => ({
                    item_id: p.item_id,
                    item_status: p.item_status,
                })),
                total_count: products.length,
                has_next_page: offset + page_size < products.length,
                next_offset: offset + page_size < products.length ? offset + page_size : 0,
            },
        };
    }

    /**
     * 5. Product API - Get product base info
     */
    async getProductBaseInfo(accessToken, shopId, itemIdList) {
        console.log('📡 API Call: product.get_item_base_info', { count: itemIdList.length });
        this.validateToken(accessToken, shopId);
        
        await this.simulateAPICall(600);
        
        const productDetails = itemIdList
            .map((itemId) => mockShopeeData.products.find((p) => p.item_id === itemId))
            .filter((product) => product !== undefined);
        
        return {
            error: '',
            message: '',
            warning: '',
            request_id: `req-product-info-${Date.now()}`,
            response: {
                item_list: productDetails,
            },
        };
    }

    /**
     * 6. Shop Performance - Get analytics
     */
    async getShopPerformance(accessToken, shopId) {
        console.log('📡 API Call: shop.get_shop_performance');
        this.validateToken(accessToken, shopId);
        
        await this.simulateAPICall(500);
        
        return {
            error: '',
            message: '',
            warning: '',
            request_id: `req-performance-${Date.now()}`,
            response: mockShopeeData.shop_performance,
        };
    }

    /**
     * 7. Finance - Get account balance
     */
    async getAccountBalance(accessToken, shopId) {
        console.log('📡 API Call: payment.get_wallet_transaction_list');
        this.validateToken(accessToken, shopId);
        
        await this.simulateAPICall(500);
        
        return {
            error: '',
            message: '',
            warning: '',
            request_id: `req-finance-${Date.now()}`,
            response: mockShopeeData.finance,
        };
    }

    /**
     * Helper: Get aggregated dashboard data
     * Tổng hợp tất cả data cần thiết cho Dashboard
     */
    async getDashboardData(accessToken, shopId) {
        console.log('📊 Fetching complete dashboard data...');
        
        try {
            // Call all APIs in parallel
            const [shopInfo, orderList, products, performance, finance] = await Promise.all([
                this.getShopInfo(accessToken, shopId),
                this.getOrderList(accessToken, shopId, { page_size: 100 }),
                this.getProductList(accessToken, shopId, { page_size: 100 }),
                this.getShopPerformance(accessToken, shopId),
                this.getAccountBalance(accessToken, shopId),
            ]);
            
            // Get detailed order info
            const orderSnList = orderList.response.order_list.map((o) => o.order_sn);
            const orderDetails = await this.getOrderDetail(accessToken, shopId, orderSnList.slice(0, 50));
            
            // Get detailed product info
            const itemIdList = products.response.item.map((p) => p.item_id);
            const productDetails = await this.getProductBaseInfo(accessToken, shopId, itemIdList.slice(0, 50));
            
            console.log('✅ Dashboard data loaded successfully');
            
            return {
                shop: shopInfo.response,
                orders: orderDetails.response.order_list,
                products: productDetails.response.item_list,
                performance: performance.response,
                finance: finance.response,
            };
        } catch (error) {
            console.error('❌ Error fetching dashboard data:', error);
            throw error;
        }
    }

    /**
     * Helper: Format revenue data for charts
     */
    getRevenueChartData(orders, days = 30) {
        const now = Math.floor(Date.now() / 1000);
        const timeFrom = now - days * 86400;
        
        // Group by date
        const dailyRevenue = {};
        orders.forEach((order) => {
            if (order.create_time >= timeFrom && order.order_status !== 'CANCELLED') {
                const date = new Date(order.create_time * 1000).toLocaleDateString('vi-VN');
                dailyRevenue[date] = (dailyRevenue[date] || 0) + order.total_amount;
            }
        });
        
        // Convert to array for Recharts
        return Object.entries(dailyRevenue)
            .map(([date, revenue]) => ({ date, revenue }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    /**
     * Helper: Get top products
     */
    getTopProducts(products, limit = 10) {
        return [...products]
            .sort((a, b) => b.sold - a.sold)
            .slice(0, limit)
            .map((p) => ({
                name: p.item_name,
                sales: p.sold,
                revenue: p.price * p.sold,
                stock: p.stock,
            }));
    }

    /**
     * Helper: Get order status distribution
     */
    getOrderStatusDistribution(orders) {
        const distribution = {};
        orders.forEach((order) => {
            distribution[order.order_status] = (distribution[order.order_status] || 0) + 1;
        });
        
        return Object.entries(distribution).map(([status, count]) => ({
            status,
            count,
        }));
    }
}

export const mockShopeeAPI = new MockShopeeAPIService();
