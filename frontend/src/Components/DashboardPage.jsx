import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tabs, Card, Row, Col, Statistic, Table, Tag, message, Spin, Button, Empty } from 'antd';
import {
    ArrowUpOutlined,
    ArrowDownOutlined,
    DollarOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { checkAuth, logout as logoutAction } from '../store/slices/authSlice';
import { loadDashboardData, clearDashboardData } from '../store/slices/dashboardSlice';
import ShopeeLogin from './ShopeeLogin';
import './DashboardPage.css';

const { TabPane } = Tabs;

const DashboardPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('1');
    
    // Redux state
    const { isAuthenticated, tokens, loading: authLoading } = useSelector((state) => state.auth);
    const { transformedData: shopeeData, loading: dataLoading } = useSelector((state) => state.dashboard);
    
    const loading = authLoading || dataLoading;

    // Check auth on mount (only if not already authenticated)
    useEffect(() => {
        if (!isAuthenticated && !tokens) {
            dispatch(checkAuth())
                .unwrap()
                .then((tokens) => {
                    console.log(' Auth check successful, loading data...');
                    // Auto load data after auth check
                    dispatch(loadDashboardData({
                        accessToken: tokens.access_token,
                        shopId: tokens.shop_id
                    }));
                })
                .catch(() => {
                    console.log('Not authenticated');
                });
        } else if (isAuthenticated && tokens && !shopeeData) {
            console.log('Already authenticated, loading data...');
            // If authenticated but data not loaded, load it
            dispatch(loadDashboardData({
                accessToken: tokens.access_token,
                shopId: tokens.shop_id
            }));
        }
    }, [dispatch, isAuthenticated, tokens, shopeeData]);

    const handleRefresh = () => {
        if (tokens) {
            dispatch(loadDashboardData({
                accessToken: tokens.access_token,
                shopId: tokens.shop_id
            }))
                .unwrap()
                .then(() => {
                    message.success('Dữ liệu đã được làm mới!');
                })
                .catch((error) => {
                    message.error('Không thể tải dữ liệu: ' + error);
                });
        }
    };

    const handleLoginSuccess = (newTokens) => {
        // Login success will be handled by ShopeeCallback component
        // which dispatches exchangeShopeeToken
        dispatch(loadDashboardData({
            accessToken: newTokens.access_token,
            shopId: newTokens.shop_id
        }));
    };

    const handleLogout = () => {
        dispatch(logoutAction());
        dispatch(clearDashboardData());
        message.info('Đã đăng xuất');
    };

    // Show loading spinner while checking auth
    if (authLoading && !isAuthenticated) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" tip="Đang kiểm tra đăng nhập..." />
            </div>
        );
    }

    // Show login page if not authenticated (after check is done)
    if (!isAuthenticated && !tokens) {
        console.log(' Not authenticated, showing login');
        return (
            <div className="dashboard-login-prompt">
                <Card className="login-card">
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <div>
                                <h2>Chưa kết nối với Shopee</h2>
                                <p>Vui lòng đăng nhập để xem dữ liệu Dashboard</p>
                            </div>
                        }
                    >
                        <ShopeeLogin 
                            onLoginSuccess={handleLoginSuccess}
                            onLogout={handleLogout}
                        />
                    </Empty>
                </Card>
            </div>
        );
    }

    // Show loading spinner
    if (loading) {
        return (
            <div className="dashboard-loading">
                <Spin size="large" tip="Đang tải dữ liệu Dashboard..." />
            </div>
        );
    }

    // Use Shopee data if available, otherwise fallback to empty data
    const displayData = shopeeData || {
        revenueData: [],
        topProducts: [],
        orderStatusData: [],
        categoryData: [],
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        avgOrderValue: 0,
        conversionRate: 0,
        returnRate: 0
    };

    // Use real data from Redux, fallback to empty arrays if not available
    const revenueData = displayData.revenueData.length > 0 ? displayData.revenueData : [];
    const categoryData = displayData.categoryData.length > 0 ? displayData.categoryData : [];
    const productPerformance = displayData.topProducts.length > 0 ? displayData.topProducts : [];

    // Generate colors for category data
    const categoryColors = ['#0a58d0', '#1976d2', '#42a5f5', '#64b5f6', '#90caf9'];
    const categoryDataWithColors = categoryData.map((cat, idx) => ({
        ...cat,
        color: categoryColors[idx % categoryColors.length]
    }));

    // Table columns for products
    const productColumns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'name',
            key: 'name',
            width: 250,
        },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            key: 'category',
        },
        {
            title: 'Số lượng bán',
            dataIndex: 'sales',
            key: 'sales',
            sorter: (a, b) => a.sales - b.sales,
        },
        {
            title: 'Doanh thu',
            dataIndex: 'revenue',
            key: 'revenue',
        },
        {
            title: 'Tăng trưởng',
            dataIndex: 'growth',
            key: 'growth',
            render: (growth) => (
                <span style={{ color: growth > 0 ? '#52c41a' : '#ff4d4f' }}>
                    {growth > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(growth)}%
                </span>
            ),
            sorter: (a, b) => a.growth - b.growth,
        },
        {
            title: 'Tồn kho',
            dataIndex: 'stock',
            key: 'stock',
            render: (stock, record) => (
                <Tag color={record.status === 'low' ? 'red' : stock > 100 ? 'green' : 'orange'}>
                    {stock} sản phẩm
                </Tag>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'hot' ? 'red' : status === 'low' ? 'orange' : 'blue'}>
                    {status === 'hot' ? '🔥 Hot' : status === 'low' ? '⚠️ Thấp' : '✓ Bình thường'}
                </Tag>
            ),
        },
    ];

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <div className="header-left">
                    <h1 className="dashboard-title">
                        {shopeeData?.shopInfo?.shop_name || 'Dashboard Analytics'}
                    </h1>
                    <p className="dashboard-subtitle">
                        {isAuthenticated ? 'Dữ liệu từ Shopee Shop' : 'Theo dõi hiệu suất kinh doanh'}
                    </p>
                </div>
                <div className="header-right">
                    <Button 
                        icon={<ReloadOutlined />} 
                        onClick={handleRefresh}
                        loading={loading}
                    >
                        Làm mới
                    </Button>
                    <ShopeeLogin 
                        onLoginSuccess={handleLoginSuccess}
                        onLogout={handleLogout}
                    />
                </div>
            </div>

            <Tabs activeKey={activeTab} onChange={setActiveTab} size="large" className="dashboard-tabs">
                {/* Tab 1: Tổng quan */}
                <TabPane tab="📊 Tổng quan" key="1">
                    {/* KPI Cards with Real Data */}
                    <Row gutter={[16, 16]} className="kpi-row">
                        <Col xs={24} sm={12} lg={6}>
                            <Card className="kpi-card">
                                <Statistic
                                    title="Tổng doanh thu"
                                    value={displayData.totalRevenue}
                                    precision={0}
                                    valueStyle={{ color: '#0a58d0' }}
                                    prefix={<DollarOutlined />}
                                    suffix="K ₫"
                                />
                                <div className="kpi-trend">
                                    <span style={{ color: '#666', marginLeft: 4 }}>
                                        {displayData.completedOrders} đơn hoàn thành
                                    </span>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card className="kpi-card">
                                <Statistic
                                    title="Tổng đơn hàng"
                                    value={displayData.totalOrders}
                                    valueStyle={{ color: '#1976d2' }}
                                    prefix={<ShoppingCartOutlined />}
                                />
                                <div className="kpi-trend">
                                    <span style={{ color: '#666', marginLeft: 4 }}>
                                        Giá trị TB: {displayData.avgOrderValue}K ₫
                                    </span>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card className="kpi-card">
                                <Statistic
                                    title="Tổng sản phẩm"
                                    value={displayData.totalProducts}
                                    valueStyle={{ color: '#52c41a' }}
                                    prefix={<UserOutlined />}
                                />
                                <div className="kpi-trend">
                                    <span style={{ color: '#666', marginLeft: 4 }}>
                                        {displayData.topProducts.length} sản phẩm bán chạy
                                    </span>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card className="kpi-card">
                                <Statistic
                                    title="Tỷ lệ chuyển đổi"
                                    value={displayData.conversionRate}
                                    precision={1}
                                    valueStyle={{ color: '#fa8c16' }}
                                    suffix="%"
                                />
                                <div className="kpi-trend">
                                    <span style={{ color: '#666', marginLeft: 4 }}>
                                        Tỷ lệ hoàn thành: {Math.round((displayData.completedOrders / displayData.totalOrders) * 100 || 0)}%
                                    </span>
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    {/* Charts Row */}
                    <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                        <Col xs={24} lg={16}>
                            <Card title="Doanh thu & Đơn hàng" className="chart-card">
                                <ResponsiveContainer width="100%" height={350}>
                                    <AreaChart data={revenueData}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0a58d0" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#0a58d0" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#52c41a" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#52c41a" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="month" />
                                        <YAxis yAxisId="left" />
                                        <YAxis yAxisId="right" orientation="right" />
                                        <Tooltip />
                                        <Legend />
                                        <Area
                                            yAxisId="left"
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#0a58d0"
                                            fillOpacity={1}
                                            fill="url(#colorRevenue)"
                                            name="Doanh thu (₫1000)"
                                        />
                                        <Area
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="orders"
                                            stroke="#52c41a"
                                            fillOpacity={1}
                                            fill="url(#colorOrders)"
                                            name="Đơn hàng"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Card>
                        </Col>
                        <Col xs={24} lg={8}>
                            <Card title="Phân bố danh mục" className="chart-card">
                                <ResponsiveContainer width="100%" height={350}>
                                    <PieChart>
                                        <Pie
                                            data={categoryDataWithColors}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, value }) => `${name}: ${value}`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {categoryDataWithColors.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Card>
                        </Col>
                    </Row>

                    {/* Profit Chart */}
                    <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                        <Col span={24}>
                            <Card title="Lợi nhuận theo tháng" className="chart-card">
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={revenueData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="profit" fill="#52c41a" name="Lợi nhuận (₫1000)" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                        </Col>
                    </Row>
                </TabPane>

                {/* Tab 2: Sản phẩm */}
                <TabPane tab="📦 Sản phẩm" key="2">
                    {/* Product KPIs */}
                    <Row gutter={[16, 16]} className="kpi-row">
                        <Col xs={24} sm={12} lg={6}>
                            <Card className="kpi-card">
                                <Statistic
                                    title="Tổng sản phẩm"
                                    value={displayData.totalProducts}
                                    valueStyle={{ color: '#0a58d0' }}
                                />
                                <div className="kpi-trend">
                                    <span style={{ color: '#666' }}>{displayData.topProducts.length} sản phẩm bán chạy</span>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card className="kpi-card">
                                <Statistic
                                    title="Sản phẩm bán chạy"
                                    value={displayData.topProducts.filter(p => p.status === 'hot').length}
                                    valueStyle={{ color: '#52c41a' }}
                                    prefix="🔥"
                                />
                                <div className="kpi-trend">
                                    <span style={{ color: '#52c41a' }}>Top sản phẩm hot</span>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card className="kpi-card">
                                <Statistic
                                    title="Tồn kho cảnh báo"
                                    value={displayData.topProducts.filter(p => p.status === 'low').length}
                                    valueStyle={{ color: '#ff4d4f' }}
                                    prefix="⚠️"
                                />
                                <div className="kpi-trend">
                                    <span style={{ color: '#ff4d4f' }}>Cần nhập hàng</span>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card className="kpi-card">
                                <Statistic
                                    title="Tổng lượt bán"
                                    value={displayData.topProducts.reduce((sum, p) => sum + (p.sales || 0), 0)}
                                    precision={0}
                                    valueStyle={{ color: '#1976d2' }}
                                />
                                <div className="kpi-trend">
                                    <span style={{ color: '#666' }}>Từ tất cả sản phẩm</span>
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    {/* Product Table */}
                    <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                        <Col span={24}>
                            <Card title="Top sản phẩm bán chạy" className="table-card">
                                <Table
                                    columns={productColumns}
                                    dataSource={productPerformance}
                                    pagination={{ pageSize: 10 }}
                                    scroll={{ x: 1000 }}
                                />
                            </Card>
                        </Col>
                    </Row>
                </TabPane>
            </Tabs>
        </div>
    );
};

export default DashboardPage;
