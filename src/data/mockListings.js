// Curated Mock Listings for Hospitality Resource Exchange
// Real-world hospitality assets: Banquet space, Commercial Kitchens, Valet Parking, Furniture, AV Gear, Refrigerated Fleet

export const RESOURCE_CATEGORIES = [
  { id: 'all', label: 'All Resources', icon: 'Grid' },
  { id: 'banquet', label: 'Banquet & Event Space', icon: 'Building2' },
  { id: 'kitchen', label: 'Commercial Kitchens', icon: 'ChefHat' },
  { id: 'parking', label: 'Event Parking Bays', icon: 'Car' },
  { id: 'furniture', label: 'Chairs & Banquet Ware', icon: 'Armchair' },
  { id: 'av', label: 'AV Gear & Staging', icon: 'Speaker' },
  { id: 'vehicles', label: 'Refrigerated Fleet', icon: 'Truck' },
];

export const INITIAL_LISTINGS = [
  {
    id: 'res-101',
    title: 'Grand Regency Crystal Ballroom',
    category: 'banquet',
    provider: {
      name: 'The Grand Regency Hotel',
      gstVerified: true,
      verifiedId: 'GSTIN27AAACG0823K1ZT',
      rating: 4.94,
      reviewsCount: 48,
      responseTime: '< 15 mins',
      phone: '+91 98200 44122',
      address: 'Plot 14, Bandra Kurla Complex, Mumbai',
      avatar: 'GR'
    },
    location: {
      lat: 19.0657,
      lng: 72.8688,
      distanceKm: 1.2,
      zone: 'BKC Central'
    },
    images: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80'
    ],
    pricing: {
      amount: 14500,
      unit: 'hour',
      currency: '₹',
      minRentalHours: 4
    },
    specs: {
      capacity: '450 Guests',
      areaSqFt: '7,200 sq.ft',
      powerBackup: '100% DG Sync Backup',
      amenities: ['Dedicated Green Rooms', 'Centralized HVAC', 'Service Elevator Access', 'Valet Drop-off Porch'],
      rules: 'No open flame cooking inside hall; Sound restrictions after 10 PM'
    },
    urgentFulfillment: true,
    needsPhysicalTransport: false,
    slots: [
      { id: 'slot-1', date: '2026-09-10', time: '08:00 - 14:00', totalQty: 1, availableQty: 1, heldQty: 0, bookedQty: 0, version: 1 },
      { id: 'slot-2', date: '2026-09-10', time: '15:00 - 22:00', totalQty: 1, availableQty: 0, heldQty: 0, bookedQty: 1, version: 2 }, // Booked
      { id: 'slot-3', date: '2026-09-11', time: '09:00 - 15:00', totalQty: 1, availableQty: 1, heldQty: 0, bookedQty: 0, version: 1 },
      { id: 'slot-4', date: '2026-09-11', time: '16:00 - 23:00', totalQty: 1, availableQty: 1, heldQty: 0, bookedQty: 0, version: 1 }
    ]
  },
  {
    id: 'res-102',
    title: 'Commercial Commissary Kitchen & Bakery Unit',
    category: 'kitchen',
    provider: {
      name: 'Olive Grove Artisanal Catering',
      gstVerified: true,
      verifiedId: 'GSTIN27AABCO2918Q1Z3',
      rating: 4.88,
      reviewsCount: 32,
      responseTime: '< 20 mins',
      phone: '+91 98191 55601',
      address: 'Unit 4B, Peninsula Corporate Park, Lower Parel',
      avatar: 'OG'
    },
    location: {
      lat: 19.0028,
      lng: 72.8311,
      distanceKm: 3.4,
      zone: 'Lower Parel'
    },
    images: [
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1574966739985-303a27230491?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80'
    ],
    pricing: {
      amount: 4200,
      unit: 'hour',
      currency: '₹',
      minRentalHours: 3
    },
    specs: {
      capacity: 'Up to 1,500 meals/shift',
      equipment: ['Rational Combi Oven', 'Walk-in Cold Storage (4°C)', '3-phase 63A power', 'High capacity grease trap'],
      certifications: 'FSSAI Grade A Certified Facility',
      rules: 'Deep cleaning required before handover; strictly veg & clean non-veg separation'
    },
    urgentFulfillment: true,
    needsPhysicalTransport: false,
    slots: [
      { id: 'slot-5', date: '2026-09-10', time: '04:00 - 11:00', totalQty: 1, availableQty: 1, heldQty: 0, bookedQty: 0, version: 1 },
      { id: 'slot-6', date: '2026-09-10', time: '14:00 - 20:00', totalQty: 1, availableQty: 1, heldQty: 0, bookedQty: 0, version: 1 },
      { id: 'slot-7', date: '2026-09-11', time: '04:00 - 12:00', totalQty: 1, availableQty: 0, heldQty: 0, bookedQty: 1, version: 2 }
    ]
  },
  {
    id: 'res-103',
    title: '250x Gold Chiavari Banquet Chairs & Round Tables',
    category: 'furniture',
    provider: {
      name: 'Marigold Event Infrastructure',
      gstVerified: true,
      verifiedId: 'GSTIN27AAGCM8892P1ZF',
      rating: 4.96,
      reviewsCount: 71,
      responseTime: '< 10 mins',
      phone: '+91 99201 11890',
      address: 'Warehouse 12, Marol Industrial Area, Andheri East',
      avatar: 'ME'
    },
    location: {
      lat: 19.1197,
      lng: 72.8845,
      distanceKm: 4.8,
      zone: 'Andheri East'
    },
    images: [
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80'
    ],
    pricing: {
      amount: 110,
      unit: 'chair / day',
      currency: '₹',
      minRentalHours: 24
    },
    specs: {
      stockAvailable: '250 units in stock',
      material: 'Hardwood beech with ivory cushion pad',
      packaging: 'Stacked in transit padded covers (10 per stack)',
      conditions: 'Loss/damage charged at replacement cost ₹1,200/chair'
    },
    urgentFulfillment: true,
    needsPhysicalTransport: true, // Physical transport triggers AI Logistics Agent
    slots: [
      { id: 'slot-8', date: '2026-09-10', time: 'Full Day Rental', totalQty: 250, availableQty: 250, heldQty: 0, bookedQty: 0, version: 1 },
      { id: 'slot-9', date: '2026-09-11', time: 'Full Day Rental', totalQty: 250, availableQty: 150, heldQty: 0, bookedQty: 100, version: 2 },
      { id: 'slot-10', date: '2026-09-12', time: 'Full Day Rental', totalQty: 250, availableQty: 250, heldQty: 0, bookedQty: 0, version: 1 }
    ]
  },
  {
    id: 'res-104',
    title: '85 Secured Valet Parking Bays & Holding Lot',
    category: 'parking',
    provider: {
      name: 'Skyline Atrium Towers',
      gstVerified: true,
      verifiedId: 'GSTIN27AATCS9912E1ZQ',
      rating: 4.82,
      reviewsCount: 19,
      responseTime: '< 30 mins',
      phone: '+91 98205 33499',
      address: 'Senapati Bapat Marg, Dadar West',
      avatar: 'ST'
    },
    location: {
      lat: 19.0178,
      lng: 72.8478,
      distanceKm: 2.1,
      zone: 'Dadar West'
    },
    images: [
      'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80'
    ],
    pricing: {
      amount: 450,
      unit: 'bay / block (4 hrs)',
      currency: '₹',
      minRentalHours: 4
    },
    specs: {
      totalBays: '85 dedicated bays',
      security: '24/7 Boom barrier + CCTV monitoring + 4 guards on shift',
      surface: 'Underground Level 2, paved & floodlit, EV charging points available',
      rules: 'Driver access badges required at check-in'
    },
    urgentFulfillment: false,
    needsPhysicalTransport: false,
    slots: [
      { id: 'slot-11', date: '2026-09-10', time: '17:00 - 23:00', totalQty: 85, availableQty: 85, heldQty: 0, bookedQty: 0, version: 1 },
      { id: 'slot-12', date: '2026-09-11', time: '17:00 - 23:00', totalQty: 85, availableQty: 45, heldQty: 0, bookedQty: 40, version: 2 }
    ]
  },
  {
    id: 'res-105',
    title: '4K P2.6 LED Video Wall + Line Array Concert PA Sound',
    category: 'av',
    provider: {
      name: 'Apex Acoustic & Vision Labs',
      gstVerified: true,
      verifiedId: 'GSTIN27AAVCA4419L1ZP',
      rating: 4.98,
      reviewsCount: 64,
      responseTime: '< 15 mins',
      phone: '+91 98110 77221',
      address: 'Laxmi Industrial Estate, Andheri West',
      avatar: 'AA'
    },
    location: {
      lat: 19.1363,
      lng: 72.8277,
      distanceKm: 5.6,
      zone: 'Andheri West'
    },
    images: [
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80'
    ],
    pricing: {
      amount: 32000,
      unit: 'event shift (8 hrs)',
      currency: '₹',
      minRentalHours: 8
    },
    specs: {
      specsDetails: '16ft x 9ft P2.6 Ultra HD LED curveable wall with NovaStar controller',
      sound: 'JBL VRX Line Array (4 tops, 2 dual 18" subs, Soundcraft digital console)',
      crewIncluded: 'Includes 2 certified sound & video technicians for setup & operation',
      powerNeeded: 'Requires 32A 3-phase industrial drop'
    },
    urgentFulfillment: true,
    needsPhysicalTransport: true, // Physical transport triggers AI Logistics Agent
    slots: [
      { id: 'slot-13', date: '2026-09-10', time: '12:00 - 22:00', totalQty: 1, availableQty: 1, heldQty: 0, bookedQty: 0, version: 1 },
      { id: 'slot-14', date: '2026-09-11', time: '12:00 - 22:00', totalQty: 1, availableQty: 1, heldQty: 0, bookedQty: 0, version: 1 }
    ]
  },
  {
    id: 'res-106',
    title: 'Tata Ace Refrigerated Chiller Van (-18°C Deep Freeze)',
    category: 'vehicles',
    provider: {
      name: 'ColdChain Express Logistics',
      gstVerified: true,
      verifiedId: 'GSTIN27AATCC5501M1ZY',
      rating: 4.91,
      reviewsCount: 38,
      responseTime: '< 10 mins',
      phone: '+91 98212 99401',
      address: 'APMC Logistics Terminal, Navi Mumbai',
      avatar: 'CC'
    },
    location: {
      lat: 19.0760,
      lng: 73.0084,
      distanceKm: 8.2,
      zone: 'Vashi / APMC'
    },
    images: [
      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80'
    ],
    pricing: {
      amount: 1800,
      unit: 'hour (driver incl.)',
      currency: '₹',
      minRentalHours: 4
    },
    specs: {
      payload: '1,200 kg refrigerated payload',
      tempControl: '-18°C frozen to +4°C chilled with live IoT temperature datalogger',
      permit: 'All-Maharashtra commercial permit, clean sanitary food-grade stainless interior',
      driverIncluded: 'Commercial licensed driver included'
    },
    urgentFulfillment: true,
    needsPhysicalTransport: false, // Vehicle itself is transport
    slots: [
      { id: 'slot-15', date: '2026-09-10', time: '06:00 - 14:00', totalQty: 2, availableQty: 2, heldQty: 0, bookedQty: 0, version: 1 },
      { id: 'slot-16', date: '2026-09-10', time: '15:00 - 23:00', totalQty: 2, availableQty: 1, heldQty: 0, bookedQty: 1, version: 2 },
      { id: 'slot-17', date: '2026-09-11', time: '06:00 - 14:00', totalQty: 2, availableQty: 2, heldQty: 0, bookedQty: 0, version: 1 }
    ]
  },
  {
    id: 'res-107',
    title: 'Sky Deck Open-Air Rooftop & Poolside Lounge',
    category: 'banquet',
    provider: {
      name: 'Azure Palms Boutique Resort',
      gstVerified: true,
      verifiedId: 'GSTIN27AABCA7766K1ZU',
      rating: 4.89,
      reviewsCount: 27,
      responseTime: '< 25 mins',
      phone: '+91 98202 88440',
      address: 'Juhu Tara Road, Juhu Beach, Mumbai',
      avatar: 'AP'
    },
    location: {
      lat: 19.0988,
      lng: 72.8264,
      distanceKm: 3.9,
      zone: 'Juhu Coastal'
    },
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
    ],
    pricing: {
      amount: 18000,
      unit: 'hour',
      currency: '₹',
      minRentalHours: 4
    },
    specs: {
      capacity: '200 Guests',
      areaSqFt: '4,500 sq.ft wooden deck with infinity pool perimeter',
      barSetup: 'Fitted bar island with commercial glassware washer & undercounter chillers',
      view: 'Panoramic sunset Arabian Sea view'
    },
    urgentFulfillment: false,
    needsPhysicalTransport: false,
    slots: [
      { id: 'slot-18', date: '2026-09-10', time: '17:00 - 23:00', totalQty: 1, availableQty: 1, heldQty: 0, bookedQty: 0, version: 1 },
      { id: 'slot-19', date: '2026-09-11', time: '17:00 - 23:00', totalQty: 1, availableQty: 1, heldQty: 0, bookedQty: 0, version: 1 }
    ]
  },
  {
    id: 'res-108',
    title: '4x Mobile Induction Warmers & Commercial Bain-Maries',
    category: 'furniture',
    provider: {
      name: 'Continental Buffet Gear Hire',
      gstVerified: true,
      verifiedId: 'GSTIN27AACCC3321N1ZL',
      rating: 4.75,
      reviewsCount: 15,
      responseTime: '< 15 mins',
      phone: '+91 98330 22119',
      address: 'Kurla West Industrial Estate, Mumbai',
      avatar: 'CB'
    },
    location: {
      lat: 19.0728,
      lng: 72.8797,
      distanceKm: 1.5,
      zone: 'Kurla West'
    },
    images: [
      'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80'
    ],
    pricing: {
      amount: 1200,
      unit: 'unit / day',
      currency: '₹',
      minRentalHours: 24
    },
    specs: {
      capacity: '4 heavy duty stainless warmers with roll-top gold trim lids',
      powerSpecs: '2.4kW thermostat-controlled electric + chafing fuel dual mode',
      sanitization: 'Disinfected and steam polished before dispatch'
    },
    urgentFulfillment: true,
    needsPhysicalTransport: true,
    slots: [
      { id: 'slot-20', date: '2026-09-10', time: 'Full Day Rental', totalQty: 4, availableQty: 4, heldQty: 0, bookedQty: 0, version: 1 },
      { id: 'slot-21', date: '2026-09-11', time: 'Full Day Rental', totalQty: 4, availableQty: 4, heldQty: 0, bookedQty: 0, version: 1 }
    ]
  }
];

