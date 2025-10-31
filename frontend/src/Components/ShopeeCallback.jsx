import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Spin, message, Progress } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { exchangeShopeeToken } from '../store/slices/authSlice';
import { loadDashboardData } from '../store/slices/dashboardSlice';
import './ShopeeCallback.css';

const ShopeeCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [status, setStatus] = useState('processing');
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState('Đang xác thực...');

    useEffect(() => {
        handleCallback();
    }, []);

    const updateProgress = (percent, step) => {
        setProgress(percent);
        setCurrentStep(step);
    };

    const handleCallback = async () => {
        const code = searchParams.get('code');
        const shopId = searchParams.get('shop_id');

        if (!code || !shopId) {
            setStatus('error');
            message.error('Thiếu thông tin xác thực');
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        try {
            // Step 1: Exchange token with Redux
            updateProgress(20, 'Đang xác thực với Shopee...');
            await new Promise(resolve => setTimeout(resolve, 500));

            const result = await dispatch(exchangeShopeeToken({ code, shopId })).unwrap();

            if (!result.access_token) {
                throw new Error('Invalid token response');
            }

            updateProgress(50, 'Đang lưu thông tin đăng nhập...');
            await new Promise(resolve => setTimeout(resolve, 500));

            // Step 2: Load dashboard data
            updateProgress(75, 'Đang tải dữ liệu dashboard...');
            await new Promise(resolve => setTimeout(resolve, 500));

            await dispatch(loadDashboardData({
                accessToken: result.access_token,
                shopId: result.shop_id
            })).unwrap();

            updateProgress(100, 'Hoàn tất!');
            setStatus('success');
            message.success('🎉 Đăng nhập thành công!');

            // Wait a bit to ensure Redux state is fully updated
            await new Promise(resolve => setTimeout(resolve, 300));

            // Redirect to dashboard
            setTimeout(() => {
                console.log('✅ Redirecting to dashboard...');
                navigate('/dashboard', { replace: true });
            }, 1200);

        } catch (error) {
            console.error('❌ OAuth callback error:', error);
            setStatus('error');
            message.error('Đăng nhập thất bại: ' + error);

            setTimeout(() => {
                navigate('/login', { replace: true });
            }, 2000);
        }
    };

    return (
        <div className="shopee-callback-container">
            <div className="callback-card">
                {status === 'processing' && (
                    <>
                        <div className="loading-icon">
                            <Spin
                                indicator={<LoadingOutlined style={{ fontSize: 64 }} spin />}
                                size="large"
                            />
                        </div>
                        <h2>Đang xử lý đăng nhập</h2>
                        <p className="step-text">{currentStep}</p>
                        <Progress
                            percent={progress}
                            strokeColor={{
                                '0%': '#667eea',
                                '100%': '#764ba2',
                            }}
                            showInfo={false}
                            strokeWidth={8}
                        />
                        <p className="progress-text">{progress}%</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="success-icon">
                            <CheckCircleOutlined />
                        </div>
                        <h2>Đăng nhập thành công!</h2>
                        <p>Đang chuyển đến Dashboard...</p>
                        <div className="success-animation">
                            <div className="circle"></div>
                            <div className="circle"></div>
                            <div className="circle"></div>
                        </div>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="error-icon">
                            <CloseCircleOutlined />
                        </div>
                        <h2>Đăng nhập thất bại</h2>
                        <p>Đang quay lại trang đăng nhập...</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default ShopeeCallback;
