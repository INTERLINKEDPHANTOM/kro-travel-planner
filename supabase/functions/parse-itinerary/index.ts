import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { rawText } = await req.json();
    if (!rawText) throw new Error("No text provided");

    const systemPrompt = `You are a travel content parser. Given raw travel itinerary text, extract and classify it into this exact JSON structure. Be thorough — capture ALL data from the text. If a section doesn't exist in the text, use an empty array or empty string.

Return ONLY valid JSON with this structure:
{
  "emotional_hook": "string - the opening emotional/atmospheric description",
  "local_resident": "string - the local resident credibility statement",
  "vibe": "string - atmosphere and vibe description of the place",
  "why_special": ["array of strings - reasons why the place is special"],
  "must_visit_places": [
    {
      "name": "string",
      "best_time": "string",
      "cost": "string",
      "local_tip": "string",
      "maps_url": "string - Google Maps URL if available",
      "vibe": "string - short atmospheric description"
    }
  ],
  "hidden_gems": ["array of strings - hidden gems only locals know"],
  "food_spots": [
    {
      "name": "string",
      "area": "string",
      "dish": "string - signature dish",
      "cost": "string"
    }
  ],
  "food_timing_tip": "string - timing hack for food",
  "daily_cost_breakdown": {
    "items": [
      { "label": "string", "range": "string" }
    ],
    "total": "string",
    "people_count": "string"
  },
  "transport_guide": [
    {
      "mode": "string",
      "cost": "string",
      "tag": "string - e.g. Cheapest, Fastest"
    }
  ],
  "transport_warning": "string",
  "best_time_to_visit": [
    {
      "period": "string",
      "description": "string",
      "emoji": "string - weather emoji"
    }
  ],
  "ideal_duration": "string",
  "local_tips": ["array of strings - pro tips from locals"],
  "resident_moments": "string - small local moments description",
  "sample_itinerary": [
    {
      "day": "string - e.g. Day 1",
      "items": ["array of activity strings"],
      "cost": "string"
    }
  ],
  "ending_note": "string - closing emotional paragraph"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: rawText },
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    
    // Strip markdown code fences if present
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    const parsed = JSON.parse(content);

    return new Response(JSON.stringify({ success: true, data: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
