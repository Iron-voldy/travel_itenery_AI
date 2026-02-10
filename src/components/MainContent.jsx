import { motion } from 'framer-motion';
import DayTabs from './DayTabs';
import DayContent from './DayContent';
import SummaryStats from './SummaryStats';
import MapView from './MapView';
import InfoPanel from './InfoPanel';
import './MainContent.css';

export default function MainContent({ data, selectedDay, onSelectDay, onActivityClick, flyTo }) {
    const { itinerary } = data;

    return (
        <motion.div
            className="main-layout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Left Panel */}
            <aside className="left-panel">
                <SummaryStats data={data} />
                <DayTabs
                    itinerary={itinerary}
                    selectedDay={selectedDay}
                    onSelectDay={onSelectDay}
                />
                <DayContent
                    itinerary={itinerary}
                    selectedDay={selectedDay}
                    onActivityClick={onActivityClick}
                />
            </aside>

            {/* Right Panel — Map */}
            <div className="right-panel">
                <MapView
                    data={data}
                    selectedDay={selectedDay}
                    flyTo={flyTo}
                />
                <InfoPanel data={data} />
            </div>
        </motion.div>
    );
}
