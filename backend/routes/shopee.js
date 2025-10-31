// Load env FIRST before anything else
import '../config/env.js';

import express from 'express';
import crypto from 'crypto';
import axios from 'axios';
import { mockShopeeAPI } from '../services/mockShopeeAPI.js';

const router = express.Router();
const USE_MOCK = process.env.USE_MOCK_MODE === 'true';

/**
 * Helper: Generate Shopee API signature
 */
function generateSign(partnerId, path, timestamp, accessToken, shopId) {
    const partnerKey = process.env.SHOPEE_PARTNER_KEY;
    const baseString = `${partnerId}${path}${timestamp}${accessToken}${shopId}`;
    return crypto.createHmac('sha256', partnerKey).update(baseString).digest('hex');
}

/**
 * Helper: Make authenticated Shopee API call
 */
async function callShopeeAPI(path, params, accessToken, shopId) {
    const partnerId = process.env.SHOPEE_PARTNER_ID;
    const timestamp = Math.floor(Date.now() / 1000);
    const sign = generateSign(partnerId, path, timestamp, accessToken, shopId);

    const response = await axios.get(`https://partner.shopeemobile.com${path}`, {
        params: {
            partner_id: partnerId,
            timestamp,
            sign,
            access_token: accessToken,
            shop_id: shopId,
            ...params,
        },
    });

    return response.data;
}

/**
 * Get shop info
 * GET /api/shopee/shop/info
 */
router.get('/shop/info', async (req, res) => {
    try {
        const { access_token, shop_id } = req.query;

        if (!access_token || !shop_id) {
            return res.status(400).json({ error: 'Missing access_token or shop_id' });
        }

        if (USE_MOCK) {
            const data = await mockShopeeAPI.getShopInfo(access_token, shop_id);
            return res.json(data);
        }

        const data = await callShopeeAPI('/api/v2/shop/get_shop_info', {}, access_token, shop_id);
        res.json(data);
    } catch (error) {
        console.error('❌ Get shop info error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get order list
 * GET /api/shopee/orders/list
 */
router.get('/orders/list', async (req, res) => {
    try {
        const { access_token, shop_id, time_from, time_to, page_size, cursor } = req.query;

        if (!access_token || !shop_id) {
            return res.status(400).json({ error: 'Missing access_token or shop_id' });
        }

        const params = {
            time_range_field: 'create_time',
            time_from: time_from || Math.floor(Date.now() / 1000) - 30 * 86400,
            time_to: time_to || Math.floor(Date.now() / 1000),
            page_size: page_size || 50,
            cursor: cursor || '',
        };

        if (USE_MOCK) {
            const data = await mockShopeeAPI.getOrderList(access_token, shop_id, params);
            return res.json(data);
        }

        const data = await callShopeeAPI('/api/v2/order/get_order_list', params, access_token, shop_id);
        res.json(data);
    } catch (error) {
        console.error('❌ Get order list error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get order details
 * POST /api/shopee/orders/detail
 */
router.post('/orders/detail', async (req, res) => {
    try {
        const { access_token, shop_id, order_sn_list } = req.body;

        if (!access_token || !shop_id || !order_sn_list) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        if (USE_MOCK) {
            const data = await mockShopeeAPI.getOrderDetail(access_token, shop_id, order_sn_list);
            return res.json(data);
        }

        const data = await callShopeeAPI(
            '/api/v2/order/get_order_detail',
            { order_sn_list: order_sn_list.join(',') },
            access_token,
            shop_id
        );
        res.json(data);
    } catch (error) {
        console.error('❌ Get order detail error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get product list
 * GET /api/shopee/products/list
 */
router.get('/products/list', async (req, res) => {
    try {
        const { access_token, shop_id, offset, page_size, item_status } = req.query;

        if (!access_token || !shop_id) {
            return res.status(400).json({ error: 'Missing access_token or shop_id' });
        }

        const params = {
            offset: offset || 0,
            page_size: page_size || 30,
            item_status: item_status ? item_status.split(',') : [],
        };

        if (USE_MOCK) {
            const data = await mockShopeeAPI.getProductList(access_token, shop_id, params);
            return res.json(data);
        }

        const data = await callShopeeAPI('/api/v2/product/get_item_list', params, access_token, shop_id);
        res.json(data);
    } catch (error) {
        console.error('❌ Get product list error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get product details
 * POST /api/shopee/products/detail
 */
router.post('/products/detail', async (req, res) => {
    try {
        const { access_token, shop_id, item_id_list } = req.body;

        if (!access_token || !shop_id || !item_id_list) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        if (USE_MOCK) {
            const data = await mockShopeeAPI.getProductBaseInfo(access_token, shop_id, item_id_list);
            return res.json(data);
        }

        const data = await callShopeeAPI(
            '/api/v2/product/get_item_base_info',
            { item_id_list: item_id_list.join(',') },
            access_token,
            shop_id
        );
        res.json(data);
    } catch (error) {
        console.error('❌ Get product detail error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get shop performance
 * GET /api/shopee/shop/performance
 */
router.get('/shop/performance', async (req, res) => {
    try {
        const { access_token, shop_id } = req.query;

        if (!access_token || !shop_id) {
            return res.status(400).json({ error: 'Missing access_token or shop_id' });
        }

        if (USE_MOCK) {
            const data = await mockShopeeAPI.getShopPerformance(access_token, shop_id);
            return res.json(data);
        }

        // Note: Real API endpoint may vary
        const data = await callShopeeAPI('/api/v2/shop/get_shop_performance', {}, access_token, shop_id);
        res.json(data);
    } catch (error) {
        console.error('❌ Get shop performance error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get dashboard data (aggregated)
 * GET /api/shopee/dashboard
 */
router.get('/dashboard', async (req, res) => {
    try {
        const { access_token, shop_id } = req.query;

        if (!access_token || !shop_id) {
            return res.status(400).json({ error: 'Missing access_token or shop_id' });
        }

        if (USE_MOCK) {
            const data = await mockShopeeAPI.getDashboardData(access_token, shop_id);
            return res.json(data);
        }

        // Aggregate data from multiple endpoints
        const [shopInfo, orderList, productList, performance] = await Promise.all([
            callShopeeAPI('/api/v2/shop/get_shop_info', {}, access_token, shop_id),
            callShopeeAPI(
                '/api/v2/order/get_order_list',
                {
                    time_range_field: 'create_time',
                    time_from: Math.floor(Date.now() / 1000) - 30 * 86400,
                    time_to: Math.floor(Date.now() / 1000),
                    page_size: 100,
                },
                access_token,
                shop_id
            ),
            callShopeeAPI('/api/v2/product/get_item_list', { page_size: 100 }, access_token, shop_id),
            callShopeeAPI('/api/v2/shop/get_shop_performance', {}, access_token, shop_id),
        ]);

        res.json({
            shop: shopInfo.response,
            orders: orderList.response,
            products: productList.response,
            performance: performance.response,
        });
    } catch (error) {
        console.error('❌ Get dashboard error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
