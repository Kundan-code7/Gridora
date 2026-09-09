// Atomic Slot-Locking & Marketplace Transaction Engine
// Implements Section 6 (Double-Booking Prevention, Concurrency Safety, 15-min TTL Hold, Optimistic Locking)

import { INITIAL_LISTINGS } from '../data/mockListings.js';

// Initial incoming requests for demonstration
const INITIAL_REQUESTS = [
  {
    id: 'req-901',
    holdId: 'hold-101',
    resourceId: 'res-103',
    resourceTitle: '250x Gold Chiavari Banquet Chairs & Round Tables',
    slotId: 'slot-9',
    slotDate: '2026-09-11',
    slotTime: 'Full Day Rental',
    seekerName: 'Opulent Weddings & Events',
    seekerContact: 'Rohan Mehta (+91 98201 99081)',
    requestedQty: 100,
    unitPrice: 110,
    totalAmount: 11000,
    isUrgent: true,
    status: 'HOLD_PENDING',
    expiresAt: Date.now() + 12 * 60 * 1000, // 12 mins remaining
    createdAt: Date.now() - 3 * 60 * 1000,
    notes: 'Urgent requirement for evening reception at Taj Lands End. Need delivery before 2 PM.',
    negotiationThread: [
      { sender: 'seeker', text: 'Hi, we urgently require 100 Chiavari chairs for a sangeet banquet. Can you confirm dispatch capability?', timestamp: Date.now() - 3 * 60 * 1000 }
    ]
  },
  {
    id: 'req-902',
    holdId: 'hold-102',
    resourceId: 'res-102',
    resourceTitle: 'Commercial Commissary Kitchen & Bakery Unit',
    slotId: 'slot-6',
    slotDate: '2026-09-10',
    slotTime: '14:00 - 20:00',
    seekerName: 'Saffron Cloud Catering',
    seekerContact: 'Priya Sharma (+91 98112 33409)',
    requestedQty: 1,
    unitPrice: 4200,
    totalAmount: 25200,
    isUrgent: false,
    status: 'HOLD_PENDING',
    expiresAt: Date.now() + 8 * 60 * 1000, // 8 mins remaining
    createdAt: Date.now() - 7 * 60 * 1000,
    notes: 'Need preparatory baking shifts for 500 pastry boxes for corporate summit.',
    negotiationThread: [
      { sender: 'seeker', text: 'Booking request sent for 6 hours baking shift.', timestamp: Date.now() - 7 * 60 * 1000 }
    ]
  }
];

