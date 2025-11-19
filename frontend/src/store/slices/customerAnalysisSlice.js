import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Async thunks
export const fetchProductReviews = createAsyncThunk(
    'customerAnalysis/fetchProductReviews',
    async ({ productId, accessToken, shopId }, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/customer-analysis/product/${productId}/reviews`,
                {
                    params: { access_token: accessToken, shop_id: shopId }
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

export const fetchProductInsights = createAsyncThunk(
    'customerAnalysis/fetchProductInsights',
    async ({ productId, accessToken, shopId }, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/customer-analysis/product/${productId}/insights`,
                {
                    params: { access_token: accessToken, shop_id: shopId }
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

export const analyzeReviews = createAsyncThunk(
    'customerAnalysis/analyzeReviews',
    async ({ reviews }, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/customer-analysis/analyze`,
                { reviews }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

export const fetchShopSummary = createAsyncThunk(
    'customerAnalysis/fetchShopSummary',
    async ({ accessToken, shopId }, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/customer-analysis/shop/summary`,
                {
                    params: { access_token: accessToken, shop_id: shopId }
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

const customerAnalysisSlice = createSlice({
    name: 'customerAnalysis',
    initialState: {
        // Current product data
        currentProduct: null,
        reviews: [],
        sentimentAnalysis: null,
        
        // Insights
        insights: null,
        recommendations: [],
        
        // Shop summary
        shopSummary: null,
        
        // UI state
        selectedProduct: null,
        loading: false,
        error: null,
        
        // Filters
        filters: {
            sentiment: 'all', // 'all', 'positive', 'neutral', 'negative'
            aspect: 'all', // 'all' or specific aspect
            sortBy: 'recent' // 'recent', 'rating', 'helpful'
        }
    },
    reducers: {
        setSelectedProduct: (state, action) => {
            state.selectedProduct = action.payload;
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearAnalysis: (state) => {
            state.currentProduct = null;
            state.reviews = [];
            state.sentimentAnalysis = null;
            state.insights = null;
            state.recommendations = [];
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Product Reviews
            .addCase(fetchProductReviews.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProductReviews.fulfilled, (state, action) => {
                state.loading = false;
                state.currentProduct = action.payload.product;
                state.reviews = action.payload.reviews;
                state.sentimentAnalysis = action.payload.sentiment_analysis;
            })
            .addCase(fetchProductReviews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Fetch Product Insights
            .addCase(fetchProductInsights.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProductInsights.fulfilled, (state, action) => {
                state.loading = false;
                state.insights = action.payload;
                state.recommendations = action.payload.recommendations || [];
            })
            .addCase(fetchProductInsights.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Analyze Reviews
            .addCase(analyzeReviews.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(analyzeReviews.fulfilled, (state, action) => {
                state.loading = false;
                state.sentimentAnalysis = action.payload;
            })
            .addCase(analyzeReviews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Fetch Shop Summary
            .addCase(fetchShopSummary.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchShopSummary.fulfilled, (state, action) => {
                state.loading = false;
                state.shopSummary = action.payload;
            })
            .addCase(fetchShopSummary.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const {
    setSelectedProduct,
    setFilters,
    clearAnalysis,
    clearError
} = customerAnalysisSlice.actions;

export default customerAnalysisSlice.reducer;
