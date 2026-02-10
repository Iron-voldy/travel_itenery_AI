import { motion } from 'framer-motion';
import './EmptyState.css';

export default function EmptyState() {
    return (
        <motion.div
            className="empty-state"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
        >
            <motion.div
                className="empty-globe"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
                🌏
            </motion.div>
            <h2 className="empty-title">Ready to explore Sri Lanka?</h2>
            <p className="empty-subtitle">
                Enter your travel preferences above and let our AI craft the perfect itinerary for you.
                Include details like duration, destinations, and activities you'd love to experience.
            </p>
            <div className="empty-features">
                <div className="feature-pill"><span>🗺️</span> Interactive Map</div>
                <div className="feature-pill"><span>🤖</span> AI-Powered</div>
                <div className="feature-pill"><span>🏨</span> Hotel Picks</div>
                <div className="feature-pill"><span>📄</span> PDF Export</div>
            </div>
        </motion.div>
    );
}
