// Load env FIRST before anything else
import '../config/env.js';

import express from 'express';
import crypto from 'crypto';
import axios from 'axios';
import { mockShopeeAuth } from '../services/mockShopeeAuth.js';

const router = express.Router();

// Debug: Log environment variable
console.log('🔍 Environment Check (auth.js):');
console.log('  - process.env.USE_MOCK_MODE:', JSON.stringify(process.env.USE_MOCK_MODE));
console.log('  - Type:', typeof process.env.USE_MOCK_MODE);
console.log('  - Comparison result:', process.env.USE_MOCK_MODE === 'true');

const USE_MOCK = process.env.USE_MOCK_MODE === 'true';

/**
 * Step 1: Generate Shopee OAuth URL
 * GET /api/auth/shopee/init
 */
router.get('/shopee/init', (req, res) => {
    try {
        console.log('🔐 OAuth init requested, USE_MOCK:', USE_MOCK);
        
        if (USE_MOCK) {
            // Mock mode
            const mockData = mockShopeeAuth.initiateOAuth();
            console.log('✅ Mock OAuth initiated:', mockData);
            return res.json({
                success: true,
                ...mockData
            });
        }

        // Real Shopee OAuth
        const partnerId = process.env.SHOPEE_PARTNER_ID;
        const partnerKey = process.env.SHOPEE_PARTNER_KEY;
        const redirectUrl = process.env.SHOPEE_REDIRECT_URL;
        const timestamp = Math.floor(Date.now() / 1000);

        // Generate sign
        const baseString = `${partnerId}/api/v2/shop/auth_partner${timestamp}`;
        const sign = crypto
            .createHmac('sha256', partnerKey)
            .update(baseString)
            .digest('hex');

        const authUrl = `https://partner.shopeemobile.com/api/v2/shop/auth_partner?partner_id=${partnerId}&timestamp=${timestamp}&sign=${sign}&redirect=${encodeURIComponent(redirectUrl)}`;

        res.json({
            success: true,
            auth_url: authUrl,
            partner_id: partnerId,
            timestamp,
        });
    } catch (error) {
        console.error('❌ Auth init error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Step 2: Handle OAuth callback and exchange token
 * POST /api/auth/shopee/callback
 */
router.post('/shopee/callback', async (req, res) => {
    try {
        const { code, shop_id } = req.body;

        console.log('🔄 Token exchange requested:', { code, shop_id, USE_MOCK });

        if (!code || !shop_id) {
            return res.status(400).json({ success: false, error: 'Missing code or shop_id' });
        }

        if (USE_MOCK) {
            // Mock mode
            console.log('✅ Using mock token exchange');
            const tokenData = await mockShopeeAuth.exchangeToken(code, shop_id);
            return res.json({
                success: true,
                ...tokenData
            });
        }

        // Real Shopee API
        const partnerId = process.env.SHOPEE_PARTNER_ID;
        const partnerKey = process.env.SHOPEE_PARTNER_KEY;
        const timestamp = Math.floor(Date.now() / 1000);

        // Generate sign
        const baseString = `${partnerId}/api/v2/auth/token/get${timestamp}`;
        const sign = crypto
            .createHmac('sha256', partnerKey)
            .update(baseString)
            .digest('hex');

        // Exchange token
        const response = await axios.post(
            'https://partner.shopeemobile.com/api/v2/auth/token/get',
            {
                code,
                shop_id: parseInt(shop_id),
                partner_id: parseInt(partnerId),
            },
            {
                params: {
                    partner_id: partnerId,
                    timestamp,
                    sign,
                },
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('❌ Token exchange error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            details: error.response?.data,
        });
    }
});

/**
 * Step 3: Refresh access token
 * POST /api/auth/shopee/refresh
 */
router.post('/shopee/refresh', async (req, res) => {
    try {
        const { shop_id, refresh_token } = req.body;

        console.log('🔄 Token refresh requested:', { shop_id, USE_MOCK });

        if (!shop_id || !refresh_token) {
            return res.status(400).json({ success: false, error: 'Missing shop_id or refresh_token' });
        }

        if (USE_MOCK) {
            // Mock mode
            console.log('✅ Using mock token refresh');
            const tokenData = await mockShopeeAuth.refreshAccessToken(shop_id, refresh_token);
            return res.json({
                success: true,
                ...tokenData
            });
        }

        // Real Shopee API
        const partnerId = process.env.SHOPEE_PARTNER_ID;
        const partnerKey = process.env.SHOPEE_PARTNER_KEY;
        const timestamp = Math.floor(Date.now() / 1000);

        // Generate sign
        const baseString = `${partnerId}/api/v2/auth/access_token/get${timestamp}`;
        const sign = crypto
            .createHmac('sha256', partnerKey)
            .update(baseString)
            .digest('hex');

        const response = await axios.post(
            'https://partner.shopeemobile.com/api/v2/auth/access_token/get',
            {
                refresh_token,
                shop_id: parseInt(shop_id),
                partner_id: parseInt(partnerId),
            },
            {
                params: {
                    partner_id: partnerId,
                    timestamp,
                    sign,
                },
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('❌ Token refresh error:', error);
        res.status(500).json({
            error: error.message,
            details: error.response?.data,
        });
    }
});

export default router;
