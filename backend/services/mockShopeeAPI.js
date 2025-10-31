/**
 * Mock Shopee API Service
 * Simulates real Shopee Open API v2 responses with realistic Vietnamese data
 */

import { MOCK_SHOP, MOCK_ORDERS, MOCK_PRODUCTS } from '../mockData/shopeeData.js';

class MockShopeeAPI {
    constructor() {
        this.BASE_URL = 'https://partner.shopeemobile.com';
        this.API_VERSION = 'api/v2';
    }

    
    async simulateAPICall(ms = 500) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * 1. Shop API - Get shop info
     * Matches: GET /api/v2/shop/get_shop_info
     */
    async getShopInfo(accessToken, shopId) {
        console.log(' Mock: Getting shop info for', shopId);
        await this.simulateAPICall();
        
        return {
            error: '',
            message: '',
            response: MOCK_SHOP,
            request_id: this.generateRequestId()
        };
    }

    /**
     * 2. Order API - Get order list
     * Matches: GET /api/v2/order/get_order_list
     */
    async getOrderList(accessToken, shopId, params = {}) {
        const {
            time_from = Math.floor(Date.now() / 1000) - 90 * 24 * 3600, // Default: last 90 days
            time_to = Math.floor(Date.now() / 1000),
            page_size = 50,
            cursor = '',
            order_status = ''
        } = params;

        console.log('Mock: Getting order list', { time_from, time_to, page_size, order_status });
        await this.simulateAPICall(800);

        // Filter orders by time and status
        let filteredOrders = MOCK_ORDERS.filter(order => {
            const inTimeRange = order.create_time >= time_from && order.create_time <= time_to;
            const matchStatus = !order_status || order.order_status === order_status;
            return inTimeRange && matchStatus;
        });

        // Sort by create_time desc
        filteredOrders.sort((a, b) => b.create_time - a.create_time);

        return {
            error: '',
            message: '',
            response: {
                more: false,
                next_cursor: '',
                order_list: filteredOrders.slice(0, page_size)
            },
            request_id: this.generateRequestId()
        };
    }

    /**
     * 3. Order API - Get order details
     * Matches: GET /api/v2/order/get_order_detail
     */
    async getOrderDetail(accessToken, shopId, orderSnList) {
        console.log('� Mock: Getting order details', orderSnList);
        await this.simulateAPICall(600);

        const orders = MOCK_ORDERS.filter(order => 
            orderSnList.includes(order.order_sn)
        );

        return {
            error: '',
            message: '',
            response: {
                order_list: orders
            },
            request_id: this.generateRequestId()
        };
    }

    /**
     * 4. Product API - Get item list
     * Matches: GET /api/v2/product/get_item_list
     */
    async getProductList(accessToken, shopId, params = {}) {
        const {
            offset = 0,
            page_size = 50,
            item_status = ['NORMAL', 'BANNED']
        } = params;

        console.log('🛍️ Mock: Getting item list', { offset, page_size });
        await this.simulateAPICall(700);

        const filteredProducts = MOCK_PRODUCTS.filter(product =>
            item_status.includes(product.item_status)
        );

        const paginatedProducts = filteredProducts.slice(offset, offset + page_size);

        return {
            error: '',
            message: '',
            response: {
                item: paginatedProducts.map(p => ({
                    item_id: p.item_id,
                    item_status: p.item_status,
                    update_time: p.update_time
                })),
                total_count: filteredProducts.length,
                has_next_page: offset + page_size < filteredProducts.length,
                next_offset: offset + page_size
            },
            request_id: this.generateRequestId()
        };
    }

    /**
     * 5. Product API - Get item detail (Batch)
     * Matches: GET /api/v2/product/get_item_base_info
     */
    async getProductBaseInfo(accessToken, shopId, itemIdList) {
        console.log('� Mock: Getting item details', itemIdList);
        await this.simulateAPICall(600);

        const items = MOCK_PRODUCTS.filter(product =>
            itemIdList.includes(product.item_id)
        );

        return {
            error: '',
            message: '',
            response: {
                item_list: items
            },
            request_id: this.generateRequestId()
        };
    }

