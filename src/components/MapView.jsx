import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getFirstImageUrl, DAY_COLORS } from '../utils/helpers';
import './MapView.css';

/* ── Fly-to controller ── */
function FlyController({ flyTo, activityMarkerRefs }) {
    const map = useMap();
    useEffect(() => {
        if (!flyTo) return;
        map.flyTo([flyTo.lat, flyTo.lng], 14, { duration: 1.2 });
        setTimeout(() => {
            const key = `day${flyTo.dayNum}-act${flyTo.actIdx}`;
            const marker = activityMarkerRefs.current[key];
            if (marker) marker.openPopup();
        }, 1300);
    }, [flyTo]);
    return null;
}

/* ── Day highlight controller ── */
function DayHighlight({ selectedDay, itinerary, hotelMarkersRef, activityMarkerRefs }) {
    const map = useMap();
    useEffect(() => {
        const dayNum = selectedDay + 1;
        const dayData = itinerary.find(d => d.day === dayNum) || itinerary[dayNum - 1];
        if (!dayData) return;

        map.closePopup();

        const bounds = [];
        (dayData.activities || []).forEach(act => {
            if (act.lat && act.lng) bounds.push([act.lat, act.lng]);
        });

        // Add hotel coords
        const hotelKey = `day-${dayNum}`;
        const hotelMarker = hotelMarkersRef.current[hotelKey];
        if (hotelMarker) {
            const ll = hotelMarker.getLatLng();
            bounds.push([ll.lat, ll.lng]);
        }

        if (bounds.length > 0) {
            map.fitBounds(bounds, { padding: [80, 80], maxZoom: 13 });
        }

        // Open first activity popup
        setTimeout(() => {
            const key = `day${dayNum}-act0`;
            const marker = activityMarkerRefs.current[key];
            if (marker) marker.openPopup();
        }, 400);
    }, [selectedDay]);
    return null;
}

