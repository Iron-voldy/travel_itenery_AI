import { AnimatePresence, motion } from 'framer-motion';
import './LoadingOverlay.css';

export default function LoadingOverlay({ visible }) {
    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className="loading-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div className="loading-content">
                        <div className="loading-spinner-ring">
                            <div className="spinner-orbit" />
                            <div className="spinner-orbit second" />
                            <div className="spinner-core">✈️</div>
                        </div>
                        <motion.p
                            className="loading-title"
                            animate={{ opacity: [.6, 1, .6] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            Crafting your perfect itinerary
                        </motion.p>
                        <p className="loading-sub">AI is analyzing the best experiences for you...</p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
