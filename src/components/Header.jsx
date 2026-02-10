import { motion } from 'framer-motion';
import './Header.css';

export default function Header() {
    return (
        <motion.header
            className="header"
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            <div className="header-inner">
                <div className="logo">
                    <div className="logo-icon">
                        <span className="logo-emoji">🌴</span>
                        <div className="logo-ring" />
                    </div>
                    <div className="logo-text">
                        <h1>Sri Lanka Travel AI</h1>
                        <p>Intelligent Itinerary Generator</p>
                    </div>
                </div>
                <motion.div
                    className="header-badge"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                >
                    ✨ Powered by Hasindu
                </motion.div>
            </div>
        </motion.header>
    );
}
