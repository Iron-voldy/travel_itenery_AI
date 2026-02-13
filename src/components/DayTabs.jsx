import { motion } from 'framer-motion';
import './DayTabs.css';

export default function DayTabs({ itinerary, selectedDay, onSelectDay }) {
    return (
        <nav className="day-tabs">
            {itinerary.map((day, i) => {
                const city = day.city ? day.city.charAt(0).toUpperCase() + day.city.slice(1) : '';
                return (
                    <motion.button
                        key={i}
                        className={`day-tab ${i === selectedDay ? 'active' : ''}`}
                        onClick={() => onSelectDay(i)}
                        whileTap={{ scale: 0.95 }}
                        layout
                    >
                        Day {day.day || i + 1}{city ? ` • ${city}` : ''}
                    </motion.button>
                );
            })}
        </nav>
    );
}
