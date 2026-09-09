// Gemini AI Service with Multi-Model Fallback and Real-Time Diagnostics
// Automatically tries gemini-3.5-flash, gemini-flash-latest, and gemini-pro-latest

export class GeminiService {
  static getApiKey() {
    return localStorage.getItem('hre_gemini_api_key') || import.meta.env?.VITE_GEMINI_API_KEY || '';
  }

  static setApiKey(newKey) {
    if (newKey) {
      localStorage.setItem('hre_gemini_api_key', newKey.trim());
    } else {
      localStorage.removeItem('hre_gemini_api_key');
    }
  }

  /**
   * Resilient execute with automatic model fallback
   */
  static async callGemini(prompt, isJson = false) {
    const apiKey = this.getApiKey();
    const candidateModels = ['gemini-3.5-flash', 'gemini-flash-latest', 'gemini-pro-latest'];
    let lastError = null;

    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const bodyPayload = {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3
          }
        };

        if (isJson) {
          bodyPayload.generationConfig.responseMimeType = 'application/json';
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload)
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error?.message || `HTTP ${response.status}`);
        }

        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return {
            success: true,
            modelUsed: model,
            text
          };
        }
      } catch (err) {
        lastError = err;
        console.warn(`Gemini model ${model} failed, trying fallback:`, err.message);
      }
    }

    return {
      success: false,
      error: lastError?.message || 'All Gemini models failed'
    };
  }

  /**
   * Health Check Diagnostics
   */
  static async testConnection() {
    const startTime = Date.now();
    const result = await this.callGemini('Respond with short JSON: {"status": "ONLINE", "message": "Gemini AI Connected"}', true);
    const latency = Date.now() - startTime;

    if (result.success) {
      try {
        const parsed = JSON.parse(result.text);
        return {
          ok: true,
          model: result.modelUsed,
          latencyMs: latency,
          message: parsed.message || 'Connected successfully'
        };
      } catch (e) {
        return {
          ok: true,
          model: result.modelUsed,
          latencyMs: latency,
          message: result.text
        };
      }
    }

    return {
      ok: false,
      error: result.error,
      latencyMs: latency
    };
  }

  /**
   * AI Delivery-Partner Finder (Section 9)
   */
  static async getLogisticsRecommendation({ resourceTitle, quantity, distanceKm, isUrgent, pickupAddress, dropoffAddress }) {
    const prompt = `You are the AI Delivery-Partner Recommendation Agent for the B2B marketplace "Hospitality Resource Exchange".
A hospitality seeker placed a booking hold for:
- Resource: ${resourceTitle}
- Quantity: ${quantity} units
- Transit Distance: ${distanceKm} km
- Pickup: ${pickupAddress || 'Mumbai Central Hospitality Belt'}
- Dropoff: ${dropoffAddress || 'Venue On-Site'}
- Urgency: ${isUrgent ? 'URGENT SLA (< 60 mins fulfillment)' : 'Standard Delivery'}

Analyze the cargo physical dimensions, volume, fragility, and road transit requirements.
Recommend exactly 3 ranked third-party freight/courier partners (e.g., Porter Pro, Blowhorn, FlashFreight).
Return ONLY a valid JSON object matching this schema:
{
  "cargoAnalysis": "Short summary of cargo volume, handling and vehicle requirements",
  "vendors": [
    {
      "id": "log-1",
      "name": "string (e.g. Porter Pro Cargo)",
      "badge": "string (e.g. Fastest Dispatch)",
      "vehicleType": "string (e.g. Tata Ace 1.5 Ton Closed Container)",
      "etaMins": number,
      "distanceKm": number,
      "estimatedTotal": number,
      "rating": number,
      "features": ["feature 1", "feature 2", "feature 3"],
      "aiReasoning": "Why this vehicle and carrier fits this specific hospitality equipment"
    }
  ],
  "officialManifest": "Formal plain text dispatch manifest with pickup coordinates, handling instructions, gate pass code, and platform non-liability clause"
}`;

    const res = await this.callGemini(prompt, true);
    if (res.success) {
      try {
        return JSON.parse(res.text);
      } catch (e) {
        console.warn('JSON parse error in logistics output, falling back:', e);
      }
    }

    // Heuristic Fallback
    return {
      cargoAnalysis: `Standard bulk transit required for ${quantity} units of ${resourceTitle}. Heavy cargo handling with protective padding recommended.`,
      vendors: [
        {
          id: 'log-1',
          name: 'Porter Pro Cargo Logistics',
          badge: 'Fastest Dispatch',
          vehicleType: 'Tata Ace (1.5 Ton Container)',
          etaMins: 22,
          distanceKm: Number(distanceKm) || 2.4,
          estimatedTotal: 1250,
          rating: 4.88,
          features: ['Hydraulic Liftgate', 'In-App Live GPS', 'Transit Insurance up to ₹5L'],
          aiReasoning: 'Ideal container height for stacked banquet chairs and fragile catering equipment.'
        },
        {
          id: 'log-2',
          name: 'Blowhorn B2B Intra-City Freight',
          badge: 'Best Volume Capacity',
          vehicleType: 'Bolero Maxi Truck (2 Ton Flatbed)',
          etaMins: 35,
          distanceKm: Number(distanceKm) || 4.1,
          estimatedTotal: 1650,
          rating: 4.79,
          features: ['2 Trained Loaders', 'Waterproof Tarpaulin Cover', 'Direct Commercial Billing'],
          aiReasoning: 'Heavy payload capacity suitable for commercial ovens and large batch staging.'
        },
        {
          id: 'log-3',
          name: 'FlashFreight Express Courier',
          badge: 'Eco Friendly & Cost-Effective',
          vehicleType: 'Electric 3-Wheeler Cargo (600 kg)',
          etaMins: 40,
          distanceKm: Number(distanceKm) || 3.2,
          estimatedTotal: 790,
          rating: 4.82,
          features: ['Zero Emission EV', 'Express City Center Access', 'Digital OTP Gate Handover'],
          aiReasoning: 'Quick intra-city hop for compact gear and small batch deliveries.'
        }
      ],
      officialManifest: `=== HOSPITALITY RESOURCE EXCHANGE - DISPATCH MANIFEST ===\nResource: ${resourceTitle} (${quantity} units)\nGate Pass: AUTOPASS-HRE-${Math.floor(100000 + Math.random() * 900000)}\nHandling: Padded transit only. The platform bears zero transit liability.\n======================================================`
    };
  }

  /**
   * Natural Language Requirement Matcher (Section 4 & Section 8)
   */
  static async parseSeekerRequirement(queryText, availableListings) {
    const prompt = `You are the AI Hospitality Resource Matcher.
A hospitality business posted this requirement:
"${queryText}"

Available marketplace listings:
${JSON.stringify(availableListings.map(l => ({
  id: l.id,
  title: l.title,
  category: l.category,
  price: l.pricing.amount,
  unit: l.pricing.unit,
  distanceKm: l.location.distanceKm,
  zone: l.location.zone,
  capacity: l.specs.capacity,
  urgentFulfillment: l.urgentFulfillment
})))}

Analyze the requirement and return ONLY a valid JSON object:
{
  "detectedCategory": "all | banquet | kitchen | parking | furniture | av | vehicles",
  "maxPrice": number or null,
  "requiresUrgent": boolean,
  "summary": "Short 1-sentence interpretation of what seeker needs",
  "recommendedListingIds": ["list of matching listing ids ranked by fit"],
  "aiAdvice": "Brief advice for the seeker on booking this hospitality resource"
}`;

    const res = await this.callGemini(prompt, true);
    if (res.success) {
      try {
        return JSON.parse(res.text);
      } catch (e) {
        console.warn('JSON parse error in requirement output:', e);
      }
    }

    return {
      detectedCategory: 'all',
      maxPrice: null,
      requiresUrgent: queryText.toLowerCase().includes('urgent'),
      summary: `Searching available resources matching "${queryText}"`,
      recommendedListingIds: availableListings.slice(0, 3).map(l => l.id),
      aiAdvice: 'Check live calendar slots and place an atomic 15-minute hold to lock capacity immediately.'
    };
  }

  /**
   * AI Negotiation Assistant for Providers
   */
  static async draftCounterOffer({ seekerName, resourceTitle, requestedQty, requestedPrice, counterPrice, reason }) {
    const prompt = `You are an AI B2B Negotiation Assistant for a hospitality business.
An incoming request was received from "${seekerName}" for "${resourceTitle}" (${requestedQty} units at ₹${requestedPrice}/unit).
We are countering at ₹${counterPrice}/unit. Reason/Context: "${reason}".

Draft a concise, professional, polite B2B negotiation message (max 2 sentences) proposing this counter-offer, emphasizing value and seamless handover.
Return ONLY plain text.`;

    const res = await this.callGemini(prompt, false);
    if (res.success && res.text) {
      return res.text.trim();
    }

    return `We are pleased to accommodate your requirement for ${requestedQty} units of ${resourceTitle}. Due to peak shift preparation and dedicated logistics support, our adjusted rate is ₹${counterPrice}/unit.`;
  }
}