class BookingEngine {
  constructor() {
    this.listings = JSON.parse(JSON.stringify(INITIAL_LISTINGS));
    this.requests = JSON.parse(JSON.stringify(INITIAL_REQUESTS));
    this.subscribers = new Set();
    this.activeHoldInterval = null;
    this.startHoldCountdownTicker();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify() {
    for (const callback of this.subscribers) {
      callback({
        listings: this.listings,
        requests: this.requests
      });
    }
  }

  getListings() {
    return this.listings;
  }

  getRequests() {
    return this.requests;
  }

  getListingById(id) {
    return this.listings.find(l => l.id === id);
  }

  // Ticker to decrement TTL countdown and auto-release holds when expired
  startHoldCountdownTicker() {
    if (this.activeHoldInterval) clearInterval(this.activeHoldInterval);
    this.activeHoldInterval = setInterval(() => {
      const now = Date.now();
      let stateChanged = false;

      this.requests.forEach(req => {
        if (req.status === 'HOLD_PENDING' && req.expiresAt <= now) {
          // TTL expired! Release slot back to stock
          this.releaseSlotStock(req.resourceId, req.slotId, req.requestedQty);
          req.status = 'EXPIRED';
          req.notes = 'Hold timed out after 15 minutes TTL. Quantity released back to availability.';
          stateChanged = true;
        }
      });

      if (stateChanged) {
        this.notify();
      }
    }, 5000);
  }

  // Atomic Slot Locking (Section 6.1 & 6.2)
  // Soft-locks requested quantity immediately for 15 minutes TTL
  createBookingHold({
    resourceId,
    slotId,
    requestedQty,
    seekerName,
    seekerContact,
    unitPrice,
    notes = '',
    isUrgent = false,
    expectedVersion
  }) {
    const listing = this.listings.find(l => l.id === resourceId);
    if (!listing) {
      return { success: false, error: 'Listing not found in registry' };
    }

    const slot = listing.slots.find(s => s.id === slotId);
    if (!slot) {
      return { success: false, error: 'Specified availability slot does not exist' };
    }

    // Optimistic Concurrency Check (Section 6.2)
    if (expectedVersion !== undefined && slot.version !== expectedVersion) {
      return {
        success: false,
        error: `CONCURRENCY_CONFLICT: Slot version mismatch (client was v${expectedVersion}, database is v${slot.version}). The slot was updated by another booking. Please refresh.`,
        code: 'VERSION_MISMATCH'
      };
    }

    // Atomic Stock Check: Cannot oversell
    if (requestedQty > slot.availableQty) {
      return {
        success: false,
        error: `INSUFFICIENT_STOCK: Requested ${requestedQty} units, but only ${slot.availableQty} remain available for this slot.`,
        code: 'OUT_OF_STOCK'
      };
    }

    // Atomic Decrement at Hold Creation
    slot.availableQty -= requestedQty;
    slot.heldQty += requestedQty;
    slot.version += 1;

    const holdId = 'hold-' + Math.random().toString(36).substring(2, 9);
    const newRequest = {
      id: 'req-' + Math.random().toString(36).substring(2, 9),
      holdId,
      resourceId,
      resourceTitle: listing.title,
      slotId,
      slotDate: slot.date,
      slotTime: slot.time,
      seekerName: seekerName || 'Grand Horizon Hospitality Ltd.',
      seekerContact: seekerContact || 'Operations Desk (+91 98200 11990)',
      requestedQty,
      unitPrice,
      totalAmount: unitPrice * requestedQty,
      isUrgent,
      status: 'HOLD_PENDING',
      expiresAt: Date.now() + 15 * 60 * 1000, // 15-minute soft lock TTL
      createdAt: Date.now(),
      notes,
      negotiationThread: [
        {
          sender: 'seeker',
          text: `Booking Hold initiated for ${requestedQty} units on ${slot.date} (${slot.time}). 15-minute reservation timer active.`,
          timestamp: Date.now()
        }
      ]
    };

    this.requests.unshift(newRequest);
    this.notify();

    return {
      success: true,
      request: newRequest,
      slot
    };
  }

  // Accept Hold -> Converts Hold to Confirmed Booking (Section 6.1)
  acceptHold(requestId) {
    const req = this.requests.find(r => r.id === requestId);
    if (!req) return { success: false, error: 'Request not found' };

    const listing = this.listings.find(l => l.id === req.resourceId);
    if (!listing) return { success: false, error: 'Resource not found' };

    const slot = listing.slots.find(s => s.id === req.slotId);
    if (!slot) return { success: false, error: 'Slot not found' };

    // Move held quantity to booked quantity atomically
    slot.heldQty -= req.requestedQty;
    slot.bookedQty += req.requestedQty;
    slot.version += 1;

    req.status = 'CONFIRMED';
    req.negotiationThread.push({
      sender: 'provider',
      text: 'Booking ACCEPTED by provider. Slot is locked on both master calendars.',
      timestamp: Date.now()
    });

    this.notify();
    return { success: true, request: req };
  }

  // Reject Hold -> Releases Held Quantity back to available pool immediately (Section 6.1)
  rejectHold(requestId, reason = 'Provider unavailable for requested slot') {
    const req = this.requests.find(r => r.id === requestId);
    if (!req) return { success: false, error: 'Request not found' };

    this.releaseSlotStock(req.resourceId, req.slotId, req.requestedQty);

    req.status = 'REJECTED';
    req.rejectReason = reason;
    req.negotiationThread.push({
      sender: 'provider',
      text: `Booking declined: ${reason}. Held capacity released back to available pool.`,
      timestamp: Date.now()
    });

    this.notify();
    return { success: true, request: req };
  }

  // Counter-Offer Flow (Section 4 & Section 5)
  counterOffer(requestId, { newPrice, newQty, counterNote }) {
    const req = this.requests.find(r => r.id === requestId);
    if (!req) return { success: false, error: 'Request not found' };

    req.status = 'COUNTER_OFFERED';
    if (newPrice) req.unitPrice = Number(newPrice);
    if (newQty) req.requestedQty = Number(newQty);
    req.totalAmount = req.unitPrice * req.requestedQty;

    req.negotiationThread.push({
      sender: 'provider',
      text: `Counter-offer proposed: ₹${req.unitPrice}/unit for ${req.requestedQty} units. Note: ${counterNote}`,
      timestamp: Date.now(),
      isCounter: true
    });

    this.notify();
    return { success: true, request: req };
  }

  // Helper to safely return held inventory back to availability
  releaseSlotStock(resourceId, slotId, qty) {
    const listing = this.listings.find(l => l.id === resourceId);
    if (!listing) return;
    const slot = listing.slots.find(s => s.id === slotId);
    if (!slot) return;

    slot.heldQty = Math.max(0, slot.heldQty - qty);
    slot.availableQty += qty;
    slot.version += 1;
  }

  // Add a newly created listing from the Provider flow
  addListing(newListingData) {
    const id = 'res-' + Math.random().toString(36).substring(2, 9);
    const listing = {
      id,
      ...newListingData,
      rating: 5.0,
      reviewsCount: 1,
      location: {
        ...newListingData.location,
        distanceKm: (Math.random() * 4 + 0.8).toFixed(1)
      }
    };
    this.listings.unshift(listing);
    this.notify();
    return listing;
  }

  // Concurrency Test Simulator (Section 6.2)
  // Demonstrates what happens when two seekers compete for the last units at the exact same millisecond
  simulateConcurrentRace(resourceId, slotId) {
    const listing = this.listings.find(l => l.id === resourceId);
    const slot = listing ? listing.slots.find(s => s.id === slotId) : null;

    if (!slot) {
      return { success: false, log: 'Slot not found for simulation.' };
    }

    const initialVersion = slot.version;
    const initialAvailable = slot.availableQty;

    // Simulation: Seeker 1 attempts to book all remaining units
    const seeker1Qty = Math.max(1, Math.min(10, initialAvailable));
    const res1 = this.createBookingHold({
      resourceId,
      slotId,
      requestedQty: seeker1Qty,
      seekerName: 'Simulated Seeker A (Hotel Taj West)',
      seekerContact: '+91 99999 11111',
      unitPrice: listing.pricing.amount,
      isUrgent: true,
      notes: 'Concurrency Stress Test Request #1',
      expectedVersion: initialVersion
    });

    // Simulation: Seeker 2 simultaneously attempts to book with stale version
    const res2 = this.createBookingHold({
      resourceId,
      slotId,
      requestedQty: seeker1Qty,
      seekerName: 'Simulated Seeker B (The Oberoi Club)',
      seekerContact: '+91 88888 22222',
      unitPrice: listing.pricing.amount,
      isUrgent: true,
      notes: 'Concurrency Stress Test Request #2',
      expectedVersion: initialVersion // Stale version! Already incremented by Seeker 1
    });

    return {
      success: true,
      slotId,
      initialAvailable,
      initialVersion,
      seeker1Result: res1,
      seeker2Result: res2,
      finalSlotState: { ...slot }
    };
  }
}

export const bookingEngineInstance = new BookingEngine();
