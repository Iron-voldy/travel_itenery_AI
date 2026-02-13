const WEBHOOK_URL = '/webhook/travel-itinerary1';

export async function generateItinerary(prompt) {
    const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatInput: prompt }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const rawData = await response.json();
    return normalizeResponse(rawData);
}

export function normalizeResponse(rawData) {
    const data = Array.isArray(rawData) ? rawData[0] : rawData;

    // ── Normalize destination ──
    if (data.destination_info && !data.destination) {
        data.destination = data.destination_info.country || 'Sri Lanka Adventure';
    }

    // ── Normalize travel_details ──
    if (data.travel_details) {
        const td = data.travel_details;
        if (!td.travel_dates && (td.start_date || td.end_date)) {
            td.travel_dates = { start_date: td.start_date, end_date: td.end_date };
        }
        if (!td.duration && td.total_days) {
            td.duration = { total_days: td.total_days };
        }
        if (td.travellers && !td.travelers) {
            td.travelers = {
                adults: td.travellers.adults || 2,
                children: Array.isArray(td.travellers.children) ? td.travellers.children.length : (td.travellers.children || 0),
            };
        }
    }

    // ── match_rate as string ──
    if (data.matching_summary && typeof data.matching_summary.match_rate === 'number') {
        data.matching_summary.match_rate = data.matching_summary.match_rate + '%';
    }

    // ── Normalize all_activities_with_ids ──
    if (data.all_activities_with_ids) {
        data.all_activities_with_ids = data.all_activities_with_ids.map(p => ({
            ...p,
            day: p.day_assigned || p.day,
            time: p.time_slot || p.time,
            matched_coordinates: p.matched_coordinates || (p.lat != null && p.lng != null ? { lat: p.lat, lng: p.lng } : null),
            coordinates: p.coordinates || (p.lat != null && p.lng != null ? { lat: p.lat, lng: p.lng } : null),
            lifestyle_id: p.activity_id || p.lifestyle_id,
            matched_product_name: p.name || p.matched_product_name,
            matched_city: p.city || p.matched_city,
        }));
    }

    // ── Build hotel days map from itinerary ──
    const hotelDaysMap = {};
    if (data.detailed_itinerary) {
        data.detailed_itinerary.forEach(day => {
            if (day.hotel) {
                const hName = (day.hotel.name || day.hotel.hotel_name || '').toLowerCase().trim();
                if (!hotelDaysMap[hName]) {
                    hotelDaysMap[hName] = { check_in: day.hotel.check_in, check_out: day.hotel.check_out, nights: 0, days: [] };
                }
                hotelDaysMap[hName].nights++;
                hotelDaysMap[hName].days.push(day.day);
                hotelDaysMap[hName].check_out = day.hotel.check_out;
            }
        });
    }

    // ── Normalize hotel_recommendations ──
    if (data.hotel_recommendations) {
        data.hotel_recommendations = data.hotel_recommendations.map(h => {
            const hName = (h.name || h.hotel_name || '').toLowerCase().trim();
            const dayInfo = hotelDaysMap[hName];
            return {
                ...h,
                latitude: h.lat || h.latitude,
                longitude: h.lng || h.longitude,
                hotel_name: h.name || h.hotel_name,
                star_classification: h.stars || h.star_classification,
                check_in: h.check_in || (dayInfo?.check_in) || '',
                check_out: h.check_out || (dayInfo?.check_out) || '',
                nights: h.nights || (dayInfo?.nights) || 1,
                hotel_days: dayInfo?.days || [],
            };
        });
    }

    // ── Normalize detailed_itinerary ──
    if (data.detailed_itinerary) {
        data.detailed_itinerary = data.detailed_itinerary.map(day => ({
            ...day,
            hotel: day.hotel ? {
                ...day.hotel,
                hotel_name: day.hotel.name || day.hotel.hotel_name,
                star_classification: day.hotel.stars || day.hotel.star_classification,
            } : day.hotel,
            activities: (day.activities || []).map(act => ({
                ...act,
                time: act.time_slot || act.time,
                location: act.city || act.location,
            })),
        }));
    }

    // ── Normalize verification (flat → nested) ──
    if (data.verification && data.verification.passed !== undefined && !data.verification.feasibility) {
        const v = data.verification;
        const qr = data.ai_quality_review || {};
        data.verification = {
            feasibility: {
                is_feasible: v.passed,
                score: v.ai_quality_pass ? 'Pass' : 'Fail',
                checks: v.checks || [],
                warnings: v.warnings || [],
            },
            quality: {
                passes_quality: qr.is_valid !== undefined ? qr.is_valid : v.ai_quality_pass,
                quality_score: qr.quality_score || 'N/A',
                match_rate: data.matching_summary?.match_rate || '100%',
                overall_quality: qr.overall_quality || '',
                issues: qr.issues || [],
                route_efficiency_score: qr.route_efficiency_score,
                diversity_score: qr.diversity_score,
            },
        };
    }

    // ── Extract everything for the UI ──
    const itinerary = data.detailed_itinerary || data.itinerary || [];
    const products = data.all_activities_with_ids || data.matched_products || [];
    const hotels = data.hotel_recommendations || [];
    const tips = data.travel_tips || data.tips || [];
    const regions = data.regions || {};
    const routePlan = data.route_plan || data.routePlan || [];
    const verification = data.verification?.feasibility || data.feasibility || {};
    const qualityVerification = data.verification?.quality || {};
    const travelDetails = data.travel_details || {};
    const itinerarySummary = data.itinerary_summary || {};
    const matchingSummary = data.matching_summary || {};
    const travelTimes = data.travel_times || [];
    const routeOptimization = data.route_optimization || {};

    const tripTitle = itinerarySummary.destination || travelDetails.destination?.city || data.destination || 'Sri Lanka Adventure';
    const startDate = travelDetails.travel_dates?.start_date || '';
    const endDate = travelDetails.travel_dates?.end_date || '';
    const totalDays = itinerary.length || travelDetails.duration?.total_days || itinerarySummary.total_days || 0;
    const totalActivities = itinerarySummary.total_activities || products.length || itinerary.reduce((sum, day) => sum + (day.activities?.length || 0), 0);
    const adults = travelDetails.travelers?.adults || 2;
    const children = travelDetails.travelers?.children || 0;

    return {
        raw: data,
        itinerary,
        products,
        hotels,
        tips,
        regions,
        routePlan,
        verification,
        qualityVerification,
        matchingSummary,
        travelDetails,
        travelTimes,
        routeOptimization,
        tripTitle,
        startDate,
        endDate,
        totalDays,
        totalActivities,
        adults,
        children,
    };
}
