import express from 'express';
import { CATEGORIES, MOCK_PRODUCTS } from '../mockData/shopeeData.js';

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

export default router;

