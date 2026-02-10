import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFirstImageUrl } from '../utils/helpers';
import './InfoPanel.css';

const TABS = ['Verification', 'Hotels', 'Tips', 'Route'];

export default function InfoPanel({ data }) {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    const { verification, qualityVerification, matchingSummary, hotels, tips, routePlan, regions } = data;

    return (
        <>
            <motion.button
                className="info-toggle"
                onClick={() => setOpen(!open)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                animate={{ rotate: open ? 45 : 0 }}
            >
                {open ? '✕' : 'ℹ️'}
            </motion.button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        className="info-panel glass-card"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                        <div className="info-tabs">
                            {TABS.map((tab, i) => (
                                <button
                                    key={tab}
                                    className={`info-tab ${i === activeTab ? 'active' : ''}`}
                                    onClick={() => setActiveTab(i)}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="info-body">
                            {activeTab === 0 && <VerificationTab v={verification} q={qualityVerification} m={matchingSummary} />}
                            {activeTab === 1 && <HotelsTab hotels={hotels} />}
                            {activeTab === 2 && <TipsTab tips={tips} />}
                            {activeTab === 3 && <RouteTab routePlan={routePlan} regions={regions} />}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function VerificationTab({ v, q, m }) {
    const feasPasses = v.is_feasible !== false;
    const qualityPasses = q.passes_quality !== false;
    const score = q.quality_score || v.score || 'N/A';
    const matchRate = m.match_rate || q.match_rate || '100%';

    const cards = [
        { label: 'Feasibility', value: feasPasses ? '✅' : '❌', color: feasPasses ? 'var(--success)' : 'var(--danger)' },
        { label: 'Quality', value: qualityPasses ? '✅' : '❌', color: qualityPasses ? 'var(--success)' : 'var(--danger)' },
        { label: 'Score', value: score, color: 'var(--primary-light)' },
        { label: 'Match Rate', value: matchRate, color: 'var(--accent-light)' },
    ];

    return (
        <div className="verification-grid">
            {cards.map((c, i) => (
                <div className="verification-card" key={i}>
                    <div className="verification-value" style={{ color: c.color }}>{c.value}</div>
                    <div className="verification-label">{c.label}</div>
                </div>
            ))}
        </div>
    );
}

function HotelsTab({ hotels }) {
    if (!hotels?.length) return <p className="empty-info">No hotel recommendations available.</p>;
    return (
        <div className="hotel-grid">
            {hotels.slice(0, 6).map((h, i) => {
                const img = getFirstImageUrl(h.hotel_image || h.image);
                return (
                    <div className="hotel-card" key={i}>
                        {img
                            ? <img src={img} alt={h.name || h.hotel_name} onError={e => { e.target.style.display = 'none'; }} />
                            : <div className="hotel-card-placeholder">🏨</div>
                        }
                        <div className="hotel-card-body">
                            <h5>{h.name || h.hotel_name || 'Hotel'}</h5>
                            <p>⭐ {h.stars || h.star_classification || 'N/A'} • 📍 {h.city || h.hotel_city || ''}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function TipsTab({ tips }) {
    let tipList = [];
    if (typeof tips === 'string' && tips.trim()) tipList = [tips];
    else if (Array.isArray(tips)) tipList = tips.filter(Boolean);

    if (!tipList.length) return <p className="empty-info">No travel tips available.</p>;
    return (
        <div className="tips-list">
            {tipList.map((tip, i) => <div className="tip-item" key={i}>💡 {tip}</div>)}
        </div>
    );
}

function RouteTab({ routePlan, regions }) {
    if (!routePlan?.length) return <p className="empty-info">No route plan available.</p>;
    const unique = [...new Set(routePlan)];
    return (
        <div>
            <div className="route-flow">
                {routePlan.map((region, i) => (
                    <span key={i}>
                        <span className="route-step">Day {i + 1}: {regions[region]?.name || region}</span>
                        {i < routePlan.length - 1 && <span className="route-arrow">→</span>}
                    </span>
                ))}
            </div>
            <div className="route-regions">
                <span className="route-regions-label">Regions covered:</span>
                <div className="route-chips">
                    {unique.map((r, i) => <span className="route-chip" key={i}>{r}</span>)}
                </div>
            </div>
        </div>
    );
}
