export interface Experience {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  schedule: string;
  time: string;
  packageIncludes: string[];
  activities: string[];
  coverImage: string;
  images: string[];
  category: "recurring" | "tour" | "special";
  isFeatured: boolean;
  whatsappMessage: string;
  price: number | null;
  depositAmount: number | null;
  packageTiers?: {
    id: string;
    name: string;
    price: number;
    deposit: number;
    description: string;
  }[];
}

import { WHATSAPP_NUMBER } from "./constants";

function whatsappMsg(name: string): string {
  return `Hi, I'm interested in the ${name} at Hidden Paradise`;
}

export function whatsappLink(experience: Experience): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(experience.whatsappMessage)}`;
}

export const experiences: Experience[] = [
  // ─── RECURRING EXPERIENCES ───────────────────────────────────────────
  {
    slug: "game-night",
    name: "Game Night",
    tagline: "Play hard, laugh harder",
    description:
      "Every Thursday is Game Night at Hidden Paradise. From classic board games like Ludo and Oware to pool party games, video games, and snooker -- there is something for everyone. Gather around the bonfire, play truth or dare, and you might even win a prize.",
    schedule: "Every Thursday",
    time: "8:00 PM \u2013 2:00 AM",
    packageIncludes: [
      "Snooker",
      "Ludo",
      "Oware",
      "Jenga",
      "Table tennis",
      "Pool party games",
      "Video games",
      "Cards",
      "Truth or dare",
      "Win a prize",
      "Bonfire",
    ],
    activities: [
      "Snooker",
      "Ludo",
      "Oware",
      "Jenga",
      "Table tennis",
      "Pool party games",
      "Video games",
      "Cards",
      "Truth or dare",
      "Bonfire",
    ],
    coverImage: "/images/experiences/game-night.jpeg",
    images: ["/images/experiences/game-night.jpeg"],
    category: "recurring",
    isFeatured: true,
    whatsappMessage: whatsappMsg("Game Night"),
    price: 100,
    depositAmount: 50,
  },
  {
    slug: "camping",
    name: "The Camping Experience",
    tagline: "2 nights under the stars",
    description:
      "Escape the city and spend two unforgettable nights under the stars at Hidden Paradise. Enjoy a full weekend of outdoor adventure, delicious meals, and great company surrounded by nature on the Akuse Road.",
    schedule: "Weekends",
    time: "Friday – Sunday",
    packageIncludes: [
      "Tent accommodation",
      "Food & Water (Breakfast, Lunch, Dinner)",
      "Washroom facilities",
      "Snacks on arrival",
      "Goody bag (T-shirt & Plant)",
    ],
    activities: [
      "Boat cruise",
      "Bonfire",
      "Volleyball",
      "Table tennis",
      "Video games",
      "Hiking",
      "Swimming",
      "Movie night",
      "Soccer",
      "Archery",
      "Board games",
      "Music & Good vibes",
    ],
    coverImage: "/images/venue/campground-night.jpeg",
    images: [
      "/images/venue/campground-day.jpeg",
      "/images/venue/campground-night.jpeg",
      "/images/venue/campground-moonrise.jpeg",
      "/images/experiences/camping-2nights.jpeg",
    ],
    category: "recurring",
    isFeatured: true,
    whatsappMessage: whatsappMsg("Camping Experience"),
    price: 400,
    depositAmount: 200,
  },
  {
    slug: "party-in-the-woods",
    name: "Party In The Woods",
    tagline: "Friday nights, reimagined",
    description:
      "Kick off the weekend every Friday with an unforgettable night in the woods. Dive into the pool, gather around the bonfire for storytelling, play games, and enjoy a full meal with drinks -- all surrounded by good music and great energy.",
    schedule: "Every Friday",
    time: "7:00 PM – 5:00 AM",
    packageIncludes: [
      "Pool party",
      "Bonfire (storytelling)",
      "Fun games",
      "Food & Drinks (Starter & Main dish)",
    ],
    activities: [
      "Good music (DJ & Karaoke)",
      "Positive vibes",
      "Networking",
    ],
    coverImage: "/images/venue/pool-party.jpeg",
    images: [
      "/images/venue/pool-party.jpeg",
      "/images/venue/pool-night.jpeg",
      "/images/experiences/party-woods-2.jpeg",
    ],
    category: "recurring",
    isFeatured: true,
    whatsappMessage: whatsappMsg("Party In The Woods"),
    price: 150,
    depositAmount: 75,
    packageTiers: [
      { id: "explorer", name: "The Explorer", price: 150, deposit: 75, description: "Pool Access · All Games · 1 Water · 1 Cocktail" },
      { id: "vip", name: "The Enthusiast (VIP)", price: 350, deposit: 175, description: "Priority Entry · Full BBQ Buffet · 2 Waters · 1 Premium Cocktail · Reserved Seating" },
      { id: "tribe", name: "The Tribe Bundle (Group of 5)", price: 1600, deposit: 800, description: "VIP Table · Full BBQ for 5 · 2 Buckets of Beer · 1 Sparkling Wine · Dedicated Server" },
    ],
  },
  {
    slug: "saturday-bbq",
    name: "Saturday BBQ",
    tagline: "Meat, music, and moonlight",
    description:
      "Every Saturday evening at Hidden Paradise is a feast. Indulge in all types of grilled meats served with fried rice, yam chips, banku, and abolo. Sip on free local drinks and cocktail shots while networking under the stars.",
    schedule: "Every Saturday",
    time: "7:30 PM – Midnight",
    packageIncludes: [
      "All types of meat to munch on (Fried rice, Yam chips, Banku, Abolo)",
      "Free local drinks",
      "Cocktail shots available",
    ],
    activities: [
      "Networking & good vibes",
      "Fun games",
    ],
    coverImage: "/images/experiences/saturday-bbq.jpeg",
    images: ["/images/experiences/saturday-bbq.jpeg"],
    category: "recurring",
    isFeatured: true,
    whatsappMessage: whatsappMsg("Saturday BBQ"),
    price: 200,
    depositAmount: 100,
  },
  {
    slug: "movie-night",
    name: "Friday Movie Night",
    tagline: "Cinema under the stars",
    description:
      "Enjoy free entry to Friday Movie Night at Hidden Paradise. Catch the first showing from 7 to 9 PM or the late showing from 10 PM to 1 AM. Popcorn, games, networking, and food & drinks are all available to make your night complete.",
    schedule: "Every Friday",
    time: "7:00 PM – 1:00 AM",
    packageIncludes: [
      "Free entry",
      "Games",
      "Popcorn",
      "Networking",
    ],
    activities: [
      "First showing 7:00 PM – 9:00 PM",
      "Second showing 10:00 PM – 1:00 AM",
      "Food & drinks available",
    ],
    coverImage: "/images/experiences/movie-night.jpeg",
    images: ["/images/experiences/movie-night.jpeg"],
    category: "recurring",
    isFeatured: false,
    whatsappMessage: whatsappMsg("Friday Movie Night"),
    price: null,
    depositAmount: null,
  },
  {
    slug: "picnic-packages",
    name: "Picnic Packages",
    tagline: "Your perfect outdoor escape",
    description:
      "Choose from our Standard Picnic (serves 2 guests) or Family Picnic (serves 3-8 guests). Each package includes a food basket, umbrella, board games, picnic blanket, cutlery, pillows, cooler with ice, bluetooth speaker, and power bank. Add-ons available: fresh flowers, photoshoot, and tent setup.",
    schedule: "Available daily",
    time: "6 hours duration",
    packageIncludes: [
      "Picnic basket with food",
      "Umbrella",
      "Board games",
      "Picnic blanket",
      "Cutlery and plates",
      "Pillows",
      "Cooler with ice",
      "Bluetooth speaker",
      "Power bank",
    ],
    activities: [
      "Relaxation",
      "Board games",
      "Photography",
    ],
    coverImage: "/images/experiences/picnic-packages.jpeg",
    images: ["/images/experiences/picnic-packages.jpeg"],
    category: "recurring",
    isFeatured: true,
    whatsappMessage: whatsappMsg("Picnic Packages"),
    price: 150,
    depositAmount: 75,
  },

  // ─── TOUR EXPERIENCES ────────────────────────────────────────────────
  {
    slug: "krobo-mountain-hike",
    name: "Krobo Mountain Hiking Tour",
    tagline: "Conquer the Krobo Mountain",
    description:
      "Take on the Krobo Mountain with a guided hiking tour. The adventure includes snacks on the trail, a hearty lunch back at Hidden Paradise, and time to unwind with board games, swimming, and soccer. You will also take home a goody bag.",
    schedule: "Saturdays",
    time: "9:00 AM – 5:00 PM",
    packageIncludes: [
      "Hike the Krobo Mountain",
      "Snacks on the hike",
      "Lunch in Hidden Paradise",
      "Goody bag",
      "Shower & washroom facilities",
    ],
    activities: [
      "Board games",
      "Swimming",
      "Soccer",
    ],
    coverImage: "/images/experiences/krobo-hike.jpeg",
    images: ["/images/experiences/krobo-hike.jpeg"],
    category: "tour",
    isFeatured: true,
    whatsappMessage: whatsappMsg("Krobo Mountain Hiking Tour"),
    price: 200,
    depositAmount: 100,
  },
  {
    slug: "yogaga-mountain-hike",
    name: "Mountain Yogaga Hike",
    tagline: "Explore the Yogaga trail",
    description:
      "Hike the scenic Yogaga Mountain and return to Hidden Paradise for a well-deserved lunch. The full-day package includes snacks on the trail, shower and washroom facilities, and a goody bag. Wind down with board games, swimming, and soccer.",
    schedule: "Saturdays",
    time: "9:00 AM – 5:00 PM",
    packageIncludes: [
      "Hike the Yogaga Mountain",
      "Snacks on the hike",
      "Lunch in Hidden Paradise",
      "Shower and washroom facilities",
      "Goody bag",
    ],
    activities: [
      "Board games",
      "Swimming",
      "Soccer",
    ],
    coverImage: "/images/experiences/yogaga-hike.jpeg",
    images: ["/images/experiences/yogaga-hike.jpeg"],
    category: "tour",
    isFeatured: false,
    whatsappMessage: whatsappMsg("Mountain Yogaga Hike"),
    price: 200,
    depositAmount: 100,
  },
  {
    slug: "shai-hills-tour",
    name: "Hidden Paradise & Shai Hills Reserve Experience",
    tagline: "Nature, history, and adventure",
    description:
      "A full-day adventure combining the Shai Hills Reserve with Hidden Paradise. Enjoy transportation, a professional tour guide, hiking at the reserve, a boat ride on Kpong Dam, swimming pool access, and fun games -- with breakfast and lunch included.",
    schedule: "Weekends",
    time: "6:00 AM – 4:00 PM",
    packageIncludes: [
      "Transportation",
      "Tour charges",
      "Professional tour guide",
      "Hiking at Shai Hills Reserve",
      "Breakfast & Lunch",
      "Boat ride (Kpong Dam)",
      "Swimming pool access",
      "Fun games",
    ],
    activities: [
      "Hiking",
      "Boat ride",
      "Swimming",
      "Games",
    ],
    coverImage: "/images/experiences/shai-hills.jpeg",
    images: ["/images/experiences/shai-hills.jpeg"],
    category: "tour",
    isFeatured: false,
    whatsappMessage: whatsappMsg("Hidden Paradise & Shai Hills Reserve Experience"),
    price: 300,
    depositAmount: 150,
  },
  {
    slug: "eastern-tour",
    name: "Eastern/Volta Tours",
    tagline: "Discover the Eastern/Volta Region",
    description:
      "Explore the best of Ghana's Eastern/Volta region in one packed day. Visit the Volta Lake for a boat cruise, cross the iconic Adome Bridge, tour the Akwamu Museum, hike at Shai Hills Reserve, and finish with lunch at Hidden Paradise. Transportation, snacks, a tour guide, and a photoshoot are all included.",
    schedule: "Weekends",
    time: "9:00 AM – 5:00 PM",
    packageIncludes: [
      "Transportation",
      "Tour charges",
      "Professional tour guide",
      "Snacks on the bus",
      "Volta Lake Boat Cruise",
      "Adome Bridge visit",
      "Akwamu Museum visit",
      "Shai Hills Reserve",
      "Bridge View visit",
      "Networking & good vibes",
      "Fun games",
      "Lunch in Hidden Paradise",
      "Photoshoot",
    ],
    activities: [
      "Volta Lake Boat Cruise",
      "Adome Bridge visit",
      "Akwamu Museum visit",
      "Shai Hills Reserve",
      "Bridge View visit",
      "Networking & good vibes",
      "Fun games",
      "Lunch in Hidden Paradise",
      "Photoshoot",
    ],
    coverImage: "/images/experiences/eastern-tour.jpeg",
    images: ["/images/experiences/eastern-tour.jpeg"],
    category: "tour",
    isFeatured: false,
    whatsappMessage: whatsappMsg("Eastern/Volta Tours"),
    price: 300,
    depositAmount: 150,
  },

  {
    slug: "atv-ride",
    name: "ATV Ride",
    tagline: "Tear through the terrain",
    description:
      "Strap in and throttle through the rugged trails and open grounds of Hidden Paradise on an All-Terrain Vehicle. Whether you are a first-timer or seasoned rider, our guided ATV experience delivers an adrenaline-packed adventure through 300 acres of raw nature.",
    schedule: "Available daily",
    time: "By appointment",
    packageIncludes: [
      "ATV rental",
      "Safety gear (helmet & gloves)",
      "Trail guide",
      "Safety briefing",
    ],
    activities: [
      "Trail riding",
      "Off-road adventure",
      "Photography stops",
    ],
    coverImage: "/images/experiences/atv-ride.jpeg",
    images: ["/images/experiences/atv-ride.jpeg"],
    category: "recurring",
    isFeatured: false,
    whatsappMessage: whatsappMsg("ATV Ride"),
    price: 150,
    depositAmount: 75,
  },
  {
    slug: "bike-ride",
    name: "Bike Ride",
    tagline: "Pedal through paradise",
    description:
      "Explore the scenic trails and lush grounds of Hidden Paradise on two wheels. Our guided bike rides take you through shaded paths, open lawns, and viewpoints across the 300-acre property. Perfect for solo riders, couples, and groups.",
    schedule: "Available daily",
    time: "By appointment",
    packageIncludes: [
      "Bicycle rental",
      "Safety helmet",
      "Trail guide",
      "Refreshments",
    ],
    activities: [
      "Trail cycling",
      "Nature exploration",
      "Photography stops",
    ],
    coverImage: "/images/experiences/bike-ride.jpeg",
    images: ["/images/experiences/bike-ride.jpeg"],
    category: "recurring",
    isFeatured: false,
    whatsappMessage: whatsappMsg("Bike Ride"),
    price: 80,
    depositAmount: 40,
  },

  // ─── SPECIAL EXPERIENCES ─────────────────────────────────────────────
  {
    slug: "sunset-gardens",
    name: "Sunset Gardens",
    tagline: "Nature's beauty, curated",
    description:
      "Beautiful landscaped gardens offering the sale of flowers, flower pots, garden arts, and landscape designs. A tranquil space for photography, shopping, and simply enjoying nature at Hidden Paradise.",
    schedule: "Open daily",
    time: "All day",
    packageIncludes: [
      "Sale of flowers",
      "Sale of flower pots",
      "Sale of garden arts",
      "Landscape designs",
    ],
    activities: [
      "Garden tours",
      "Shopping",
      "Photography",
    ],
    coverImage: "/images/venue/gardens.jpeg",
    images: [
      "/images/venue/gardens.jpeg",
      "/images/experiences/sunset-gardens.jpeg",
    ],
    category: "special",
    isFeatured: false,
    whatsappMessage: whatsappMsg("Sunset Gardens"),
    price: null,
    depositAmount: null,
  },
  {
    slug: "farm",
    name: "Hidden Paradise Farm",
    tagline: "From soil to table",
    description:
      "Visit the Hidden Paradise Farm for a hands-on experience with fresh produce. Take a farm tour, buy spices, herbs, and fresh vegetables, enjoy a farm-to-table meal, or enrol in a learn-to-grow-food course.",
    schedule: "Open daily",
    time: "All day",
    packageIncludes: [
      "Farm tour",
      "Sale of spices & herbs",
      "Sale of fresh vegetables",
      "Farm to table experience",
      "Learn to grow food course",
    ],
    activities: [
      "Farming",
      "Learning",
      "Cooking",
    ],
    coverImage: "/images/experiences/farm.jpeg",
    images: ["/images/experiences/farm.jpeg"],
    category: "special",
    isFeatured: false,
    whatsappMessage: whatsappMsg("Hidden Paradise Farm"),
    price: 80,
    depositAmount: 40,
  },
  {
    slug: "art-show",
    name: "Art Show",
    tagline: "Creativity meets community",
    description:
      "Hidden Paradise's Art Show is a free-entry celebration of creativity. Browse exhibitions, join sip & paint sessions, watch an art auction, try bead making and pottery classes, and enjoy live music, face painting, and fun games throughout the day.",
    schedule: "Special events",
    time: "10:00 AM – 10:00 PM",
    packageIncludes: [
      "Free entry",
      "Art exhibitions",
      "Sip & paint",
      "DJ & music",
      "Face painting",
      "Photography",
      "Art auction",
      "Art competition",
      "Bead making",
      "Pottery classes",
      "Fun games",
      "Networking",
      "Table tennis",
      "Soccer",
    ],
    activities: [
      "Art exhibitions",
      "Sip & paint",
      "DJ & music",
      "Face painting",
      "Photography",
      "Art auction",
      "Art competition",
      "Bead making",
      "Pottery classes",
      "Fun games",
      "Networking",
      "Table tennis",
      "Soccer",
    ],
    coverImage: "/images/experiences/art-show.jpeg",
    images: ["/images/experiences/art-show.jpeg"],
    category: "special",
    isFeatured: false,
    whatsappMessage: whatsappMsg("Art Show"),
    price: null,
    depositAmount: null,
  },
  {
    slug: "family-fun-day",
    name: "Family Fun Day",
    tagline: "Fun for every age",
    description:
      "Bring the whole family to Hidden Paradise for a day packed with activities for all ages. Enjoy free entry with horse riding, bouncy castle, swimming, video games, face painting, arts & crafts, Lego, table tennis, soccer, and more.",
    schedule: "Special events",
    time: "All day",
    packageIncludes: [
      "Free entry",
      "Horse riding",
      "Bouncy castle",
      "Swimming",
      "Video games",
      "Face painting",
      "Table tennis",
      "Soccer",
      "Arts & crafts",
      "Lego & a few games",
    ],
    activities: [
      "Horse riding",
      "Bouncy castle",
      "Swimming",
      "Video games",
      "Face painting",
      "Table tennis",
      "Soccer",
      "Arts & crafts",
      "Lego & a few games",
    ],
    coverImage: "/images/experiences/family-fun-day.jpeg",
    images: ["/images/experiences/family-fun-day.jpeg"],
    category: "special",
    isFeatured: false,
    whatsappMessage: whatsappMsg("Family Fun Day"),
    price: null,
    depositAmount: null,
  },
  {
    slug: "garden-fair",
    name: "Garden Fair",
    tagline: "Bloom, browse, and enjoy",
    description:
      "A free-entry garden event featuring plant and flower exhibitions, garden art and furniture displays, live music, networking, and photoshoots. Browse and buy flowers, flower pots, and garden accessories.",
    schedule: "Special events",
    time: "9:00 AM – 4:00 PM",
    packageIncludes: [
      "Free entry",
      "Plant & flower exhibition",
      "Garden art & furniture exhibition",
      "Networking",
      "Music & DJs",
      "Photoshoot",
      "Sale of flowers/flower pots",
    ],
    activities: [
      "Plant & flower exhibition",
      "Garden art & furniture exhibition",
      "Networking",
      "Music & DJs",
      "Photoshoot",
      "Sale of flowers/flower pots",
    ],
    coverImage: "/images/experiences/garden-fair.jpeg",
    images: ["/images/experiences/garden-fair.jpeg"],
    category: "special",
    isFeatured: false,
    whatsappMessage: whatsappMsg("Garden Fair"),
    price: null,
    depositAmount: null,
  },
  {
    slug: "night-market",
    name: "Night Market",
    tagline: "Shop, vibe, and unwind",
    description:
      "Hidden Paradise's Night Market is a free-entry evening event with music, a bonfire, movies in the park, arts & crafts sales, flea market finds, and fresh farm produce. A perfect way to spend the night with great vibes and good company.",
    schedule: "Special events",
    time: "7:00 PM – 12:00 AM",
    packageIncludes: [
      "Free entry",
      "Music & DJ",
      "Good vibes",
      "Networking",
      "Movies in the park",
      "Bonfire",
      "Arts & crafts sale",
      "Flea market sales",
      "Fresh farm produce sale",
    ],
    activities: [
      "Music & DJ",
      "Networking",
      "Movies in the park",
      "Bonfire",
      "Arts & crafts sale",
      "Flea market sales",
      "Fresh farm produce sale",
    ],
    coverImage: "/images/experiences/night-market.jpeg",
    images: ["/images/experiences/night-market.jpeg"],
    category: "special",
    isFeatured: false,
    whatsappMessage: whatsappMsg("Night Market"),
    price: null,
    depositAmount: null,
  },
];

// ─── HELPER FUNCTIONS ────────────────────────────────────────────────

export function getExperienceBySlug(slug: string): Experience | undefined {
  return experiences.find((e) => e.slug === slug);
}

export function getFeaturedExperiences(): Experience[] {
  return experiences.filter((e) => e.isFeatured);
}

export function getExperiencesByCategory(
  category: Experience["category"],
): Experience[] {
  return experiences.filter((e) => e.category === category);
}
