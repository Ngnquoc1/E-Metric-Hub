import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

// Async thunk for OAuth initialization
export const initShopeeOAuth = createAsyncThunk(
    'auth/initShopeeOAuth',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.initShopeeOAuth();
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk for token exchange
export const exchangeShopeeToken = createAsyncThunk(
    'auth/exchangeShopeeToken',
    async ({ code, shopId }, { rejectWithValue }) => {
        try {
            const response = await api.exchangeShopeeToken(code, shopId);
            
            // Save to localStorage
            localStorage.setItem('shopee_tokens', JSON.stringify({
                access_token: response.access_token,
                refresh_token: response.refresh_token,
                expires_at: Date.now() + (response.expires_in * 1000),
                shop_id: response.shop_id
            }));
            
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Check existing tokens in localStorage
export const checkAuth = createAsyncThunk(
    'auth/checkAuth',
    async (_, { rejectWithValue }) => {
        try {
            const tokens = JSON.parse(localStorage.getItem('shopee_tokens'));
            
            if (!tokens || !tokens.access_token) {
                return rejectWithValue('No tokens found');
            }

            // Check if token expired
            if (Date.now() > tokens.expires_at) {
                localStorage.removeItem('shopee_tokens');
                return rejectWithValue('Token expired');
            }

            return tokens;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        isAuthenticated: false,
        tokens: null,
        loading: false,
        error: null,
        oauthUrl: null,
    },
    reducers: {
        logout: (state) => {
            state.isAuthenticated = false;
            state.tokens = null;
            state.error = null;
            localStorage.removeItem('shopee_tokens');
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Init OAuth
            .addCase(initShopeeOAuth.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(initShopeeOAuth.fulfilled, (state, action) => {
                state.loading = false;
                state.oauthUrl = action.payload.auth_url;
            })
            .addCase(initShopeeOAuth.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Exchange token
            .addCase(exchangeShopeeToken.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(exchangeShopeeToken.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.tokens = {
                    access_token: action.payload.access_token,
                    refresh_token: action.payload.refresh_token,
                    expires_at: Date.now() + (action.payload.expires_in * 1000),
                    shop_id: action.payload.shop_id
                };
            })
            .addCase(exchangeShopeeToken.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Check auth
            .addCase(checkAuth.pending, (state) => {
                state.loading = true;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.tokens = action.payload;
            })
            .addCase(checkAuth.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.tokens = null;
            });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
