// API Service - Tích hợp với Backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class APIService {
    /**
     * Auth APIs
     */
    async initShopeeOAuth() {
        const response = await fetch(`${API_BASE_URL}/auth/shopee/init`);
        if (!response.ok) {
            throw new Error('Failed to initialize OAuth');
        }
        return response.json();
    }

    async exchangeShopeeToken(code, shopId) {
        const response = await fetch(`${API_BASE_URL}/auth/shopee/callback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code,
                shop_id: shopId,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Token exchange failed');
        }

        return response.json();
    }

    async refreshShopeeToken(shopId, refreshToken) {
        const response = await fetch(`${API_BASE_URL}/auth/shopee/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                shop_id: shopId,
                refresh_token: refreshToken,
            }),
        });

        if (!response.ok) {
            throw new Error('Token refresh failed');
        }

        return response.json();
    }

    /**
     * Shopee Data APIs
     */
    async getShopInfo(accessToken, shopId) {
        const response = await fetch(
            `${API_BASE_URL}/shopee/shop/info?access_token=${accessToken}&shop_id=${shopId}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch shop info');
        }

        return response.json();
    }

    async getDashboardData(accessToken, shopId) {
        const response = await fetch(
            `${API_BASE_URL}/shopee/dashboard?access_token=${accessToken}&shop_id=${shopId}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch dashboard data');
        }

        return response.json();
    }

    async getOrderList(accessToken, shopId, params = {}) {
        const queryParams = new URLSearchParams({
            access_token: accessToken,
            shop_id: shopId,
            ...params,
        });

        const response = await fetch(`${API_BASE_URL}/shopee/orders/list?${queryParams}`);

        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }

        return response.json();
    }

    async getProductList(accessToken, shopId, params = {}) {
        const queryParams = new URLSearchParams({
            access_token: accessToken,
            shop_id: shopId,
            ...params,
        });

        const response = await fetch(`${API_BASE_URL}/shopee/products/list?${queryParams}`);

        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }

        return response.json();
    }
}

export const api = new APIService();
