/**
 * Mock Shopee API Service
 * Simulates real Shopee Open API v2 responses with realistic Vietnamese data
 */

import { MOCK_SHOP, MOCK_ORDERS, MOCK_PRODUCTS, ORDER_MAP, PRODUCT_MAP } from '../mockData/shopeeData.js';

// Vietnamese review templates by product category and aspect
const REVIEW_TEMPLATES = {
    // Smartphones
    'Điện Thoại': {
        positive: {
            Price: ['Giá tốt so với thị trường', 'Giá hợp lý với cấu hình', 'Giá cả phải chăng'],
            Shipping: ['Giao hàng nhanh chóng', 'Ship cẩn thận, đóng gói kỹ', 'Nhận hàng đúng hẹn'],
            Outlook: ['Thiết kế đẹp, sang trọng', 'Màu sắc đẹp như hình', 'Ngoại hình xịn xò'],
            Quality: ['Máy nguyên seal, chính hãng', 'Chất lượng tuyệt vời', 'Máy zin 100%'],
            Shop_Service: ['Shop tư vấn nhiệt tình', 'CSKH tốt, trả lời nhanh', 'Shop uy tín'],
            General: ['Rất hài lòng với sản phẩm', 'Sẽ ủng hộ shop tiếp', 'Đáng đồng tiền']
        },
        neutral: {
            Price: ['Giá hơi cao nhưng chấp nhận được', 'Mong shop giảm giá hơn'],
            Shipping: ['Giao hơi lâu nhưng hàng ok', 'Ship trung bình'],
            Quality: ['Máy dùng bình thường', 'Chất lượng tạm được'],
            General: ['Sản phẩm như mô tả', 'Không quá xuất sắc nhưng ok']
        },
        negative: {
            Price: ['Giá đắt so với nơi khác', 'Không đáng với giá tiền'],
            Shipping: ['Giao hàng quá lâu', 'Ship lâu, đóng gói kém'],
            Quality: ['Máy có vấn đề về pin', 'Màn hình bị lỗi', 'Máy nóng khi dùng'],
            Shop_Service: ['Shop không trả lời tin nhắn', 'Thái độ không tốt'],
            General: ['Thất vọng với sản phẩm', 'Không recommend']
        }
    },
    // Laptops
    'Laptop': {
        positive: {
            Price: ['Giá tốt nhất thị trường', 'Giá rẻ hơn các shop khác'],
            Shipping: ['Đóng gói cẩn thận, giao nhanh', 'Ship tận nơi, hàng nguyên vẹn'],
            Outlook: ['Máy đẹp như mới', 'Thiết kế sang trọng', 'Vỏ nhôm đẹp'],
            Quality: ['Máy chạy mượt mà', 'Cấu hình khỏe', 'Pin trâu, dùng cả ngày'],
            Size: ['Kích thước vừa vặn', 'Mỏng nhẹ, dễ mang theo'],
            Shop_Service: ['Shop hỗ trợ setup nhiệt tình', 'Tư vấn chi tiết'],
            General: ['Máy tuyệt vời cho công việc', 'Rất đáng mua']
        },
        neutral: {
            Price: ['Giá hơi cao so với cấu hình', 'Mong có chương trình khuyến mãi'],
            Quality: ['Máy dùng được nhưng không wow', 'Pin hơi yếu'],
            General: ['Bình thường, không có gì đặc biệt']
        },
        negative: {
            Price: ['Giá quá đắt', 'Không xứng với giá'],
            Shipping: ['Giao trễ, máy bị xước', 'Đóng gói không cẩn thận'],
            Quality: ['Máy lag khi mở nhiều app', 'Pin yếu hơn mong đợi', 'Quạt kêu ồn'],
            Shop_Service: ['Shop không hỗ trợ sau bán', 'Khó liên lạc'],
            General: ['Không hài lòng', 'Sẽ không mua lại']
        }
    },
    // Headphones & Audio
    'Tai Nghe': {
        positive: {
            Price: ['Giá tốt cho chất lượng âm thanh', 'Đáng tiền'],
            Shipping: ['Giao nhanh, đóng gói tốt', 'Hàng zin, seal nguyên'],
            Outlook: ['Thiết kế đẹp, hiện đại', 'Màu đẹp như hình'],
            Quality: ['Âm thanh trong trẻo, bass ổn', 'Chống ồn tốt', 'Pin trâu'],
            Size: ['Đeo vừa tai, êm ái', 'Nhẹ, đeo lâu không đau'],
            General: ['Tai nghe tuyệt vời', 'Rất đáng mua']
        },
        neutral: {
            Price: ['Giá hơi cao với tính năng', 'Tạm chấp nhận'],
            Quality: ['Âm thanh bình thường', 'Bass hơi yếu'],
            Size: ['Hơi to, không vừa tai nhỏ'],
            General: ['Dùng được, không quá tốt']
        },
        negative: {
            Price: ['Giá đắt, không đáng', 'So với giá thì tệ'],
            Quality: ['Âm thanh kém', 'Chống ồn không tốt', 'Pin yếu'],
            Size: ['Đeo không vừa, dễ rơi', 'Nặng, đau tai'],
            General: ['Thất vọng hoàn toàn', 'Không recommend']
        }
    },
    // Accessories
    'Phụ Kiện': {
        positive: {
            Price: ['Giá rẻ, chất lượng tốt', 'Rẻ mà xịn'],
            Shipping: ['Giao nhanh trong ngày', 'Đóng gói cẩn thận'],
            Outlook: ['Đẹp như hình', 'Màu sắc đẹp'],
            Quality: ['Chất liệu tốt', 'Bền, chắc chắn', 'Dùng rất ok'],
            Size: ['Size vừa vặn', 'Khớp hoàn hảo'],
            General: ['Phụ kiện tốt, đáng mua', 'Sẽ ủng hộ tiếp']
        },
        neutral: {
            Price: ['Giá hơi cao cho phụ kiện', 'Bình thường'],
            Quality: ['Chất lượng tạm được', 'Dùng được thôi'],
            General: ['Như mô tả', 'Không có gì đặc biệt']
        },
        negative: {
            Price: ['Đắt so với chất lượng', 'Giá cao vô lý'],
            Quality: ['Chất liệu kém', 'Dùng vài ngày đã hỏng', 'Không bền'],
            Size: ['Không vừa với máy', 'Size sai so với mô tả'],
            General: ['Rất tệ', 'Không nên mua']
        }
    }
};

