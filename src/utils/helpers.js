export function getFirstImageUrl(imageField) {
    if (!imageField) return null;
    if (typeof imageField === 'string') {
        if (imageField.startsWith('[')) {
            try {
                const arr = JSON.parse(imageField);
                return arr[0] || null;
            } catch {
                return imageField.split(',')[0].trim();
            }
        }
        return imageField;
    }
    if (Array.isArray(imageField)) return imageField[0] || null;
    return null;
}

export const DAY_COLORS = [
    '#6366f1', '#06b6d4', '#10b981', '#f59e0b',
    '#ef4444', '#8b5cf6', '#ec4899',
];

export const EXAMPLE_PROMPTS = [
    { emoji: '🛕', label: 'Religious Tour', prompt: '3 day Kandy religious temple tour' },
    { emoji: '🦁', label: 'Wildlife Safari', prompt: '5 day cultural triangle with wildlife safari' },
    { emoji: '🏖️', label: 'Beach Vacation', prompt: '4 day beach vacation in Mirissa and Galle' },
    { emoji: '🗺️', label: 'Round Trip', prompt: '7 day Sri Lanka round trip, avoid adventure sports' },
    { emoji: '🚂', label: 'Tea & Train', prompt: '3 day Ella tea estates and scenic train ride' },
];
