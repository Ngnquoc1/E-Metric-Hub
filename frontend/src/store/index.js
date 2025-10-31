import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import dashboardReducer from './slices/dashboardSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        dashboard: dashboardReducer,
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
