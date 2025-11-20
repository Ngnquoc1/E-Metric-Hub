import { useState } from 'react';
import CustomerAnalysisPage from './CustomerAnalysisPage';
import DemandForecastPage from './DemandForecastPage';
import DynamicPricingPage from './DynamicPricingPage';
import './FeaturesPage.css';
import upwardTrendIcon from '../assets/img/upward-trend.png';
import dollarIcon from '../assets/img/dollar-sign.png';
import chatBubblesIcon from '../assets/img/chat-bubbles.png';
import dartBoardIcon from '../assets/img/dart-board.png';

const FeaturesPage = () => {
    const [activeFeature, setActiveFeature] = useState('customer-analysis');

    const features = [
        {
            id: 'demand-forecast',
            name: 'Dự báo nhu cầu',
            icon: upwardTrendIcon,
            status: 'coming-soon'
        },
        {
            id: 'dynamic-pricing',
            name: 'Giá bán động',
            icon: dollarIcon,
            status: 'coming-soon'
        },
        {
            id: 'customer-analysis',
            name: 'Phân tích khách hàng',
            icon: chatBubblesIcon,
            status: 'active'
        }
    ];

    const renderFeatureContent = () => {
        switch (activeFeature) {
            case 'customer-analysis':
                return <CustomerAnalysisPage embedded={true} />;
            case 'demand-forecast':
                return <DemandForecastPage embedded={true} />;
            case 'dynamic-pricing':
                return <DynamicPricingPage embedded={true} />;
            default:
                const feature = features.find(f => f.id === activeFeature);
                return (
                    <div className="coming-soon-content">
                        <div className="coming-soon-icon">
                            <img src={feature?.icon} alt={feature?.name} />
                        </div>
                        <h2>{feature?.name}</h2>
                        <p className="feature-description">Tính năng đang được phát triển...</p>
                        <div className="coming-soon-badge">🚀 Coming Soon</div>
                    </div>
                );
        }
    };

    return (
        <div className="features-page">
            {/* Main Content */}
            <div className="features-container">
                {/* Sidebar */}
                <aside className="features-sidebar">
                    <nav className="features-nav">
                        {features.map(feature => (
                            <button
                                key={feature.id}
                                className={`feature-nav-item ${activeFeature === feature.id ? 'active' : ''}`}
                                onClick={() => setActiveFeature(feature.id)}
                            >
                                <div className="nav-item-icon">
                                    <img src={feature.icon} alt={feature.name} />
                                </div>
                                <div className="nav-item-content">
                                    <div className="nav-item-name">{feature.name}</div>
                                </div>
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Feature Content */}
                <main className="features-content">
                    {renderFeatureContent()}
                </main>
            </div>
        </div>
    );
};

export default FeaturesPage;
