import React from 'react';
import { Row, Col, Button, Card, List, Typography, Carousel } from 'antd';
import {
    ArrowRightOutlined,
    CheckCircleTwoTone,
    DashboardOutlined,
    LineChartOutlined,
    RobotOutlined,
} from '@ant-design/icons';
import './LandingPage.css';
import preview1 from '../assets/img/preview1.jpg'
import preview2 from '../assets/img/preview2.jpg'
import preview3 from '../assets/img/preview3.jpg'
import preview4 from '../assets/img/preview4.jpg'
import preview5 from '../assets/img/preview5.jpg'

const { Title, Paragraph } = Typography;

const LandingPage = () => {
    const features = [
        {
            icon: <DashboardOutlined />,
            title: 'Dashboard trực quan',
            subtitle: 'Hiển thị dữ liệu kinh doanh một cách trực quan và dễ hiểu',
            items: [
                'Theo dõi doanh thu trực tiếp',
                'Biểu đồ phân tích chi tiết',
                'Báo cáo tùy chỉnh linh hoạt',
            ],
        },
        {
            icon: <LineChartOutlined />,
            title: 'Phân tích thông minh',
            subtitle: 'Theo dõi và so sánh các đối thủ cạnh tranh',
            items: [
                'So sánh giá cả thị trường',
                'Phân tích và đưa ra chiến lược hợp lý',
                'Cảnh báo thông minh',
            ],
        },
        {
            icon: <RobotOutlined />,
            title: 'Trợ lý AI',
            subtitle: 'Gợi ý thông minh và tối ưu hóa kinh doanh',
            items: [
                'Định giá động thông minh',
                'Dự báo nhu cầu sản phẩm',
                'Đề xuất marketing cá nhân hóa',
            ],
        },
    ];

    const carouselImages = [
        {
            url: preview1,
            alt: 'Dashboard Overview',
        },
        {
            url: preview2,
            alt: 'Sales Analytics',
        },
        {
            url: preview3,
            alt: 'Sales Analytics',
        },
        {
            url: preview4,
            alt: 'AI',
        },
        {
            url: preview5,
            alt: 'AI',
        },
    ];
    console.log('Image URLs:', carouselImages);
    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="hero-section">
                {/* Text pane first (on top layer) */}
                <div className="hero-text-pane">
                    <div className="hero-text-content">
                        <Title level={1} className="hero-title">
                            Tối ưu kinh doanh thông minh với{" "}
                            <span className="brand-name">E-Metric Hub</span>
                        </Title>
                        <Paragraph className="hero-description">
                            Nền tảng phân tích dữ liệu thông minh giúp doanh nghiệp TMĐT
                            tối ưu hóa hiệu suất kinh doanh, theo dõi xu hướng thị trường
                            và đưa ra quyết định chính xác dựa trên dữ liệu thực tế.
                        </Paragraph>
                        <div className="hero-buttons">
                            <Button
                                type="primary"
                                size="large"
                                icon={<ArrowRightOutlined />}
                                iconPosition="end"
                                className="trial-button"
                            >
                                Dùng thử miễn phí
                            </Button>
                            <Button size="large" className="demo-button">
                                Xem demo
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Slideshow now rendered behind text */}
                <div className="hero-slider">
                    <Carousel
                        autoplay
                        autoplaySpeed={4500}
                        dots={false}
                        infinite
                        slidesToShow={2}
                        slidesToScroll={1}
                        centerMode={true}
                        className="hero-carousel"
                    >
                        {carouselImages.map((image, index) => (
                            <div key={index} className="hero-slide">
                                <div className="hero-slide-frame">
                                    <img
                                        src={image.url}
                                        alt={image.alt}
                                        className="hero-slide-image"
                                    />
                                </div>
                            </div>
                        ))}
                    </Carousel>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <div className="section-header">
                        <Title level={2} className="section-title">
                            Giải pháp toàn diện
                        </Title>
                        <Paragraph className="section-description">
                            giúp bạn chinh phục thị trường TMĐT Việt Nam
                        </Paragraph>
                    </div>

                    <Row gutter={[24, 24]}>
                        {features.map((feature, index) => (
                            <Col xs={24} md={8} key={index}>
                                <Card
                                    className="feature-card"
                                    // variant={false}
                                >
                                    <div className="card-header">
                                        <div className="card-icon">{feature.icon}</div>
                                        <div className="card-title-section">
                                            <h3 className="card-title">{feature.title}</h3>
                                            <p className="card-subtitle">{feature.subtitle}</p>
                                        </div>
                                    </div>
                                    <List
                                        dataSource={feature.items}
                                        renderItem={(item) => (
                                            <List.Item className="feature-list-item">
                                                <CheckCircleTwoTone
                                                    twoToneColor="#52c41a"
                                                    className="check-icon"
                                                />
                                                <span className="feature-text">{item}</span>
                                            </List.Item>
                                        )}
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
