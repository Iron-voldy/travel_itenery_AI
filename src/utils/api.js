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

    const itinerary = data.detailed_itinerary || data.itinerary || data.generatedItinerary?.itinerary || data.daily_itinerary || [];
    const products = data.all_activities_with_ids || data.matched_products || [];
    const hotels = data.hotel_recommendations || data.dbHotels || [];
    const tips = data.travel_tips || data.tips || [];
    const regions = data.regions || {};
    const routePlan = data.route_plan || data.routePlan || [];
    const verification = data.verification?.feasibility || data.feasibility || {};
    const qualityVerification = data.verification?.quality || {};
    const travelDetails = data.travel_details || data.travelDetails || {};
    const itinerarySummary = data.itinerary_summary || {};
    const matchingSummary = data.matching_summary || {};

    const tripTitle = itinerarySummary.destination || travelDetails.destination?.city || data.destination || data.trip_destination || 'Sri Lanka Adventure';
    const startDate = travelDetails.travel_dates?.start_date || data.dates?.start || data.start_date || '';
    const endDate = travelDetails.travel_dates?.end_date || data.dates?.end || data.end_date || '';
    const totalDays = itinerary.length || travelDetails.duration?.total_days || itinerarySummary.total_days || 0;
    const totalActivities = products.length || itinerary.reduce((sum, day) => sum + (day.activities?.length || 0), 0);
    const adults = travelDetails.travelers?.adults || data.adults || 2;
    const children = travelDetails.travelers?.children || data.children || 0;

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
        tripTitle,
        startDate,
        endDate,
        totalDays,
        totalActivities,
        adults,
        children,
    };
}
