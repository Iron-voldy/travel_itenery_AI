import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFirstImageUrl, DAY_COLORS } from '../utils/helpers';
import './InfoPanel.css';

const TABS = ['Verification', 'Hotels', 'Tips', 'Route'];

export default function InfoPanel({ data }) {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    const { verification, qualityVerification, matchingSummary, hotels, tips, routePlan, regions, itinerary, travelTimes } = data;

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
                            {activeTab === 1 && <HotelsTab hotels={hotels} itinerary={itinerary} />}
                            {activeTab === 2 && <TipsTab tips={tips} />}
                            {activeTab === 3 && <RouteTab itinerary={itinerary} travelTimes={travelTimes} routePlan={routePlan} regions={regions} />}
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
    const routeEff = v.route_efficiency_score || q.route_efficiency_score;
    const diversity = v.diversity_score || q.diversity_score;
    const overallQuality = v.overall_quality || q.overall_quality;

    const cards = [
        { label: 'Feasibility', value: feasPasses ? '✅' : '❌', color: feasPasses ? 'var(--success)' : 'var(--danger)' },
        { label: 'Quality', value: qualityPasses ? '✅' : '❌', color: qualityPasses ? 'var(--success)' : 'var(--danger)' },
        { label: 'Score', value: score, color: 'var(--primary-light)' },
        { label: 'Match Rate', value: matchRate, color: 'var(--accent-light)' },
    ];

    // Extra metric cards
    if (routeEff != null) cards.push({ label: 'Route Efficiency', value: routeEff, color: '#10b981' });
    if (diversity != null) cards.push({ label: 'Diversity', value: diversity, color: '#8b5cf6' });
    if (overallQuality) cards.push({ label: 'Overall', value: overallQuality, color: '#f59e0b' });

    // Quality checks list
    const checks = v.checks || q.checks || [];
    // Quality issues
    const issues = v.quality_issues || q.quality_issues || v.issues || q.issues || [];

    return (
        <div>
            <div className="verification-grid">
                {cards.map((c, i) => (
                    <div className="verification-card" key={i}>
                        <div className="verification-value" style={{ color: c.color }}>{c.value}</div>
                        <div className="verification-label">{c.label}</div>
                    </div>
                ))}
            </div>

            {checks.length > 0 && (
                <div style={{ marginTop: 14 }}>
                    <h5 style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Quality Checks</h5>
                    {checks.map((chk, i) => (
                        <div key={i} style={{ fontSize: 12, marginBottom: 4, display: 'flex', gap: 6 }}>
                            <span>{chk.passed ? '✅' : '❌'}</span>
                            <span>{chk.check || chk.name || chk}</span>
                        </div>
                    ))}
                </div>
            )}

            {issues.length > 0 && (
                <div style={{ marginTop: 14 }}>
                    <h5 style={{ fontSize: 12, color: '#ef4444', marginBottom: 8 }}>⚠️ Issues</h5>
                    {issues.map((iss, i) => (
                        <div key={i} style={{ fontSize: 12, marginBottom: 4, padding: '6px 10px', background: '#fef2f2', borderRadius: 6, borderLeft: `3px solid ${iss.severity === 'high' ? '#ef4444' : '#f59e0b'}` }}>
                            {typeof iss === 'string' ? iss : iss.message || iss.issue || JSON.stringify(iss)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function HotelsTab({ hotels, itinerary }) {
    if (!hotels?.length) return <p className="empty-info">No hotel recommendations available.</p>;

    // Build day range per hotel
    const hotelDayMap = {};
    (itinerary || []).forEach(day => {
        const h = day.hotel || {};
        const name = (h.hotel_name || '').toLowerCase().trim();
        if (name) {
            if (!hotelDayMap[name]) hotelDayMap[name] = [];
            hotelDayMap[name].push(day.day);
        }
    });

    return (
        <div className="hotel-grid">
            {hotels.slice(0, 6).map((h, i) => {
                const img = getFirstImageUrl(h.hotel_image || h.image);
                const hotelName = (h.name || h.hotel_name || '').toLowerCase().trim();
                const days = hotelDayMap[hotelName] || [];
                const isSelected = days.length > 0;
                return (
                    <div className="hotel-card" key={i} style={isSelected ? { borderLeft: '4px solid #10b981' } : {}}>
                        {img
                            ? <img src={img} alt={h.name || h.hotel_name} onError={e => { e.target.style.display = 'none'; }} />
                            : <div className="hotel-card-placeholder">🏨</div>
                        }
                        <div className="hotel-card-body">
                            <h5>{h.name || h.hotel_name || 'Hotel'} {isSelected && <span style={{ color: '#10b981', fontSize: 11 }}>⭐ Selected</span>}</h5>
                            <p>⭐ {h.stars || h.star_classification || 'N/A'} • 📍 {h.city || h.hotel_city || ''}</p>
                            {days.length > 0 && <p style={{ fontSize: 11, color: '#6366f1' }}>Day {days.join(', ')}</p>}
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

function RouteTab({ itinerary, travelTimes, routePlan, regions }) {
    return (
        <div>
            {/* Per-day activity flows */}
            {itinerary && itinerary.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                    <h5 style={{ fontSize: 12, color: '#888', marginBottom: 10 }}>Daily Routes</h5>
                    {itinerary.map(day => {
                        const dayNum = day.day;
                        const color = DAY_COLORS[(dayNum - 1) % DAY_COLORS.length];
                        const acts = day.activities || [];
                        return (
                            <div key={dayNum} style={{ marginBottom: 10, padding: '8px 12px', background: '#f8f9fa', borderRadius: 8, borderLeft: `4px solid ${color}` }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 4 }}>Day {dayNum} {day.theme ? `— ${day.theme}` : ''}</div>
                                <div style={{ fontSize: 11, color: '#555', display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
                                    {acts.map((act, idx) => (
                                        <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <span style={{ background: color, color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>{idx + 1}</span>
                                            <span>{act.name || 'Activity'}</span>
                                            {idx < acts.length - 1 && <span style={{ color: '#ccc', margin: '0 2px' }}>→</span>}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Travel times */}
            {travelTimes && travelTimes.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                    <h5 style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>🚗 Travel Times</h5>
                    {travelTimes.map((t, i) => (
                        <div key={i} style={{ fontSize: 11, marginBottom: 4, padding: '5px 10px', background: '#f8f9fa', borderRadius: 6, display: 'flex', justifyContent: 'space-between' }}>
                            <span>{t.from} → {t.to}</span>
                            <span style={{ color: '#6366f1', fontWeight: 600 }}>{t.duration || t.time || 'N/A'}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Fallback route plan */}
            {(!itinerary || itinerary.length === 0) && routePlan?.length > 0 && (
                <div>
                    <div className="route-flow">
                        {routePlan.map((region, i) => (
                            <span key={i}>
                                <span className="route-step">Day {i + 1}: {regions?.[region]?.name || region}</span>
                                {i < routePlan.length - 1 && <span className="route-arrow">→</span>}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
