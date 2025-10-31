import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables IMMEDIATELY
dotenv.config({ path: join(__dirname, '..', '.env') });

// Fallback: Set USE_MOCK_MODE if not loaded
if (!process.env.USE_MOCK_MODE) {
    console.log('⚠️ USE_MOCK_MODE not found in .env, defaulting to true');
    process.env.USE_MOCK_MODE = 'true';
}

// Export for verification
export const config = {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
    USE_MOCK_MODE: process.env.USE_MOCK_MODE === 'true',
    SHOPEE_PARTNER_ID: process.env.SHOPEE_PARTNER_ID,
    SHOPEE_PARTNER_KEY: process.env.SHOPEE_PARTNER_KEY,
    SHOPEE_REDIRECT_URL: process.env.SHOPEE_REDIRECT_URL
};
