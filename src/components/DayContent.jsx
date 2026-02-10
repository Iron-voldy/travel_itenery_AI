import { motion, AnimatePresence } from 'framer-motion';
import './DayContent.css';

export default function DayContent({ itinerary, selectedDay, onActivityClick }) {
    const day = itinerary[selectedDay];
    if (!day) return null;
    const dayNum = day.day || selectedDay + 1;
    const activities = day.activities || [];
    const hotel = day.hotel || day.overnight_stay || {};

    return (
        <AnimatePresence mode="wait">
            <motion.div
                className="day-content"
                key={selectedDay}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
            >
                {/* Day header card */}
                <div className="day-header-card">
                    <div className="day-header-icon">📅</div>
                    <div className="day-header-info">
                        <h3>Day {dayNum} — {day.theme || day.region || 'Exploration'}</h3>
                        <span>{day.date || ''}{day.region ? ` • ${day.region}` : ''}</span>
                    </div>
                </div>

                {/* Hotel block */}
                {hotel.hotel_name && (
                    <motion.div
                        className="day-hotel-card"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <span className="hotel-emoji">🏨</span>
                        <div className="hotel-info-block">
                            <div className="hotel-name">{hotel.hotel_name}</div>
                            <div className="hotel-star">⭐ {hotel.star_classification || 'N/A'} Star Hotel</div>
                        </div>
                        <div className="hotel-times">
                            <span className="check-in">🟢 Check-in: {hotel.check_in || hotel.check_in_time || '14:00'}</span>
                            <span className="check-out">🔴 Check-out: {hotel.check_out || hotel.check_out_time || '11:00'}</span>
                        </div>
                    </motion.div>
                )}

                {/* Activity table */}
                <table className="activity-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Activity</th>
                            <th>Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activities.map((act, idx) => {
                            const name = act.name || act.activity_name || 'Activity';
                            const duration = act.duration_hours ? `${act.duration_hours}h` : 'N/A';
                            const isMeal = act.is_meal || /breakfast|lunch|dinner|buffet/i.test(name);
                            const isHotel = /hotel|check.?in|check.?out/i.test(name);
                            const tagClass = isMeal ? 'meal' : isHotel ? 'hotel' : '';

                            return (
                                <motion.tr
                                    key={idx}
                                    className="activity-row"
                                    onClick={() => onActivityClick(dayNum, idx)}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 * idx }}
                                    whileHover={{ backgroundColor: 'rgba(99,102,241,.12)' }}
                                >
                                    <td>
                                        <span className="time-badge">🕐 {act.time || 'TBD'}</span>
                                    </td>
                                    <td>
                                        <div className="activity-info">
                                            <div className="activity-number">{idx + 1}</div>
                                            <div className="activity-details">
                                                <h4>{name}</h4>
                                                {act.location && <p>📍 {act.location}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className={`activity-tag ${tagClass}`}>{duration}</span></td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </motion.div>
        </AnimatePresence>
    );
}