    /**
     * 6. Shop Performance - Get analytics
     */
    async getShopPerformance(accessToken, shopId) {
        console.log('� Mock: Getting shop performance');
        await this.simulateAPICall(500);

        // Calculate metrics from orders
        const completedOrders = MOCK_ORDERS.filter(o => o.order_status === 'COMPLETED');
        const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total_amount, 0);
        
        return {
            error: '',
            message: '',
            response: {
                conversion_rate: 9.8,
                return_rate: 2.3,
                avg_response_time: 1.5,
                order_completion_rate: 94.5
            },
            request_id: this.generateRequestId()
        };
    }

    /**
     * 7. Finance - Get account balance
     */
    async getAccountBalance(accessToken, shopId) {
        console.log('� Mock: Getting account balance');
        await this.simulateAPICall(500);

        const completedOrders = MOCK_ORDERS.filter(o => o.order_status === 'COMPLETED');
        const totalIncome = completedOrders.reduce((sum, o) => sum + o.total_amount, 0);
        const totalExpense = Math.floor(totalIncome * 0.75);
        
        return {
            error: '',
            message: '',
            response: {
                available_balance: Math.floor((totalIncome - totalExpense) * 0.6),
                pending_balance: Math.floor((totalIncome - totalExpense) * 0.4),
                total_income: totalIncome,
                total_expense: totalExpense
            },
            request_id: this.generateRequestId()
        };
    }

    /**
     * COMBINED ENDPOINT: Get Dashboard Data
     * This combines multiple API calls into one for frontend efficiency
     */
    async getDashboardData(accessToken, shopId) {
        console.log('📊 Mock: Getting dashboard data for', shopId);

        try {
            // Get all data
            const [shopInfo, orderList, productList, performance, finance] = await Promise.all([
                this.getShopInfo(accessToken, shopId),
                this.getOrderList(accessToken, shopId, {
                    time_from: Math.floor(new Date('2025-01-01').getTime() / 1000), // Jan 1, 2025
                    time_to: Math.floor(new Date('2025-10-31').getTime() / 1000), // Oct 31, 2025
                    page_size: 500 // Get all 250 orders
                }),
                this.getProductList(accessToken, shopId, { page_size: 100 }), // Get all 55 products
                this.getShopPerformance(accessToken, shopId),
                this.getAccountBalance(accessToken, shopId)
            ]);

            const orders = orderList.response.order_list;
            const products = productList.response.item;

            // Get full product details
            const itemIdList = products.map(p => p.item_id);
            const productDetails = await this.getProductBaseInfo(accessToken, shopId, itemIdList);

            // Calculate performance metrics
            const completedOrders = orders.filter(o => o.order_status === 'COMPLETED');
            const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total_amount, 0);
            const totalOrders = orders.length;
            const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

            console.log('✅ Dashboard data loaded:', {
                orders: orders.length,
                products: productDetails.response.item_list.length,
                revenue: totalRevenue
            });

            return {
                shop: shopInfo.response,
                orders: orders,
                products: productDetails.response.item_list,
                performance: {
                    total_revenue: totalRevenue,
                    total_orders: totalOrders,
                    avg_order_value: Math.floor(avgOrderValue),
                    conversion_rate: performance.response.conversion_rate,
                    return_rate: performance.response.return_rate,
                    completed_orders: completedOrders.length,
                    cancelled_orders: orders.filter(o => o.order_status === 'CANCELLED').length
                },
                finance: finance.response
            };
        } catch (error) {
            console.error('❌ Error fetching dashboard data:', error);
            throw error;
        }
    }

    // Helper: Generate request ID
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }
}

export const mockShopeeAPI = new MockShopeeAPI();
