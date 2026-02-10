import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getFirstImageUrl, DAY_COLORS } from '../utils/helpers';
import './MapView.css';

/* ── Fly-to controller ── */
function FlyController({ flyTo, markers }) {
    const map = useMap();
    useEffect(() => {
        if (!flyTo) return;
        map.flyTo([flyTo.lat, flyTo.lng], 13, { duration: 1.2 });
        // open popup on the matching marker
        setTimeout(() => {
            markers.current.forEach((m, i) => {
                if (i === flyTo.productIndex && m) m.openPopup();
            });
        }, 1300);
    }, [flyTo]);
    return null;
}

/* ── Day highlight controller ── */
function DayHighlight({ selectedDay, products, itinerary, hotelMarkersRef }) {
    const map = useMap();
    useEffect(() => {
        const dayNum = selectedDay + 1;
        const dayProducts = products.filter(p => p.day === dayNum);
        const bounds = dayProducts
            .filter(p => { const c = p.matched_coordinates || p.coordinates; return c?.lat && c?.lng; })
            .map(p => { const c = p.matched_coordinates || p.coordinates; return [c.lat, c.lng]; });

        // Also add hotel coords
        const dayData = itinerary.find(d => d.day === dayNum) || itinerary[dayNum - 1];
        const hotelKey = `day-${dayNum}`;
        const hotelMarker = hotelMarkersRef.current[hotelKey];
        if (hotelMarker) {
            const ll = hotelMarker.getLatLng();
            bounds.push([ll.lat, ll.lng]);
        }

        if (bounds.length > 0) {
            map.fitBounds(bounds, { padding: [80, 80], maxZoom: 12 });
            if (hotelMarker) setTimeout(() => hotelMarker.openPopup(), 400);
        }
    }, [selectedDay]);
    return null;
}

