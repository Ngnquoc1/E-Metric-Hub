// Mock Shopee OAuth Service - Giả lập hoàn toàn flow OAuth của Shopee

class MockShopeeAuthService {
    constructor() {
        this.MOCK_PARTNER_ID = '1000001';
        this.MOCK_PARTNER_KEY = 'mock_partner_key_123456';
        this.MOCK_REDIRECT_URL = 'http://localhost:5173/auth/shopee/callback';
        
        // Simulate token storage
        this.tokens = new Map();
    }

    /**
     * Step 1: Giả lập redirect tới Shopee OAuth page
     * Trong thực tế: window.location.href = shopee_oauth_url
     */
    initiateOAuth() {
        const timestamp = Math.floor(Date.now() / 1000);
        const mockAuthCode = this.generateMockAuthCode();
        
        // Store auth code for later exchange
        sessionStorage.setItem('mock_shopee_auth_code', mockAuthCode);
        sessionStorage.setItem('mock_shopee_shop_id', '123456789');
        
        // Simulate Shopee OAuth page
        console.log('🔐 Redirecting to Shopee OAuth page...');
        console.log('Mock Auth URL:', {
            partner_id: this.MOCK_PARTNER_ID,
            timestamp,
            redirect_url: this.MOCK_REDIRECT_URL,
        });
        
        // Simulate user approval - auto-redirect back after 2 seconds
        setTimeout(() => {
            const callbackUrl = `${this.MOCK_REDIRECT_URL}?code=${mockAuthCode}&shop_id=123456789`;
            console.log('✅ User approved! Redirecting back to:', callbackUrl);
            
            // Trigger callback
            window.location.href = callbackUrl;
        }, 2000);
    }

    /**
     * Step 2: Exchange auth code for access token
     */
    async exchangeToken(authCode, shopId) {
        console.log('🔄 Exchanging auth code for access token...');
        
        // Simulate API call delay
        await this.simulateDelay(1000);
        
        if (authCode !== sessionStorage.getItem('mock_shopee_auth_code')) {
            throw new Error('Invalid authorization code');
        }
        
        // Generate mock tokens
        const accessToken = this.generateMockAccessToken();
        const refreshToken = this.generateMockRefreshToken();
        const expiresIn = 14 * 24 * 60 * 60; // 14 days
        
        const tokenData = {
            access_token: accessToken,
            refresh_token: refreshToken,
            expire_in: expiresIn,
            expires_at: Date.now() + expiresIn * 1000,
            shop_id: parseInt(shopId),
            partner_id: parseInt(this.MOCK_PARTNER_ID),
        };
        
        // Store tokens
        this.tokens.set(shopId, tokenData);
        localStorage.setItem(`shopee_tokens_${shopId}`, JSON.stringify(tokenData));
        
        console.log('✅ Token exchange successful:', {
            shop_id: shopId,
            expires_in: `${expiresIn / 86400} days`,
        });
        
        return {
            error: '',
            message: '',
            warning: '',
            request_id: `req-token-${Date.now()}`,
            access_token: accessToken,
            refresh_token: refreshToken,
            expire_in: expiresIn,
            partner_id: parseInt(this.MOCK_PARTNER_ID),
            shop_id_list: [parseInt(shopId)],
        };
    }

    /**
     * Step 3: Refresh access token
     */
    async refreshAccessToken(shopId, refreshToken) {
        console.log('🔄 Refreshing access token...');
        
        await this.simulateDelay(800);
        
        const storedTokens = this.tokens.get(shopId);
        if (!storedTokens || storedTokens.refresh_token !== refreshToken) {
            throw new Error('Invalid refresh token');
        }
        
        // Generate new tokens
        const newAccessToken = this.generateMockAccessToken();
        const newRefreshToken = this.generateMockRefreshToken();
        const expiresIn = 14 * 24 * 60 * 60;
        
        const tokenData = {
            access_token: newAccessToken,
            refresh_token: newRefreshToken,
            expire_in: expiresIn,
            expires_at: Date.now() + expiresIn * 1000,
            shop_id: parseInt(shopId),
            partner_id: parseInt(this.MOCK_PARTNER_ID),
        };
        
        this.tokens.set(shopId, tokenData);
        localStorage.setItem(`shopee_tokens_${shopId}`, JSON.stringify(tokenData));
        
        console.log('✅ Token refresh successful');
        
        return {
            error: '',
            message: '',
            request_id: `req-refresh-${Date.now()}`,
            access_token: newAccessToken,
            refresh_token: newRefreshToken,
            expire_in: expiresIn,
            partner_id: parseInt(this.MOCK_PARTNER_ID),
            shop_id_list: [parseInt(shopId)],
        };
    }

    /**
     * Get stored tokens
     */
    getStoredTokens(shopId) {
        const stored = localStorage.getItem(`shopee_tokens_${shopId}`);
        if (stored) {
            const tokenData = JSON.parse(stored);
            
            // Check if token expired
            if (tokenData.expires_at < Date.now()) {
                console.warn('⚠️ Access token expired, need to refresh');
                return null;
            }
            
            return tokenData;
        }
        return null;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(shopId) {
        const tokens = this.getStoredTokens(shopId);
        return tokens !== null;
    }

    /**
     * Logout - clear tokens
     */
    logout(shopId) {
        this.tokens.delete(shopId);
        localStorage.removeItem(`shopee_tokens_${shopId}`);
        sessionStorage.removeItem('mock_shopee_auth_code');
        sessionStorage.removeItem('mock_shopee_shop_id');
        console.log('👋 Logged out from Shopee');
    }

    // Helper methods
    generateMockAuthCode() {
        return 'AUTH_' + Math.random().toString(36).substr(2, 16).toUpperCase();
    }

    generateMockAccessToken() {
        return 'ACCESS_' + Math.random().toString(36).substr(2, 32).toUpperCase();
    }

    generateMockRefreshToken() {
        return 'REFRESH_' + Math.random().toString(36).substr(2, 32).toUpperCase();
    }

    async simulateDelay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

export const mockShopeeAuth = new MockShopeeAuthService();
