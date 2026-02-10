export const greetings = [
    "Hey there! 👋 Ready for an adventure in Sri Lanka?",
    "Welcome, traveler! 🌴 Let me help you discover paradise!",
    "Hi! I'm Eve 🤖✨ Your specialized travel assistant!",
    "Hello, explorer! 🧭 Sri Lanka is beautiful this time of year!",
    "Hey! 🌟 Let's craft your perfect journey together!",
    "Ayubowan! 🙏 That's how we say 'Long Life' here!",
];

export const recommendations = [
    "How about a scenic train ride through Ella's tea estates today? 🚂🍃",
    "Have you considered visiting Sigiriya Rock Fortress? It's truly breathtaking! 🏰",
    "Mirissa is perfect for whale watching this season! 🐋🌊",
    "The Temple of the Sacred Tooth Relic in Kandy is a must-visit! 🛕✨",
    "Yala National Park is one of the best places to spot leopards! 🐆",
    "How about a sunset at Galle Fort? The views are spectacular! 🌅",
    "The Nine Arches Bridge in Ella is one of the most photographed spots! 📸",
    "Don't miss the ancient city of Polonnaruwa — the ruins are incredible! 🏛️",
    "A boat ride on Madu River to explore mangroves sounds wonderful! 🚣",
    "The beaches of Unawatuna are perfect for snorkeling! 🤿🐠",
    "Nuwara Eliya has the most charming tea plantations! ☕",
    "Pinnawala Elephant Orphanage is a heartwarming experience! 🐘💕",
];

export const quotes = [
    '"Travel is the only thing you buy that makes you richer." ✨',
    '"The world is a book, and those who do not travel read only one page." 📖',
    '"Life is short and the world is wide." 🌍',
    '"Adventure is worthwhile in itself." — Amelia Earhart ✈️',
    '"Collect moments, not things." 📸',
    '"Not all who wander are lost." — J.R.R. Tolkien 🧭',
    '"Travel far enough, you meet yourself." 🪞',
    '"To travel is to live." — Hans Christian Andersen 🌟',
    '"Jobs fill your pocket, but adventures fill your soul." 💫',
    '"Take only memories, leave only footprints." 👣',
    '"We travel, some of us forever, to seek other states, other lives, other souls." — Anaïs Nin 🌌',
    '"I haven\'t been everywhere, but it\'s on my list." 📝',
];

export const tips = [
    "Don't forget to try hoppers for breakfast — a Sri Lankan must-try! 🍳",
    "Pro tip: The Colombo-Kandy train ride has amazing scenic views! 🚂",
    "Carry sunscreen and mosquito repellent — trust me on this! ☀️🦟",
    "Sri Lankan kottu roti is street food heaven — try it! 🥘",
    "Respect local customs — dress modestly when visiting temples 🙏",
    "Tuk-tuks are a fun and affordable way to get around! 🛺",
    "Fresh king coconut water is the perfect refreshment here! 🥥",
    "Bargaining at local markets is expected and part of the fun! 🛍️",
];

// Seasonal Logic
const seasonalTips = {
    0: { region: "South/West", msg: "It's January! perfect for the beaches in the South like Mirissa & Galle! ☀️" }, // Jan
    1: { region: "South/West", msg: "February is amazing for whale watching in Mirissa! 🐋" },
    2: { region: "South/West", msg: "March brings sunny days to the West Coast. Try Bentota! 🏖️" },
    3: { region: "South/West", msg: "April is festive! Experience the Sinhala & Tamil New Year vibe! 🎆" },
    4: { region: "East", msg: "It's May! The East Coast season begins. Head to Trincomalee! 🌊" },
    5: { region: "East", msg: "June is perfect for surfing in Arugam Bay! 🏄‍♂️" },
    6: { region: "East", msg: "July is great for the Minneriya Elephant Gathering! 🐘" },
    7: { region: "East", msg: "August brings the Kandy Esala Perahera — a spectacular festival! 🥁" },
    8: { region: "East", msg: "September is lovely in Pasikudah. calm waters waiting for you! 🏝️" },
    9: { region: "South/West", msg: "October can be rainy, but the waterfalls in Nuwara Eliya look majestic! 🌧️💦" },
    10: { region: "South/West", msg: "November marks the start of the South Coast season! 🌊" },
    11: { region: "South/West", msg: "December is peak season! Perfect holiday vibes in Galle! 🎄" },
};

const durationIdeas = [
    "Thinking of a quick getaway? How about a 2-day trip to Kandy & Sigiriya? 🏰",
    "A 3-day beach retreat to Mirissa sounds relaxing, doesn't it? 🏖️",
    "Got 5 days? You could cover the Cultural Triangle and Hill Country! ⛰️",
    "For a 2-day adventure, try white water rafting in Kitulgala! 🚣‍♂️",
    "A weekend in Nuwara Eliya? Perfect for tea lovers! ☕",
];

export function getRandomMessage() {
    const month = new Date().getMonth();

    // Weighted random selection:
    // 30% Seasonal/Month specific
    // 20% Duration ideas
    // 20% Quotes
    // 15% General Recommendations
    // 15% Tips

    const rand = Math.random();

    if (rand < 0.30) {
        return { type: 'seasonal', text: seasonalTips[month].msg };
    } else if (rand < 0.50) {
        return { type: 'trip_idea', text: durationIdeas[Math.floor(Math.random() * durationIdeas.length)] };
    } else if (rand < 0.70) {
        return { type: 'quote', text: quotes[Math.floor(Math.random() * quotes.length)] };
    } else if (rand < 0.85) {
        return { type: 'recommendation', text: recommendations[Math.floor(Math.random() * recommendations.length)] };
    } else {
        return { type: 'tip', text: tips[Math.floor(Math.random() * tips.length)] };
    }
}

export function getRandomGreeting() {
    return greetings[Math.floor(Math.random() * greetings.length)];
}
