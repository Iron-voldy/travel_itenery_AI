import { useState, useCallback } from 'react';
import Header from './components/Header';
import InputSection from './components/InputSection';
import EmptyState from './components/EmptyState';
import MainContent from './components/MainContent';
import LoadingOverlay from './components/LoadingOverlay';
import EveChatbot from './components/EveChatbot';
import PdfExport from './components/PdfExport';
import { generateItinerary } from './utils/api';
import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [flyTo, setFlyTo] = useState(null);

  const handleGenerate = useCallback(async (prompt) => {
    setLoading(true);
    try {
      const result = await generateItinerary(prompt);
      setData(result);
      setSelectedDay(0);
    } catch (err) {
      console.error(err);
      alert('Failed to generate itinerary. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleClear = useCallback(() => {
    setData(null);
    setSelectedDay(0);
    setFlyTo(null);
  }, []);

  const handleActivityClick = useCallback((dayNum, actIdx) => {
    if (!data) return;
    const dayData = data.itinerary.find(d => d.day === dayNum) || data.itinerary[dayNum - 1];
    if (!dayData) return;
    const activity = (dayData.activities || [])[actIdx];
    if (!activity) return;

    // Try direct lat/lng from the activity (new API format)
    if (activity.lat && activity.lng) {
      setFlyTo({ lat: activity.lat, lng: activity.lng, dayNum, actIdx, key: Date.now() });
      return;
    }

    // Fallback: match from products
    const match = data.products.find(p =>
      p.day === dayNum &&
      (p.matched_product_name === activity.name ||
        p.product_name === activity.name ||
        p.name === activity.name ||
        p.matched_product_name === activity.activity_name ||
        p.time === activity.time)
    );
    if (match) {
      const coords = match.matched_coordinates || match.coordinates;
      if (coords?.lat && coords?.lng) {
        setFlyTo({ lat: coords.lat, lng: coords.lng, dayNum, actIdx, key: Date.now() });
      }
    }
  }, [data]);

  return (
    <>
      <div className="bg-gradient">
        <div className="bg-orb" />
        <div className="bg-orb" />
        <div className="bg-orb" />
      </div>

      <Header />
      <InputSection
        onGenerate={handleGenerate}
        onClear={handleClear}
        hasData={!!data}
        loading={loading}
      />

      {!data && !loading && <EmptyState />}

      {data && (
        <MainContent
          data={data}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          onActivityClick={handleActivityClick}
          flyTo={flyTo}
        />
      )}

      <LoadingOverlay visible={loading} />
      <EveChatbot />
      <PdfExport data={data} />
    </>
  );
}

export default App;
