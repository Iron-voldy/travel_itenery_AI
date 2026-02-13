import { motion, AnimatePresence } from 'framer-motion';
import { DAY_COLORS } from '../utils/helpers';
import './DayContent.css';

export default function DayContent({ itinerary, selectedDay, onActivityClick }) {
    const day = itinerary[selectedDay];
    if (!day) return null;
    const dayNum = day.day || selectedDay + 1;
    const activities = day.activities || [];
    const hotel = day.hotel || {};
    const meals = day.meals || {};
    const isLastDay = selectedDay === itinerary.length - 1;

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
                        <span>
                            {day.date || ''}
                            {day.city ? ` • ${day.city.charAt(0).toUpperCase() + day.city.slice(1)}` : ''}
                            {day.region ? ` • ${day.region}` : ''}
                        </span>
                    </div>
                </div>

                {/* Day summary */}
                {day.day_summary && (
                    <div className="day-summary-box">
                        💡 {day.day_summary}
                    </div>
                )}

                {/* Highlight */}
                {day.highlight && (
                    <div className="day-highlight-badge">
                        ⭐ Highlight: {day.highlight}
                    </div>
                )}

                {/* Hotel block */}
                {hotel.hotel_name ? (
                    <motion.div
                        className="day-hotel-card"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <span className="hotel-emoji">🏨</span>
                        <div className="hotel-info-block">
                            <div className="hotel-name">{hotel.hotel_name}</div>
                            <div className="hotel-star">⭐ {hotel.star_classification || 'N/A'} Star • 📍 {hotel.city || hotel.address || ''}</div>
                        </div>
                        <div className="hotel-times">
                            <span className="check-in">🟢 Check-in: {hotel.check_in || '14:00'}</span>
                            <span className="check-out">🔴 Check-out: {hotel.check_out || '11:00'}</span>
                        </div>
                    </motion.div>
                ) : isLastDay ? (
                    <div className="day-departure-notice">
                        🏁 Last day — No hotel (departure day)
                    </div>
                ) : null}

                {/* Route flow: 1 → 2 → 3 */}
                {activities.length > 0 && (
                    <div className="route-flow-bar">
                        <span className="route-flow-label">Route:</span>
                        {activities.map((act, idx) => {
                            const shortName = (act.name || 'Activity').length > 25
                                ? (act.name || 'Activity').substring(0, 25) + '…'
                                : (act.name || 'Activity');
                            return (
                                <span key={idx} className="route-flow-item">
                                    <span
                                        className="route-flow-num"
                                        onClick={() => onActivityClick(dayNum, idx)}
                                    >
                                        {idx + 1}
                                    </span>
                                    <span className="route-flow-name" onClick={() => onActivityClick(dayNum, idx)}>
                                        {shortName}
                                    </span>
                                    {idx < activities.length - 1 && (
                                        <span className="route-flow-arrow">→</span>
                                    )}
                                </span>
                            );
                        })}
                    </div>
                )}

                {/* Activity table */}
                <table className="activity-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Activity</th>
                            <th>Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activities.map((act, idx) => {
                            const name = act.name || act.activity_name || 'Activity';
                            const score = act.score != null ? act.score : '';
                            const themeMatch = act.theme_match != null ? `${act.theme_match}%` : '';
                            const actCity = act.location || act.city || '';

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
                                                {actCity && <p>📍 {actCity}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        {score !== '' && <span className="activity-tag">{score}pts</span>}
                                        {themeMatch && <span className="activity-tag theme-tag">{themeMatch}</span>}
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Meals section */}
                {(meals.breakfast || meals.lunch || meals.dinner) && (
                    <div className="meals-section">
                        <div className="meals-title">🍴 Meals</div>
                        <div className="meals-list">
                            {meals.breakfast && (
                                <span className="meal-item">
                                    ☕ <strong>{meals.breakfast.time || '07:00'}</strong> Breakfast
                                    {meals.breakfast.location ? ` — ${meals.breakfast.location}` : ''}
                                </span>
                            )}
                            {meals.lunch && (
                                <span className="meal-item">
                                    🍽️ <strong>{meals.lunch.time || '12:30'}</strong> Lunch
                                    {meals.lunch.suggestion ? ` (${meals.lunch.suggestion})` : ''}
                                    {meals.lunch.location ? ` — ${meals.lunch.location}` : ''}
                                </span>
                            )}
                            {meals.dinner && (
                                <span className="meal-item">
                                    🌙 <strong>{meals.dinner.time || '19:00'}</strong> Dinner
                                    {meals.dinner.location ? ` — ${meals.dinner.location}` : ''}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
