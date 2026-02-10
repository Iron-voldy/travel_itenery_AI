import { motion } from 'framer-motion';
import './SummaryStats.css';

export default function SummaryStats({ data }) {
    const { tripTitle, startDate, endDate, totalDays, totalActivities, matchingSummary } = data;

    return (
        <div className="summary-section">
            <div className="summary-header">
                <motion.h2
                    className="summary-title"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    {tripTitle}
                </motion.h2>
                <p className="summary-subtitle">
                    {startDate && endDate ? `${startDate} → ${endDate}` : 'Dates to be confirmed'}
                </p>
            </div>
            <div className="stats-grid">
                {[
                    { value: totalDays, label: 'Days', color: 'var(--primary-light)' },
                    { value: totalActivities, label: 'Activities', color: 'var(--accent-light)' },
                    { value: matchingSummary.match_rate || '100%', label: 'Match Rate', color: 'var(--success)' },
                ].map((stat, i) => (
                    <motion.div
                        className="stat-card"
                        key={i}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.15 * i, type: 'spring', stiffness: 200 }}
                        whileHover={{ y: -3, background: 'rgba(255,255,255,.1)' }}
                    >
                        <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
                        <div className="stat-label">{stat.label}</div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
