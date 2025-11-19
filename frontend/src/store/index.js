import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import dashboardReducer from './slices/dashboardSlice';
import customerAnalysisReducer from './slices/customerAnalysisSlice';
import demandForecastReducer from './slices/DemandForecastSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        dashboard: dashboardReducer,
        customerAnalysis: customerAnalysisReducer,
        demandForecast: demandForecastReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types
                ignoredActions: ['auth/checkAuth/fulfilled'],
            },
        }),
});

export default store;