/* ── Main MapView ── */
export default function MapView({ data, selectedDay, flyTo }) {
    const { products, itinerary, hotels } = data;
    const markerRefs = useRef([]);
    const hotelMarkerRefs = useRef({});

    // Build activity route coordinates
    const routeData = useMemo(() => {
        const allCoords = [];
        const byDay = {};
        products.forEach(p => {
            const coords = p.matched_coordinates || p.coordinates;
            if (coords?.lat && coords?.lng) {
                allCoords.push({ day: p.day, time: p.time || '00:00', coords: [coords.lat, coords.lng] });
                if (!byDay[p.day]) byDay[p.day] = [];
                byDay[p.day].push({ coords: [coords.lat, coords.lng], time: p.time || '00:00' });
            }
        });
        allCoords.sort((a, b) => a.day !== b.day ? a.day - b.day : a.time.localeCompare(b.time));
        Object.values(byDay).forEach(arr => arr.sort((a, b) => a.time.localeCompare(b.time)));
        return { allCoords, byDay };
    }, [products]);

    // Selected hotel names from itinerary
    const selectedHotelNames = useMemo(() => {
        const names = new Set();
        const dayMap = {};
        itinerary.forEach(day => {
            const h = day.hotel || day.overnight_stay || {};
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
        products.forEach(p => {
            const c = p.matched_coordinates || p.coordinates;
            if (c?.lat && c?.lng) pts.push([c.lat, c.lng]);
        });
        hotels.forEach(h => { if (h.latitude && h.longitude) pts.push([h.latitude, h.longitude]); });
        return pts.length > 0 ? pts : [[7.8731, 80.7718]];
    }, [products, hotels]);

    // Reset marker refs
    useEffect(() => {
        markerRefs.current = markerRefs.current.slice(0, products.length);
    }, [products]);

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

            <FlyController flyTo={flyTo} markers={markerRefs} />
            <DayHighlight
                selectedDay={selectedDay}
                products={products}
                itinerary={itinerary}
                hotelMarkersRef={hotelMarkerRefs}
            />

            {/* Activity markers */}
            {products.map((p, idx) => {
                const coords = p.matched_coordinates || p.coordinates;
                if (!coords?.lat || !coords?.lng) return null;
                const color = DAY_COLORS[(p.day - 1) % DAY_COLORS.length];
                const imageUrl = getFirstImageUrl(p.image);
                const similarityScore = p.similarity_score || p.match_score || p.score || 'N/A';
                const formattedScore = typeof similarityScore === 'number' ? (similarityScore * 100).toFixed(1) + '%' : similarityScore;
                const rank = p.rank || p.priority || idx + 1;
                const region = p.region || p.matched_region || '';

                return (
                    <CircleMarker
                        key={`act-${idx}`}
                        center={[coords.lat, coords.lng]}
                        radius={12}
                        pathOptions={{ fillColor: color, color: '#fff', weight: 3, opacity: 1, fillOpacity: 0.9 }}
                        ref={el => { markerRefs.current[idx] = el; }}
                    >
                        <Popup maxWidth={360}>
                            <div style={{ minWidth: 260, maxWidth: 340, padding: 4 }}>
                                {imageUrl && (
                                    <img
                                        src={imageUrl}
                                        alt={p.matched_product_name || p.name}
                                        style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, marginBottom: 10 }}
                                        onError={e => { e.target.style.display = 'none'; }}
                                    />
                                )}
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                                    <span className="popup-badge" style={{ background: color }}>Day {p.day}</span>
                                    <span className="popup-badge" style={{ background: '#10b981' }}>Rank #{rank}</span>
                                    <span className="popup-badge" style={{ background: '#f59e0b' }}>{formattedScore} Match</span>
                                </div>
                                <h4 style={{ margin: '0 0 10px', fontSize: 15, color: '#333', lineHeight: 1.3 }}>
                                    {p.matched_product_name || p.product_name || p.name}
                                </h4>
                                <div className="popup-details">
                                    <p>🕐 <strong>Time:</strong> {p.time || 'TBD'}</p>
                                    <p>⏱️ <strong>Duration:</strong> {p.duration_hours ? p.duration_hours + ' hours' : 'N/A'}</p>
                                    <p>📍 <strong>Location:</strong> {p.matched_city || p.location || 'N/A'}</p>
                                    {region && <p>🗺️ <strong>Region:</strong> {region}</p>}
                                </div>
                                <div className="popup-meta">
                                    <p><strong>ID:</strong> {p.lifestyle_id || p.matched_lifestyle_id || p.id || 'N/A'}</p>
                                    <p><strong>Coords:</strong> {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</p>
                                </div>
                            </div>
                        </Popup>
                    </CircleMarker>
                );
            })}

            {/* Hotel markers */}
            {hotels.map((h, hIdx) => {
                if (!h.latitude || !h.longitude) return null;
                const hotelName = (h.name || h.hotel_name || '').toLowerCase().trim();
                const isSelected = selectedHotelNames.names.has(hotelName);
                const markerColor = isSelected ? '#10b981' : '#8b5cf6';
                const markerSize = isSelected ? 42 : 32;
                const hotelImageUrl = getFirstImageUrl(h.hotel_image || h.image);
                const checkIn = h.check_in || h.check_in_time || '14:00';
                const checkOut = h.check_out || h.check_out_time || '11:00';
                const nights = h.nights || h.total_nights || 1;
                const adults = h.adults || h.adult_count || 2;

                const hotelDays = Object.entries(selectedHotelNames.dayMap)
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
                        position={[h.latitude, h.longitude]}
                        icon={icon}
                        zIndexOffset={isSelected ? 1000 : 0}
                        ref={el => {
                            if (isSelected && el) {
                                hotelMarkerRefs.current[hotelName] = el;
                                hotelDays.forEach(day => { hotelMarkerRefs.current[`day-${day}`] = el; });
                            }
                        }}
                    >
                        <Popup maxWidth={350}>
                            <div style={{ minWidth: 240, maxWidth: 320, padding: 4 }}>
                                {hotelImageUrl && (
                                    <img src={hotelImageUrl} alt={h.name || h.hotel_name}
                                        style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 10 }}
                                        onError={e => { e.target.style.display = 'none'; }} />
                                )}
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                                    <span className="popup-badge" style={{ background: isSelected ? '#10b981' : '#8b5cf6' }}>
                                        {isSelected ? `⭐ YOUR HOTEL${hotelDays.length > 0 ? ` (Day ${hotelDays.join(', ')})` : ''}` : '🏨 AVAILABLE'}
                                    </span>
                                    <span className="popup-badge" style={{ background: '#f59e0b' }}>⭐ {h.stars || h.star_classification || 'N/A'} Star</span>
                                </div>
                                <h4 style={{ margin: '0 0 10px', fontSize: 15, color: '#333' }}>{h.name || h.hotel_name}</h4>
                                <div className="popup-details">
                                    <p>📍 <strong>Location:</strong> {h.city || h.hotel_city || 'N/A'}</p>
                                    <p>🛏️ <strong>Room:</strong> {h.room_type || 'Standard Room'}</p>
                                    <p>🌙 <strong>Nights:</strong> {nights}</p>
                                    <p>👥 <strong>Guests:</strong> {adults} Adults</p>
                                </div>
                                <div style={{ display: 'flex', gap: 10, margin: '10px 0' }}>
                                    <div style={{ flex: 1, background: '#e8f5e9', borderRadius: 6, padding: 8, textAlign: 'center' }}>
                                        <div style={{ fontSize: 10, color: '#2e7d32', fontWeight: 600 }}>CHECK-IN</div>
                                        <div style={{ fontSize: 14, color: '#1b5e20', fontWeight: 700 }}>{checkIn}</div>
                                    </div>
                                    <div style={{ flex: 1, background: '#ffebee', borderRadius: 6, padding: 8, textAlign: 'center' }}>
                                        <div style={{ fontSize: 10, color: '#c62828', fontWeight: 600 }}>CHECK-OUT</div>
                                        <div style={{ fontSize: 14, color: '#b71c1c', fontWeight: 700 }}>{checkOut}</div>
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}

            {/* Complete route line */}
            {routeData.allCoords.length > 1 && (
                <Polyline
                    positions={routeData.allCoords.map(r => r.coords)}
                    pathOptions={{ color: '#6366f1', weight: 4, opacity: 0.7, smoothFactor: 1 }}
                />
            )}

            {/* Day-colored route segments */}
            {Object.entries(routeData.byDay).map(([day, items]) => {
                if (items.length < 2) return null;
                const color = DAY_COLORS[(parseInt(day) - 1) % DAY_COLORS.length];
                return (
                    <Polyline
                        key={`route-${day}`}
                        positions={items.map(i => i.coords)}
                        pathOptions={{ color, weight: 5, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }}
                    />
                );
            })}
        </MapContainer>
    );
}