// Third-party Logistics Vendors recommended by the AI Delivery-Partner Finder
export const LOGISTICS_VENDORS = [
  {
    id: 'log-1',
    name: 'Porter Pro Cargo Logistics',
    badge: 'Fastest Dispatch',
    vehicleType: 'Tata Ace (1.5 Ton Container)',
    etaMins: 22,
    distanceKm: 2.4,
    baseFare: 850,
    estimatedTotal: 1250,
    rating: 4.87,
    completedTrips: '14,200+',
    features: ['Hydraulic Liftgate', 'In-app Driver Live GPS', 'Goods In-Transit Insurance up to ₹5L']
  },
  {
    id: 'log-2',
    name: 'Blowhorn B2B Intra-City Freight',
    badge: 'Best Volume Capacity',
    vehicleType: 'Bolero Maxi Truck (2 Ton Flatbed)',
    etaMins: 35,
    distanceKm: 4.1,
    baseFare: 1100,
    estimatedTotal: 1650,
    rating: 4.79,
    completedTrips: '9,800+',
    features: ['2 Loaders Included', 'Waterproof Tarpaulin', 'Direct Billing API']
  },
  {
    id: 'log-3',
    name: 'FlashFreight Express Courier',
    badge: 'Cost Effective',
    vehicleType: 'Electric 3-Wheeler Cargo (600 kg)',
    etaMins: 40,
    distanceKm: 3.2,
    baseFare: 550,
    estimatedTotal: 790,
    rating: 4.82,
    completedTrips: '6,400+',
    features: ['Zero Emission EV', 'Express City Center Access', 'Digital OTP Handover']
  }
];
