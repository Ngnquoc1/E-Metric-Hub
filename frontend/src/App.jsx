import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { checkAuth } from './store/slices/authSlice';
import AppLayout from './Components/AppLayout';
import LandingPage from './Components/LandingPage';
import DashboardPage from './Components/DashboardPage';
import ShopeeLogin from './Components/ShopeeLogin';
import ShopeeCallback from './Components/ShopeeCallback';
import AIAssistantPage from './Components/AIAssistantPage';
import FeaturesPage from './Components/FeaturesPage';
import ErrorBoundary from './Components/ErrorBoundary';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const style = { padding: '50px', textAlign: 'center' };

  // 🔑 Check authentication on app startup
  useEffect(() => {
    console.log('🔍 App mounted - Checking auth from localStorage...');
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="features" element={<FeaturesPage />} />
            <Route path="pricing" element={<div style={style}>Pricing Page (Coming Soon)</div>} />
            <Route path="ai-assistant" element={<AIAssistantPage />} />
            <Route path="login" element={<ShopeeLogin/>} />
            <Route path="auth/shopee/callback" element={<ShopeeCallback />} />
          </Route>
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