/* ── Main MapView ── */
export default function MapView({ data, selectedDay, flyTo }) {
    const { products, itinerary, hotels } = data;
    const activityMarkerRefs = useRef({});
    const hotelMarkerRefs = useRef({});

    // Build day-based route data from itinerary (most reliable source)
    const dayRoutes = useMemo(() => {
        const routes = {};
        itinerary.forEach(day => {
            const dayNum = day.day;
            const coords = [];
            (day.activities || []).forEach(act => {
                if (act.lat && act.lng) coords.push([act.lat, act.lng]);
            });
            if (coords.length > 0) routes[dayNum] = coords;
        });
        return routes;
    }, [itinerary]);

    // Arrow midpoints for route direction indicators
    const arrowPoints = useMemo(() => {
        const arrows = [];
        Object.entries(dayRoutes).forEach(([day, coords]) => {
            const color = DAY_COLORS[(parseInt(day) - 1) % DAY_COLORS.length];
            for (let k = 0; k < coords.length - 1; k++) {
                const from = coords[k];
                const to = coords[k + 1];
                const midLat = (from[0] + to[0]) / 2;
                const midLng = (from[1] + to[1]) / 2;
                const angle = Math.atan2(to[0] - from[0], to[1] - from[1]) * 180 / Math.PI;
                arrows.push({ pos: [midLat, midLng], angle, color, key: `arrow-${day}-${k}` });
            }
        });
        return arrows;
    }, [dayRoutes]);

    // Selected hotel names
    const selectedHotelInfo = useMemo(() => {
        const names = new Set();
        const dayMap = {};
        itinerary.forEach(day => {
            const h = day.hotel || {};
            if (h.hotel_name) {
                names.add(h.hotel_name.toLowerCase().trim());
                dayMap[day.day] = h.hotel_name.toLowerCase().trim();
            }
        });
        return { names, dayMap };
    }, [itinerary]);

    // Initial bounds
    const bounds = useMemo(() => {
        const pts = [];
        itinerary.forEach(day => {
            (day.activities || []).forEach(act => {
                if (act.lat && act.lng) pts.push([act.lat, act.lng]);
            });
        });
        products.forEach(p => {
            const c = p.matched_coordinates || p.coordinates;
            if (c?.lat && c?.lng) pts.push([c.lat, c.lng]);
        });
        hotels.forEach(h => { if (h.latitude && h.longitude) pts.push([h.latitude, h.longitude]); });
        return pts.length > 0 ? pts : [[7.8731, 80.7718]];
    }, [itinerary, products, hotels]);

    return (
        <MapContainer
            center={[7.8731, 80.7718]}
            zoom={8}
            className="map-container"
            scrollWheelZoom
            bounds={bounds.length > 1 ? bounds : undefined}
            boundsOptions={{ padding: [40, 40] }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap"
                maxZoom={18}
            />

            <FlyController flyTo={flyTo} activityMarkerRefs={activityMarkerRefs} />
            <DayHighlight
                selectedDay={selectedDay}
                itinerary={itinerary}
                hotelMarkersRef={hotelMarkerRefs}
                activityMarkerRefs={activityMarkerRefs}
            />

            {/* Numbered activity markers from itinerary */}
            {itinerary.flatMap((day) => {
                const dayNum = day.day;
                const color = DAY_COLORS[(dayNum - 1) % DAY_COLORS.length];
                return (day.activities || []).map((act, idx) => {
                    if (!act.lat || !act.lng) return null;
                    const imageUrl = getFirstImageUrl(act.image);
                    const score = act.score != null ? act.score : '';
                    const themeMatch = act.theme_match != null ? act.theme_match : '';
                    const markerKey = `day${dayNum}-act${idx}`;

                    const icon = L.divIcon({
                        className: 'numbered-marker',
                        html: `<div style="background:${color};width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:700;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.4);">${idx + 1}</div>`,
                        iconSize: [32, 32],
                        iconAnchor: [16, 16],
                    });

                    return (
                        <Marker
                            key={markerKey}
                            position={[act.lat, act.lng]}
                            icon={icon}
                            zIndexOffset={500}
                            ref={el => { activityMarkerRefs.current[markerKey] = el; }}
                        >
                            <Popup maxWidth={340}>
                                <div style={{ minWidth: 260, maxWidth: 320, padding: 4 }}>
                                    {imageUrl && (
                                        <img
                                            src={imageUrl}
                                            alt={act.name}
                                            style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 8, marginBottom: 10 }}
                                            onError={e => { e.target.style.display = 'none'; }}
                                        />
                                    )}
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                                        <span className="popup-badge" style={{ background: color }}>Day {dayNum} • #{idx + 1}</span>
                                        {score !== '' && <span className="popup-badge" style={{ background: '#10b981' }}>Score: {score}</span>}
                                        {themeMatch !== '' && <span className="popup-badge" style={{ background: '#8b5cf6' }}>Theme: {themeMatch}%</span>}
                                    </div>
                                    <h4 style={{ margin: '0 0 8px', fontSize: 14, color: '#333', lineHeight: 1.3 }}>
                                        {act.name || 'Activity'}
                                    </h4>
                                    <div className="popup-details">
                                        <p>🕐 <strong>Time:</strong> {act.time || 'TBD'}</p>
                                        <p>📍 <strong>Location:</strong> {act.city || act.location || 'N/A'}</p>
                                        <p>🆔 <strong>ID:</strong> {act.activity_id || 'N/A'}</p>
                                    </div>
                                    <div className="popup-meta">
                                        <p><strong>Coords:</strong> {act.lat.toFixed(4)}, {act.lng.toFixed(4)}</p>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                });
            })}

            {/* Hotel markers */}
            {hotels.map((h, hIdx) => {
                const lat = h.latitude || h.lat;
                const lng = h.longitude || h.lng;
                if (!lat || !lng) return null;

                const hotelName = (h.name || h.hotel_name || '').toLowerCase().trim();
                const isSelected = selectedHotelInfo.names.has(hotelName);
                const markerColor = isSelected ? '#10b981' : '#8b5cf6';
                const markerSize = isSelected ? 42 : 32;
                const hotelImageUrl = getFirstImageUrl(h.image);
                const checkIn = h.check_in || '14:00';
                const checkOut = h.check_out || '11:00';
                const nights = h.nights || 1;
                const hotelDays = Object.entries(selectedHotelInfo.dayMap)
                    .filter(([, name]) => name === hotelName)
                    .map(([day]) => parseInt(day));

                const icon = L.divIcon({
                    className: 'hotel-marker-icon',
                    html: `<div style="background:${markerColor};width:${markerSize}px;height:${markerSize}px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:${isSelected ? 18 : 14}px;border:${isSelected ? 4 : 2}px solid ${isSelected ? '#fbbf24' : '#fff'};box-shadow:0 3px 12px rgba(0,0,0,.4);${isSelected ? 'animation:pulse 2s infinite;' : ''}">${isSelected ? '⭐' : '🏨'}</div>`,
                    iconSize: [markerSize, markerSize],
                    iconAnchor: [markerSize / 2, markerSize / 2],
                });

                return (
                    <Marker
                        key={`hotel-${hIdx}`}
                        position={[lat, lng]}
                        icon={icon}
                        zIndexOffset={isSelected ? 1000 : 0}
                        ref={el => {
                            if (isSelected && el) {
                                hotelMarkerRefs.current[hotelName] = el;
                                hotelDays.forEach(day => { hotelMarkerRefs.current[`day-${day}`] = el; });
                            }
                        }}
                    >
                        <Popup maxWidth={320}>
                            <div style={{ minWidth: 240, maxWidth: 300, padding: 4 }}>
                                {hotelImageUrl && (
                                    <img src={hotelImageUrl} alt={h.name || h.hotel_name}
                                        style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 8, marginBottom: 10 }}
                                        onError={e => { e.target.style.display = 'none'; }} />
                                )}
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                                    <span className="popup-badge" style={{ background: isSelected ? '#10b981' : '#8b5cf6' }}>
                                        {isSelected ? `⭐ YOUR HOTEL${hotelDays.length > 0 ? ` (Day ${hotelDays.join(', ')})` : ''}` : '🏨 AVAILABLE'}
                                    </span>
                                    <span className="popup-badge" style={{ background: '#f59e0b' }}>⭐ {h.stars || h.star_classification || 'N/A'} Star</span>
                                </div>
                                <h4 style={{ margin: '0 0 8px', fontSize: 14, color: '#333' }}>{h.name || h.hotel_name}</h4>
                                <div className="popup-details">
                                    <p>📍 <strong>Location:</strong> {h.city || h.address || 'N/A'}</p>
                                    <p>📅 <strong>Dates:</strong> {checkIn} → {checkOut}</p>
                                    <p>🌙 <strong>Nights:</strong> {nights}</p>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}

            {/* Day route lines (dashed with color per day) */}
            {Object.entries(dayRoutes).map(([day, coords]) => {
                if (coords.length < 2) return null;
                const color = DAY_COLORS[(parseInt(day) - 1) % DAY_COLORS.length];
                return (
                    <Polyline
                        key={`route-${day}`}
                        positions={coords}
                        pathOptions={{ color, weight: 4, opacity: 0.85, dashArray: '10, 6', lineCap: 'round', lineJoin: 'round' }}
                    />
                );
            })}

            {/* Arrow direction markers */}
            {arrowPoints.map(arrow => {
                const icon = L.divIcon({
                    className: 'arrow-marker',
                    html: `<div style="color:${arrow.color};font-size:18px;font-weight:bold;transform:rotate(${90 - arrow.angle}deg);text-shadow:0 0 4px rgba(0,0,0,.5);">➤</div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10],
                });
                return (
                    <Marker
                        key={arrow.key}
                        position={arrow.pos}
                        icon={icon}
                        interactive={false}
                    />
                );
            })}
        </MapContainer>
    );
}
