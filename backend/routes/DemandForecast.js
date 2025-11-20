import express from 'express';
import { CATEGORIES, MOCK_PRODUCTS, generateOrders } from '../mockData/shopeeData.js';

const router = express.Router();

// Pre-compute products by category for fast lookup
const productsByCategory = MOCK_PRODUCTS.reduce((acc, product) => {
    if (!acc.has(product.category_id)) {
        acc.set(product.category_id, []);
    }
    acc.get(product.category_id).push(product);
    return acc;
}, new Map());

function summarizeCategory(category) {
    const products = productsByCategory.get(category.id) || [];

    const aggregate = products.reduce(
        (stats, product) => {
            const stock = product?.stock_info?.current_stock || 0;
            return {
                totalSales: stats.totalSales + (product.sales || 0),
                totalViews: stats.totalViews + (product.views || 0),
                totalStock: stats.totalStock + stock,
            };
        },
        { totalSales: 0, totalViews: 0, totalStock: 0 }
    );

    return {
        ...category,
        productCount: products.length,
        totalSales: aggregate.totalSales,
        totalViews: aggregate.totalViews,
        totalStock: aggregate.totalStock,
    };
}

/**
 * GET /api/demand-forecast/categories
 * Trả về danh sách category kèm thống kê cơ bản
 */
router.get('/categories', (req, res) => {
    try {
        const categories = CATEGORIES.map(summarizeCategory);
        res.json({ categories });
    } catch (error) {
        console.error('❌ Lỗi khi lấy danh sách category:', error);
        res.status(500).json({ error: 'Không thể lấy danh sách category' });
    }
});

/**
 * GET /api/demand-forecast/categories-with-products
 * Trả về category và toàn bộ sản phẩm nằm trong từng category
 */
router.get('/categories-with-products', (req, res) => {
    try {
        const categories = CATEGORIES.map(category => ({
            ...summarizeCategory(category),
            products: (productsByCategory.get(category.id) || []).map(product => ({
                item_id: product.item_id,
                item_name: product.item_name,
                item_sku: product.item_sku,
                price: product.price_info?.current_price,
                stock: product.stock_info?.current_stock,
                sales: product.sales,
                views: product.views,
                rating_star: product.rating_star,
                category_id: product.category_id,
                category_name: product.category_name,
            })),
        }));

        res.json({ categories });
    } catch (error) {
        console.error('❌ Lỗi khi lấy category và sản phẩm:', error);
        res.status(500).json({ error: 'Không thể lấy dữ liệu category và sản phẩm' });
    }
});

/**
 * GET /api/demand-forecast/categories/:categoryId/products
 * Lấy sản phẩm theo category cụ thể
 */
router.get('/categories/:categoryId/products', (req, res) => {
    try {
        const categoryId = Number(req.params.categoryId);

        if (Number.isNaN(categoryId)) {
            return res.status(400).json({ error: 'categoryId không hợp lệ' });
        }

        const category = CATEGORIES.find(cat => cat.id === categoryId);

        if (!category) {
            return res.status(404).json({ error: 'Không tìm thấy category' });
        }

        const products = productsByCategory.get(categoryId) || [];

        res.json({
            category: summarizeCategory(category),
            products,
        });
    } catch (error) {
        console.error('❌ Lỗi khi lấy sản phẩm theo category:', error);
        res.status(500).json({ error: 'Không thể lấy sản phẩm theo category' });
    }
});

/**
 * GET /api/demand-forecast/products
 * Trả về danh sách sản phẩm, có thể lọc theo category
 */
router.get('/products', (req, res) => {
    try {
        const categoryId = req.query.categoryId ? Number(req.query.categoryId) : null;

        if (req.query.categoryId && Number.isNaN(categoryId)) {
            return res.status(400).json({ error: 'categoryId không hợp lệ' });
        }

        let products = MOCK_PRODUCTS;

        if (categoryId) {
            products = productsByCategory.get(categoryId) || [];
        }

        res.json({
            total: products.length,
            products,
        });
    } catch (error) {
        console.error('❌ Lỗi khi lấy danh sách sản phẩm:', error);
        res.status(500).json({ error: 'Không thể lấy danh sách sản phẩm' });
    }
});

/**
 * Aggregate orders by period to generate historical demand data
 * @param {Array} orders - Array of orders from shopeeData
 * @param {string} productId - Product item_id to filter
 * @param {number} periodCount - Number of periods to generate (24 for 1 year)
 * @returns {Array} Historical data [{period: 1, demand: 150}, ...]
 */
function aggregateOrdersByPeriod(orders, productId, periodCount) {
    const DAYS_PER_PERIOD = 15;
    const periodData = {};
    
    // Calculate start date for the periods (1 year ago from most recent order)
    const timestamps = orders.map(o => o.create_time).filter(t => t);
    if (timestamps.length === 0) {
        // No orders, return empty data
        return Array.from({ length: periodCount }, (_, i) => ({
            period: i + 1,
            demand: 0
        }));
    }
    
    const latestTimestamp = Math.max(...timestamps);
    const startTimestamp = latestTimestamp - (periodCount * DAYS_PER_PERIOD * 24 * 60 * 60);
    const startDate = new Date(startTimestamp * 1000);
    
    // Aggregate orders by period - only count actual sales
    orders.forEach(order => {
        if (!order.create_time || order.create_time < startTimestamp) return;
        if (order.order_status === 'CANCELLED' || order.order_status === 'UNPAID') return;
        
        const orderDate = new Date(order.create_time * 1000);
        const daysSinceStart = Math.floor(
            (orderDate - startDate) / (1000 * 60 * 60 * 24)
        );
        const period = Math.floor(daysSinceStart / DAYS_PER_PERIOD) + 1;
        
        // Only count periods within range
        if (period > 0 && period <= periodCount) {
            order.item_list?.forEach(item => {
                if (String(item.item_id) === String(productId)) {
                    periodData[period] = (periodData[period] || 0) + (item.model_quantity_purchased || 0);
                }
            });
        }
    });
    
    // Fill all periods (0 if no orders)
    const result = [];
    for (let i = 1; i <= periodCount; i++) {
        result.push({
            period: i,
            demand: periodData[i] || 0
        });
    }
    
    return result;
}

/**
 * POST /api/demand-forecast/historical
 * Returns historical demand data for a product based on orders
 */
router.post('/historical', async (req, res) => {
    try {
        const { productId, periods = 6 } = req.body;
        
        if (!productId) {
            return res.status(400).json({ error: 'productId is required' });
        }
        
        console.log(`📊 Aggregating historical data for product ${productId}, ${periods} periods`);
        
        const orders = generateOrders();
        const historicalData = aggregateOrdersByPeriod(
            orders,
            productId,
            periods
        );
        
        console.log(`✅ Generated ${historicalData.length} periods of data`);
        console.log('   Data sample:', historicalData.slice(0, 3));
        
        res.json({ 
            success: true,
            historicalData,
            metadata: {
                productId,
                periods,
                daysPerPeriod: 15,
                totalOrders: orders.length
            }
        });
        
    } catch (error) {
        console.error('❌ Error generating historical data:', error);
        res.status(500).json({ 
            error: 'Failed to generate historical data',
            message: error.message 
        });
    }
});

export default router;
