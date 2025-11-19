import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const fetchDemandCategories = createAsyncThunk(
    'demandForecast/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/demand-forecast/categories`);
            return response.data.categories || [];
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);
export const fetchDemandInsights = createAsyncThunk(
    'demandForecast/fetchDemandInsights',
    async (prompt, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/ai/simple-prompt`, { prompt });
            const raw = response.data?.reply || response.data?.ai_response || '';
            const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
            try {
                return JSON.parse(cleaned);
            } catch (parseError) {
                console.error('AI insight parse error:', parseError, cleaned);
                throw new Error('AI response is not valid JSON');
            }
        } catch (error) {
            const message = error.response?.data?.error || error.message || 'Failed to generate insights from AI';
            return rejectWithValue(message);
        }
    }
);
export const fetchDemandProducts = createAsyncThunk(
    'demandForecast/fetchProducts',
    async (categoryId, { rejectWithValue }) => {
        try {
            if (categoryId && categoryId !== 'all') {
                const response = await axios.get(
                    `${API_BASE_URL}/demand-forecast/categories/${categoryId}/products`
                );
                return {
                    category: response.data.category,
                    products: response.data.products || [],
                };
            }

            const response = await axios.get(`${API_BASE_URL}/demand-forecast/products`);
            return {
                category: null,
                products: response.data.products || [],
            };
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

const demandForecastSlice = createSlice({
    name: 'demandForecast',
    initialState: {
        categories: [],
        products: [],
        selectedCategoryId: 'all',
        selectedProductId: 'all',
        categoryStats: null,
        loadingCategories: false,
        loadingProducts: false,
        loadingInsights: false,
        insightsData: null,
        insightsError: null,
        error: null,
        lastUpdated: null,
    },
    reducers: {
        setSelectedCategory(state, action) {
            state.selectedCategoryId = action.payload;
            state.selectedProductId = 'all';
        },
        setSelectedProduct(state, action) {
            state.selectedProductId = action.payload;
        },
        clearDemandError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Categories
            .addCase(fetchDemandCategories.pending, (state) => {
                state.loadingCategories = true;
                state.error = null;
            })
            .addCase(fetchDemandCategories.fulfilled, (state, action) => {
                state.loadingCategories = false;
                state.categories = action.payload;
                state.lastUpdated = Date.now();
            })
            .addCase(fetchDemandCategories.rejected, (state, action) => {
                state.loadingCategories = false;
                state.error = action.payload;
            })

            // Products
            .addCase(fetchDemandProducts.pending, (state) => {
                state.loadingProducts = true;
                state.error = null;
            })
            .addCase(fetchDemandProducts.fulfilled, (state, action) => {
                state.loadingProducts = false;
                state.products = action.payload.products;
                state.categoryStats = action.payload.category;
                state.lastUpdated = Date.now();
            })
            .addCase(fetchDemandProducts.rejected, (state, action) => {
                state.loadingProducts = false;
                state.error = action.payload;
            })

            // Insights
            .addCase(fetchDemandInsights.pending, (state) => {
                state.loadingInsights = true;
                state.insightsError = null;
            })
            .addCase(fetchDemandInsights.fulfilled, (state, action) => {
                state.loadingInsights = false;
                state.insightsData = action.payload;
            })
            .addCase(fetchDemandInsights.rejected, (state, action) => {
                state.loadingInsights = false;
                state.insightsError = action.payload;
            });
    },
});

export const {
    setSelectedCategory,
    setSelectedProduct,
    clearDemandError,
} = demandForecastSlice.actions;

export default demandForecastSlice.reducer;

