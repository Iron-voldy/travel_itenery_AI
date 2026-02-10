import { useEffect } from 'react';
import { getFirstImageUrl } from '../utils/helpers';

export default function PdfExport({ data }) {
    useEffect(() => {
        const handlePrint = () => {
            if (!data) return;
            generatePdf(data);
        };

        window.addEventListener('print-itinerary', handlePrint);
        return () => window.removeEventListener('print-itinerary', handlePrint);
    }, [data]);

    return null;
}

function generatePdf(data) {
    const { itinerary, hotels, products, tripTitle, startDate, endDate, totalDays, adults, children } = data;

    let content = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${tripTitle}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #333; }
        .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #6366f1; }
        h1 { color: #6366f1; margin: 0; font-size: 28px; }
        .meta { color: #666; margin-top: 10px; font-size: 14px; }
        .hotel-section { margin-bottom: 25px; background: #f8f5ff; border-radius: 10px; padding: 20px; border-left: 4px solid #8b5cf6; }
        .hotel-title { color: #8b5cf6; margin: 0 0 15px 0; font-size: 16px; }
        .hotel-card { margin-bottom: 12px; padding: 12px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .day-section { margin-bottom: 25px; page-break-inside: avoid; }
        .day-header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 20px; border-radius: 8px; margin-bottom: 15px; }
        .day-hotel { background: #f0f9ff; padding: 10px 15px; border-radius: 6px; margin-bottom: 12px; font-size: 13px; border: 1px solid #e0f2fe; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { padding: 10px 15px; text-align: left; border-bottom: 2px solid #6366f1; background: #f8f9fa; }
        td { padding: 12px 15px; border-bottom: 1px solid #eee; }
        .footer { margin-top: 30px; text-align: center; color: #999; font-size: 11px; padding-top: 20px; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🌴 ${tripTitle}</h1>
        <div class="meta">
          ${startDate} ${endDate ? '→ ' + endDate : ''} | ${totalDays} Days<br>
          👥 ${adults} Adults${children > 0 ? `, ${children} Children` : ''}
        </div>
      </div>

      ${hotels.length > 0 ? `
        <div class="hotel-section">
          <h3 class="hotel-title">🏨 Hotel Accommodations</h3>
          ${hotels.map(h => {
        const checkIn = h.check_in || h.check_in_time || '14:00';
        const checkOut = h.check_out || h.check_out_time || '11:00';
        const nights = h.nights || h.total_nights || 1;
        return `
              <div class="hotel-card">
                <strong>${h.name || h.hotel_name}</strong>
                <span style="color: #f59e0b; margin-left: 8px;">⭐ ${h.stars || h.star_classification || 'N/A'} Star</span>
                <div style="margin-top: 6px; font-size: 12px; color: #666;">
                  📍 ${h.city || h.hotel_city} • 🌙 ${nights} Night${nights > 1 ? 's' : ''}
                </div>
                <div style="margin-top: 6px; font-size: 12px;">
                  <span style="color: #2e7d32; margin-right: 15px;">📥 ${checkIn}</span>
                  <span style="color: #c62828;">📤 ${checkOut}</span>
                </div>
              </div>
            `;
    }).join('')}
        </div>
      ` : ''}

      ${itinerary.map((day, i) => {
        const dayNum = day.day || i + 1;
        const hotel = day.hotel || day.overnight_stay || {};
        return `
          <div class="day-section">
            <div class="day-header">
              <strong>Day ${dayNum} - ${day.theme || day.region || 'Exploration'}</strong>
              <span style="font-size: 12px; opacity: 0.9; margin-left: 10px;">${day.date || ''}</span>
            </div>
            ${hotel.hotel_name ? `
              <div class="day-hotel">
                🏨 <strong>${hotel.hotel_name}</strong>
                <span style="color: #666;">• ⭐ ${hotel.star_classification || 'N/A'} Star</span>
              </div>
            ` : ''}
            <table>
              <thead>
                <tr>
                  <th style="width: 80px;">Time</th>
                  <th>Activity</th>
                  <th style="width: 120px;">Location</th>
                  <th style="width: 80px;">Duration</th>
                </tr>
              </thead>
              <tbody>
                ${(day.activities || []).map(act => {
            const match = products.find(p => p.day === dayNum && (p.matched_product_name === act.name || p.name === act.name));
            const location = act.location || match?.matched_city || match?.location || '';
            return `
                    <tr>
                      <td style="color: #6366f1; font-weight: 600;">${act.time || 'TBD'}</td>
                      <td>${act.name || act.activity_name}</td>
                      <td style="color: #666;">${location}</td>
                      <td>${act.duration_hours ? act.duration_hours + 'h' : 'N/A'}</td>
                    </tr>
                  `;
        }).join('')}
              </tbody>
            </table>
          </div>
        `;
    }).join('')}

      <div class="footer">
        Generated by Sri Lanka Travel AI | ${new Date().toLocaleDateString()}
      </div>
    </body>
    </html>
  `;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(content);
    doc.close();

    setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 500);
}
