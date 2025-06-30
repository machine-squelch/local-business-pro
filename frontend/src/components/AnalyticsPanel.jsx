import React from 'react';
import { FiBarChart2 } from 'react-icons/fi';

const AnalyticsPanel = ({ design }) => {
    return (
        <div className="analytics-panel">
            <h2><FiBarChart2 className="panel-icon" /> Design Analytics</h2>
            <div className="analytics-grid">
                <div className="stat-card">
                    <h4>Views</h4>
                    <p>{design.analytics.views}</p>
                </div>
                <div className="stat-card">
                    <h4>Shares</h4>
                    <p>{design.analytics.shares}</p>
                </div>
                <div className="stat-card">
                    <h4>Clicks</h4>
                    <p>{design.analytics.clicks}</p>
                </div>
                <div className="stat-card">
                    <h4>Conversions</h4>
                    <p>{design.analytics.conversions}</p>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPanel;