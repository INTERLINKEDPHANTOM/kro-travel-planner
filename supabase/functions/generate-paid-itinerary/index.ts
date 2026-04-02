import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function aiCall(apiKey: string, systemPrompt: string, userPrompt: string) {
  const response = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("AI gateway error:", response.status, errText);
    if (response.status === 429) throw new Error("RATE_LIMITED");
    if (response.status === 402) throw new Error("PAYMENT_REQUIRED");
    throw new Error(`AI gateway error: ${response.status}`);
  }

  const data = await response.json();
  let content = data.choices?.[0]?.message?.content || "";
  content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(content);
}

function validatePreferences(prefs: any) {
  const errors: string[] = [];
  if (!prefs.departure) errors.push("Departure city is required");
  if (!prefs.arrival) errors.push("Destination is required");
  if (!prefs.departureDate) errors.push("Departure date is required");
  if (!prefs.arrivalDate) errors.push("Return date is required");

  const depDate = new Date(prefs.departureDate);
  const arrDate = new Date(prefs.arrivalDate);
  if (arrDate <= depDate) errors.push("Return date must be after departure date");

  return errors;
}

function analyzeContext(prefs: any) {
  const depDate = new Date(prefs.departureDate);
  const arrDate = new Date(prefs.arrivalDate);
  const totalMs = arrDate.getTime() - depDate.getTime();
  const totalNights = Math.max(1, Math.ceil(totalMs / (1000 * 60 * 60 * 24)));
  const totalDays = totalNights + 1;
  const numPeople = parseInt(prefs.numPeople) || 2;
  const budgetMax = parseInt(prefs.budgetMax) || 20000;
  const budgetMin = parseInt(prefs.budgetMin) || 5000;
  const effectiveBudget = budgetMax;

  const transportPercent = 0.30;
  const stayPercent = 0.30;
  const foodPercent = 0.20;
  const localTravelPercent = 0.10;
  const bufferPercent = 0.10;

  const profile = numPeople === 2 ? "couple" : numPeople <= 4 ? "family" : "group";

  return {
    totalNights,
    totalDays,
    effectiveTravelDays: Math.max(1, totalDays - 1),
    sightseeingDays: Math.max(1, totalDays - 2),
    numPeople,
    effectiveBudget,
    budgetMin,
    budgetAllocation: {
      transport: Math.round(effectiveBudget * transportPercent),
      stay: Math.round(effectiveBudget * stayPercent),
      food: Math.round(effectiveBudget * foodPercent),
      localTravel: Math.round(effectiveBudget * localTravelPercent),
      buffer: Math.round(effectiveBudget * bufferPercent),
    },
    profile,
    departureDate: depDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" }),
    arrivalDate: arrDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" }),
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: any) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const { preferences } = await req.json();
        if (!preferences) throw new Error("No preferences provided");

        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

        // ── STEP 1: Validate ──
        send("progress", { step: 1, label: "Validating preferences..." });
        const validationErrors = validatePreferences(preferences);
        if (validationErrors.length > 0) {
          send("error", { message: validationErrors.join(", ") });
          controller.close();
          return;
        }

        // ── STEP 2: Context Analysis ──
        send("progress", { step: 2, label: "Analyzing travel context..." });
        const context = analyzeContext(preferences);

        const userTransportPref = preferences.transport || "mixed";
        const userPersona = preferences.persona || "explorer";

        // ── STEP 3: Smart Transport Selection (AI Call #1) ──
        send("progress", { step: 3, label: "Analyzing transport options smartly..." });
        const transportData = await aiCall(
          LOVABLE_API_KEY,
          `You are an India transport intelligence engine. Return ONLY valid JSON.

CRITICAL RULES FOR TRANSPORT SELECTION:
1. FIRST analyze: dates, travel time, number of people, budget per person, distance between cities
2. If user has a transport PREFERENCE ("${userTransportPref}"), CHECK THAT MODE FIRST:
   - Estimate realistic seat availability for that date
   - Estimate realistic pricing for ${context.numPeople} people
   - If it fits within budget (₹${context.budgetAllocation.transport} total round trip) AND is feasible → USE IT
   - If NOT available or too expensive → EXPLAIN why and suggest best alternative
3. If user preference is "mixed" or no preference:
   - Compare ALL modes (train, bus, flight) on: price, travel time, comfort
   - Pick the best value-for-money option that fits the budget
4. ALWAYS provide a fallback option if primary choice might not work
5. Use realistic 2024-2025 Indian pricing and availability patterns
6. Consider: Tatkal availability, Sleeper vs AC, Volvo vs ordinary bus, budget vs full-service airlines

PERSONA: ${userPersona} (adjust comfort expectations accordingly)`,
          `Find the BEST transport from ${preferences.departure} to ${preferences.arrival}.
Dates: ${context.departureDate} to ${context.arrivalDate}
People: ${context.numPeople} (${context.profile})
Total transport budget: ₹${context.budgetAllocation.transport} for round trip
User preference: ${userTransportPref}
Travel persona: ${userPersona}

STEP 1: Check if "${userTransportPref}" mode is feasible for this route
STEP 2: Estimate availability and pricing
STEP 3: If feasible, plan with that mode. If not, find best alternative within budget.
STEP 4: Always include a backup option.

Return JSON:
{
  "analysis": {
    "distance_km": "string",
    "preferred_mode_feasible": true/false,
    "preferred_mode_reason": "string - why feasible or not",
    "selected_reason": "string - why this mode was finally chosen"
  },
  "recommended_mode": "train/bus/flight",
  "options": [
    {
      "mode": "string",
      "route": "string - e.g. Delhi → Manali via Chandigarh",
      "duration": "string - e.g. 12-14 hours",
      "cost_per_person": "string - ₹ amount",
      "total_cost": "string - ₹ amount for all people round trip",
      "comfort": "string - basic/moderate/premium",
      "feasibility": "string - recommended/possible/expensive/unavailable",
      "availability_note": "string - likely available / waitlist / sold out etc",
      "tips": "string - 1 line practical tip"
    }
  ],
  "selected_outbound": {
    "mode": "string",
    "details": "string - specific route/train name/bus operator/airline",
    "departure_time": "string",
    "arrival_time": "string",
    "cost": "string",
    "booking_tip": "string"
  },
  "selected_return": {
    "mode": "string",
    "details": "string",
    "departure_time": "string",
    "arrival_time": "string",
    "cost": "string",
    "booking_tip": "string"
  },
  "fallback": {
    "mode": "string",
    "reason": "string - when to use this instead",
    "cost": "string"
  },
  "total_transport_cost": "string - ₹ amount"
}`
        );

        // ── STEP 4: Budget Recalculation ──
        send("progress", { step: 4, label: "Recalculating budget after transport..." });
        const transportCostNum = parseInt(String(transportData.total_transport_cost).replace(/[^\d]/g, "")) || context.budgetAllocation.transport;
        const remainingBudget = context.effectiveBudget - transportCostNum;
        const stayBudget = Math.round(remainingBudget * 0.35);
        const foodBudget = Math.round(remainingBudget * 0.25);
        const activityBudget = Math.round(remainingBudget * 0.20);
        const localTravelBudget = Math.round(remainingBudget * 0.10);
        const emergencyBuffer = Math.round(remainingBudget * 0.10);

        // ── STEP 5: Hotel Discovery (AI Call #2) ──
        send("progress", { step: 5, label: "Searching for best hotels..." });
        const hotelData = await aiCall(
          LOVABLE_API_KEY,
          `You are an India hotel expert. Return ONLY valid JSON. Suggest realistic hotels in Indian cities with accurate 2024-2025 pricing. Hotels must be real-sounding with realistic names, locations, and prices.`,
          `Find 3 hotel options in ${preferences.arrival} for ${context.totalNights} nights.
Budget for stay: ₹${stayBudget} total (₹${Math.round(stayBudget / context.totalNights)} per night)
People: ${context.numPeople}
Food preference: ${preferences.food || "mixed"}
Travel type: ${preferences.travelType || "leisure"}
Persona: ${userPersona}

Return JSON:
{
  "hotels": [
    {
      "name": "string - realistic hotel name",
      "tier": "Low",
      "description": "string - 1 line",
      "price_per_night": "string - ₹ amount",
      "total_cost": "string - ₹ amount for all nights",
      "breakfast_included": false,
      "distance_station": "string",
      "distance_hub": "string",
      "maps_url": "string - Google Maps search URL like https://www.google.com/maps/search/HotelName+City",
      "why_choose": "string - 1 line reason",
      "area": "string - locality name"
    },
    {
      "name": "string",
      "tier": "Mid",
      "description": "string",
      "price_per_night": "string",
      "total_cost": "string",
      "breakfast_included": true,
      "distance_station": "string",
      "distance_hub": "string",
      "maps_url": "string - Google Maps search URL",
      "why_choose": "string",
      "area": "string"
    },
    {
      "name": "string",
      "tier": "Premium",
      "description": "string",
      "price_per_night": "string",
      "total_cost": "string",
      "breakfast_included": true,
      "distance_station": "string",
      "distance_hub": "string",
      "maps_url": "string - Google Maps search URL",
      "why_choose": "string",
      "area": "string"
    }
  ],
  "hotel_cluster_area": "string - the area/locality where all 3 are located",
  "recommended_tier": "string - which tier fits budget best"
}`
        );

        // ── STEP 6: Full Itinerary Generation (AI Call #3) ──
        send("progress", { step: 6, label: "Building your day-by-day itinerary..." });

        // Per-person per-day budgets for the AI to enforce strictly
        const foodPerPersonPerDay = Math.round(foodBudget / context.totalDays / context.numPeople);
        const actPerPersonPerDay = Math.round(activityBudget / context.totalDays / context.numPeople);
        const localPerPersonPerDay = Math.round(localTravelBudget / context.totalDays / context.numPeople);

        const itineraryData = await aiCall(
          LOVABLE_API_KEY,
          `You are KroTravel Planner GPT Pro — an India-aware, minute-accurate travel intelligence engine.
Generate a customer-ready, day-wise, hour-wise itinerary.

⚠️ CRITICAL BUDGET RULES — MUST FOLLOW STRICTLY:
- TOTAL REMAINING BUDGET is ₹${remainingBudget} for ${context.numPeople} people across ${context.totalDays} days
- Food budget per person per day: ₹${foodPerPersonPerDay} (NEVER exceed this)
- Activity/entry budget per person per day: ₹${actPerPersonPerDay} (NEVER exceed this)
- Local travel per person per day: ₹${localPerPersonPerDay} (NEVER exceed this)
- ALL individual activity costs must be realistic and WITHIN these limits
- NEVER invent high-cost activities that bust the budget
- If budget is very low (< ₹300/person/day), suggest free/low-cost alternatives like parks, ghats, free monuments, walking tours

REALISTIC INDIA COST BENCHMARKS (2024-2025):
- Auto/rickshaw: ₹20-80 per ride
- Metro: ₹10-60 per person
- Cab (Ola/Uber 5km): ₹80-150
- Street food/chai: ₹20-80
- Budget restaurant meal: ₹80-200 per person  
- Mid restaurant meal: ₹200-450 per person
- Monument entry (Indian): ₹15-250 per person
- Park entry: ₹10-50 per person
- Museum entry: ₹20-150 per person
- Boat ride (ghats etc): ₹50-200 per person

ITINERARY RULES:
- Use realistic India-specific timings
- Rail arrival buffer: +1 hour delay assumption
- Distance logic: <1 km → Walk (Free), 1–3 km → Auto (₹30-80), >3 km → Metro/Cab (₹60-150)
- Include rest breaks and realistic pacing
- Account for Indian traffic conditions
- First day = travel + arrival + 1-2 nearby activities only
- Last day = checkout + departure activities only (light schedule)
- Middle days = full sightseeing with proper pacing
- ONLY include destinations that actually exist in ${preferences.arrival}. Do NOT invent places.
- For EVERY physical location include a maps_url as Google Maps search link

Return ONLY valid JSON.`,
          `Generate itinerary for:
FROM: ${preferences.departure} TO: ${preferences.arrival}
DATES: ${context.departureDate} to ${context.arrivalDate} (${context.totalDays} days, ${context.totalNights} nights)
PEOPLE: ${context.numPeople} (${context.profile})
TRAVEL TYPE: ${preferences.travelType || "leisure"}
FOOD: ${preferences.food || "mixed"}
PERSONA: ${userPersona}
SPECIAL NOTES: ${preferences.notes || "None"}

TRANSPORT DETAILS (already finalized):
${JSON.stringify(transportData.selected_outbound || {}, null, 2)}
Return: ${JSON.stringify(transportData.selected_return || {}, null, 2)}

HOTEL AREA: ${hotelData.hotel_cluster_area || preferences.arrival}
RECOMMENDED HOTEL: ${hotelData.recommended_tier || "Mid"} tier

⚠️ STRICT BUDGET CONSTRAINTS (DO NOT EXCEED):
- Total remaining budget: ₹${remainingBudget} for ${context.numPeople} people
- Food total: ₹${foodBudget} (₹${foodPerPersonPerDay}/person/day)
- Activities total: ₹${activityBudget} (₹${actPerPersonPerDay}/person/day)  
- Local travel total: ₹${localTravelBudget} (₹${localPerPersonPerDay}/person/day)

Return JSON:
{
  "cover_title": "string - emoji + bold title (must mention ${preferences.arrival} specifically)",
  "intro": "string - 1-2 line destination intro",
  "user_preferences_summary": {
    "travel_dates": "${context.departureDate} – ${context.arrivalDate}",
    "people": "${context.numPeople} (${context.profile})",
    "budget": "₹${context.effectiveBudget}",
    "food": "${preferences.food || "mixed"}",
    "transport": "${transportData.recommended_mode || preferences.transport || "mixed"}"
  },
  "days": [
    {
      "day_label": "string - e.g. Day 1 — Travel & Arrival",
      "emoji": "string",
      "activities": [
        {
          "time": "string - e.g. 06:00 AM",
          "activity": "string - only real places that exist in ${preferences.arrival}",
          "note": "string - 1 line note",
          "duration": "string",
          "cost": "string - ₹ amount or Free (must stay within ₹${actPerPersonPerDay}/person budget)",
          "maps_url": "string - Google Maps search URL like https://www.google.com/maps/search/PlaceName+${encodeURIComponent(preferences.arrival)}"
        }
      ]
    }
  ],
  "route_overview": "string - Station → Hotel → Key places → Return"
}`
        );

        // ── STEP 7: Add-ons (AI Call #4) ──
        send("progress", { step: 7, label: "Adding restaurants, tips & checklist..." });
        const addonsData = await aiCall(
          LOVABLE_API_KEY,
          `You are an India travel add-ons expert. Return ONLY valid JSON. Provide practical, realistic suggestions for Indian destinations. Use current 2024-2025 information.`,
          `For a trip to ${preferences.arrival} (${context.totalDays} days, ${preferences.food || "mixed"} food preference, ${preferences.travelType || "leisure"} trip):

Hotel area: ${hotelData.hotel_cluster_area || preferences.arrival}

Return JSON:
{
  "restaurants": [
    {
      "name": "string - real restaurant name",
      "type": "string - Street / Budget / Mid / Fine",
      "meal": "string - Breakfast / Lunch / Dinner",
      "reason": "string - 1 line why",
      "near_landmark": "string",
      "avg_cost": "string - ₹ per person",
      "maps_url": "string - Google Maps search URL like https://www.google.com/maps/search/RestaurantName+City"
    }
  ],
  "travel_tips": ["array of 6-8 practical tips specific to ${preferences.arrival}"],
  "packing_checklist": ["array of 8-12 items based on ${preferences.travelType || "leisure"} trip"],
  "local_insights": ["array of 3-4 local behaviour/safety notes"]
}`
        );

        // ── STEP 7.5: Events Discovery (AI Call #5) ──
        send("progress", { step: 7.5, label: "Discovering local events & festivals..." });
        
        const startDate = new Date(preferences.departureDate || Date.now());
        const endDate = new Date(preferences.arrivalDate || startDate.getTime() + context.totalDays * 86400000);
        const searchStart = new Date(startDate.getTime() - 2 * 86400000);
        const searchEnd = new Date(endDate.getTime() + 2 * 86400000);
        const formatEvtDate = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
        
        let eventsData = [];
        try {
          const eventsResult = await aiCall(
            LOVABLE_API_KEY,
            `You are an event discovery engine for Indian cities. Return ONLY a valid JSON array, no markdown, no explanation.`,
            `Find real, plausible events happening in or near "${preferences.arrival}" between ${formatEvtDate(searchStart)} and ${formatEvtDate(searchEnd)}.

Include a mix of: concerts, festivals, cultural events, food fairs, exhibitions, sports, nightlife, workshops, markets, religious events, local celebrations.

The traveler's style is "${preferences.travelPersona || "explorer"}". Mark 2-3 events as "isBestForYou" that match this style.

Return a JSON array of 8-10 events:
[{
  "name": "Event Name",
  "date": "12 Apr 2026",
  "time": "6:00 PM",
  "venue": "Venue Name, ${preferences.arrival}",
  "category": "Festival|Concert|Exhibition|Sports|Cultural|Food|Nightlife|Workshop|Market|Religious",
  "description": "One line description",
  "isBestForYou": true/false,
  "bookingQuery": "search query for Google"
}]`
          );
          if (Array.isArray(eventsResult)) {
            eventsData = eventsResult;
          } else if (eventsResult?.events) {
            eventsData = eventsResult.events;
          }
        } catch (evtErr) {
          console.error("Events discovery failed (non-fatal):", evtErr);
        }

        // ── STEP 8: Final Assembly ──
        send("progress", { step: 8, label: "Assembling your complete itinerary..." });

        const budgetBreakdown = {
          items: [
            { label: "🚆 Transport (Round Trip)", amount: transportData.total_transport_cost || `₹${transportCostNum}` },
            { label: `🏨 Hotel (${context.totalNights} nights)`, amount: hotelData.hotels?.[hotelData.recommended_tier === "Low" ? 0 : hotelData.recommended_tier === "Premium" ? 2 : 1]?.total_cost || `₹${stayBudget}` },
            { label: "🍽️ Food & Dining", amount: `₹${foodBudget}` },
            { label: "🎫 Activities & Entry", amount: `₹${activityBudget}` },
            { label: "🚗 Local Transport", amount: `₹${localTravelBudget}` },
          ],
          emergency_buffer: `₹${emergencyBuffer}`,
          total_estimated: `₹${context.effectiveBudget}`,
          percent_used: `${Math.round(((context.effectiveBudget - emergencyBuffer) / context.effectiveBudget) * 100)}%`,
          percent_saved: `${Math.round((emergencyBuffer / context.effectiveBudget) * 100)}%`,
          savings_message: `You saved ₹${emergencyBuffer} (${Math.round((emergencyBuffer / context.effectiveBudget) * 100)}%) as emergency buffer`,
        };

        const tripSummary = {
          total_nights: `${context.totalNights} nights`,
          transport_percent: `${Math.round((transportCostNum / context.effectiveBudget) * 100)}%`,
          stay_percent: `${Math.round((stayBudget / context.effectiveBudget) * 100)}%`,
          food_percent: `${Math.round((foodBudget / context.effectiveBudget) * 100)}%`,
        };

        const finalItinerary = {
          ...itineraryData,
          hotels: hotelData.hotels || [],
          transport_options: transportData.options || [],
          transport_analysis: transportData.analysis || null,
          transport_fallback: transportData.fallback || null,
          selected_transport: {
            outbound: transportData.selected_outbound,
            return: transportData.selected_return,
          },
          restaurants: addonsData.restaurants || [],
          travel_tips: addonsData.travel_tips || [],
          packing_checklist: addonsData.packing_checklist || [],
          local_insights: addonsData.local_insights || [],
          nearby_events: eventsData,
          budget_breakdown: budgetBreakdown,
          trip_summary: tripSummary,
          closing_note: `Your personalized ${context.totalDays}-day trip to ${preferences.arrival} is ready! 🎉 This itinerary was crafted with your exact preferences in mind. Have an amazing journey! ✨`,
        };

        send("complete", { success: true, data: finalItinerary });
        controller.close();
      } catch (error) {
        console.error("generate-paid-itinerary error:", error);
        const msg = error.message === "RATE_LIMITED"
          ? "Rate limited. Please try again in a moment."
          : error.message === "PAYMENT_REQUIRED"
          ? "Service temporarily unavailable. Please try again later."
          : error.message || "Something went wrong";
        send("error", { message: msg });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
});