class MockShopeeAPI {
    constructor() {
        this.BASE_URL = 'https://partner.shopeemobile.com';
        this.API_VERSION = 'api/v2';
        this.reviewCache = new Map();
    }

    
    async simulateAPICall(ms = 100) {  // Optimized: 500ms → 100ms for demo
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * 1. Shop API - Get shop info
     * Matches: GET /api/v2/shop/get_shop_info
     */
    async getShopInfo(accessToken, shopId) {
        console.log(' Mock: Getting shop info for', shopId);
        await this.simulateAPICall(50);  // Fast for demo
        
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
        await this.simulateAPICall(100);  // Slightly longer for large dataset

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
     * 3. Order API - Get order details (OPTIMIZED with Map)
     * Matches: GET /api/v2/order/get_order_detail
     */
    async getOrderDetail(accessToken, shopId, orderSnList) {
        console.log('📦 Mock: Getting order details', orderSnList);
        await this.simulateAPICall(80);  // Fast lookup

        // OPTIMIZED: Use Map for O(1) lookup instead of O(n) filter
        const orders = orderSnList
            .map(sn => ORDER_MAP.get(sn))
            .filter(Boolean);  // Remove undefined

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
        await this.simulateAPICall(80);  // Fast for demo

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
     * 5. Product API - Get item detail (Batch) - OPTIMIZED with Map
     * Matches: GET /api/v2/product/get_item_base_info
     */
    async getProductBaseInfo(accessToken, shopId, itemIdList) {
        console.log('📦 Mock: Getting item details', itemIdList);
        await this.simulateAPICall(80);  // Fast lookup

        // OPTIMIZED: Use Map for O(1) lookup
        const items = itemIdList
            .map(id => PRODUCT_MAP.get(id))
            .filter(Boolean);

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
        await this.simulateAPICall(50);  // Fast calculation

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
        await this.simulateAPICall(50);  // Fast calculation

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
     * COMBINED ENDPOINT: Get Dashboard Data (OPTIMIZED)
     * This combines multiple API calls into one for frontend efficiency
     * Optimization: Reduced from 5 API calls to 2 API calls + local calculations
     */
    async getDashboardData(accessToken, shopId) {
        console.log('📊 Mock: Getting dashboard data for', shopId);

        try {
            // OPTIMIZED: Only 2 main API calls instead of 5
            const [orderList, productList] = await Promise.all([
                this.getOrderList(accessToken, shopId, {
                    time_from: Math.floor(new Date('2025-01-01').getTime() / 1000), // Jan 1, 2025
                    time_to: Math.floor(new Date('2025-10-31').getTime() / 1000), // Oct 31, 2025
                    page_size: 500 // Get all 250 orders
                }),
                this.getProductList(accessToken, shopId, { page_size: 100 }), // Get all 55 products
            ]);

            const orders = orderList.response.order_list;
            const products = productList.response.item;

            // Get full product details
            const itemIdList = products.map(p => p.item_id);
            const productDetails = await this.getProductBaseInfo(accessToken, shopId, itemIdList);

            // Calculate performance metrics LOCALLY (no API call needed)
            const completedOrders = orders.filter(o => o.order_status === 'COMPLETED');
            const cancelledOrders = orders.filter(o => o.order_status === 'CANCELLED');
            const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total_amount, 0);
            const totalOrders = orders.length;
            const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
            const totalExpense = Math.floor(totalRevenue * 0.75);

            console.log('✅ Dashboard data loaded:', {
                orders: orders.length,
                products: productDetails.response.item_list.length,
                revenue: totalRevenue
            });

            return {
                shop: MOCK_SHOP,  // Static data, no API call needed
                orders: orders,
                products: productDetails.response.item_list,
                performance: {
                    total_revenue: totalRevenue,
                    total_orders: totalOrders,
                    avg_order_value: Math.floor(avgOrderValue),
                    conversion_rate: 9.8,  // Calculated locally
                    return_rate: 2.3,
                    completed_orders: completedOrders.length,
                    cancelled_orders: cancelledOrders.length
                },
                finance: {
                    available_balance: Math.floor((totalRevenue - totalExpense) * 0.6),
                    pending_balance: Math.floor((totalRevenue - totalExpense) * 0.4),
                    total_income: totalRevenue,
                    total_expense: totalExpense
                }
            };
        } catch (error) {
            console.error('❌ Error fetching dashboard data:', error);
            throw error;
        }
    }

    /**
     * Get product reviews with sentiment (ENHANCED)
     * Generates realistic Vietnamese reviews for each specific product
     */
    async getProductReviews(productId) {
        console.log('💬 Mock: Getting reviews for product', productId);
        await this.simulateAPICall(80);

        // Check cache
        if (this.reviewCache.has(productId)) {
            return this.reviewCache.get(productId);
        }

        // Find product
        const product = PRODUCT_MAP.get(parseInt(productId));
        if (!product) {
            throw new Error('Product not found');
        }

        // Determine product category
        const productCategory = this.getProductCategory(product.item_name);
        
        // Generate reviews based on product characteristics
        const reviewConfig = this.getReviewConfig(product);
        const reviews = this.generateProductReviews(product, productCategory, reviewConfig);

        const result = {
            product: {
                item_id: product.item_id,
                item_name: product.item_name,
                price: product.price,
                stock: product.stock,
                image: product.images?.[0] || '',
                rating: this.calculateAverageRating(reviews)
            },
            reviews: reviews.sort((a, b) => b.create_time - a.create_time)
        };

        // Cache result
        this.reviewCache.set(productId, result);

        return result;
    }

    // Helper: Determine product category from name
    getProductCategory(productName) {
        if (productName.includes('iPhone') || productName.includes('Samsung') || 
            productName.includes('Xiaomi') || productName.includes('OPPO') || 
            productName.includes('Realme')) {
            return 'Điện Thoại';
        } else if (productName.includes('MacBook') || productName.includes('Dell') || 
                   productName.includes('Asus') || productName.includes('Lenovo') || 
                   productName.includes('HP') || productName.includes('iPad')) {
            return 'Laptop';
        } else if (productName.includes('AirPods') || productName.includes('Sony') || 
                   productName.includes('Bose') || productName.includes('JBL') || 
                   productName.includes('Buds') || productName.includes('Edifier')) {
            return 'Tai Nghe';
        } else {
            return 'Phụ Kiện';
        }
    }

    // Helper: Get review configuration based on product characteristics
    getReviewConfig(product) {
        const price = product.price;
        const isHighEnd = price > 20000000;
        const isMidRange = price >= 5000000 && price <= 20000000;
        const isBudget = price < 5000000;

        // High-end products: more positive reviews
        if (isHighEnd) {
            return {
                numReviews: Math.floor(Math.random() * 50) + 80, // 80-130 reviews
                positiveRatio: 0.70,
                neutralRatio: 0.20,
                negativeRatio: 0.10
            };
        }
        // Mid-range products: balanced reviews
        else if (isMidRange) {
            return {
                numReviews: Math.floor(Math.random() * 70) + 60, // 60-130 reviews
                positiveRatio: 0.60,
                neutralRatio: 0.25,
                negativeRatio: 0.15
            };
        }
        // Budget products: more mixed reviews
        else {
            return {
                numReviews: Math.floor(Math.random() * 80) + 100, // 100-180 reviews
                positiveRatio: 0.50,
                neutralRatio: 0.30,
                negativeRatio: 0.20
            };
        }
    }

    // Helper: Generate reviews for a specific product
    generateProductReviews(product, category, config) {
        const reviews = [];
        const templates = REVIEW_TEMPLATES[category];

        for (let i = 0; i < config.numReviews; i++) {
            const rand = Math.random();
            let sentiment, rating;
            
            if (rand < config.positiveRatio) {
                sentiment = 'positive';
                rating = Math.floor(Math.random() * 2) + 4; // 4-5 stars
            } else if (rand < config.positiveRatio + config.neutralRatio) {
                sentiment = 'neutral';
                rating = 3; // 3 stars
            } else {
                sentiment = 'negative';
                rating = Math.floor(Math.random() * 2) + 1; // 1-2 stars
            }

            // Generate review text from templates
            const reviewText = this.generateReviewText(templates, sentiment, product);

            const review = {
                review_id: Date.now() + i,
                user_name: this.getRandomBuyerName(),
                rating: rating,
                comment: reviewText,
                create_time: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 90 * 86400),
                images: [],
                likes: Math.floor(Math.random() * (sentiment === 'positive' ? 30 : 10))
            };
            reviews.push(review);
        }

        return reviews;
    }

    // Helper: Generate review text from templates
    generateReviewText(templates, sentiment, product) {
        const sentimentTemplates = templates[sentiment];
        const aspects = Object.keys(sentimentTemplates);
        
        // Pick 2-3 random aspects to comment on
        const numAspects = Math.floor(Math.random() * 2) + 2; // 2-3 aspects
        const selectedAspects = [];
        const usedIndices = new Set();
        
        while (selectedAspects.length < numAspects && selectedAspects.length < aspects.length) {
            const idx = Math.floor(Math.random() * aspects.length);
            if (!usedIndices.has(idx)) {
                usedIndices.add(idx);
                selectedAspects.push(aspects[idx]);
            }
        }

        // Build review text
        const reviewParts = selectedAspects.map(aspect => {
            const aspectReviews = sentimentTemplates[aspect];
            return aspectReviews[Math.floor(Math.random() * aspectReviews.length)];
        });

        return reviewParts.join('. ') + '.';
    }

    // Helper: Get random buyer name
    getRandomBuyerName() {
        const names = [
            'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Hoàng Cường', 'Phạm Minh Đức',
            'Hoàng Văn Em', 'Đặng Thị Phương', 'Vũ Quang Giang', 'Bùi Thị Hoa',
            'Đỗ Văn Inh', 'Ngô Thị Kim', 'Dương Văn Long', 'Mai Thị Mai'
        ];
        return names[Math.floor(Math.random() * names.length)];
    }

    // Helper: Calculate average rating
    calculateAverageRating(reviews) {
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        return (sum / reviews.length).toFixed(1);
    }

    // Helper: Generate request ID
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }
}

export const mockShopeeAPI = new MockShopeeAPI();
