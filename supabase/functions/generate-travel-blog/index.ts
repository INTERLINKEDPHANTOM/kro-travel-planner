import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { destination, days, preferences, tripSummary } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const daysText = (days || []).map((d: any, i: number) => {
      const acts = (d.activities || []).map((a: any) => `- ${a.time || ""}: ${a.activity || a.place || ""} ${a.note ? `(${a.note})` : ""}`).join("\n");
      return `Day ${i + 1} — ${d.title || ""}:\n${acts}`;
    }).join("\n\n");

    const systemPrompt = `You are a world-class travel blogger who writes vivid, emotionally engaging travel stories. Write in first person, use sensory language, weave in cultural insights, and maintain an authentic voice. Format in Markdown with headings, paragraphs, and occasional quotes.`;

    const userPrompt = `Write a complete travel blog post about my trip to ${destination}.

Trip Details:
- Destination: ${destination}
- Travel Style: ${preferences?.travel_type || "leisure"}
- Travelers: ${preferences?.num_people || 2}
- Persona: ${preferences?.travel_persona || "explorer"}

Itinerary:
${daysText}

${tripSummary ? `Summary: Total budget used ~₹${tripSummary.total_estimated || "N/A"}` : ""}

Requirements:
1. Catchy title with emoji
2. Opening hook paragraph that draws readers in
3. Day-by-day storytelling (not a dry list — make it VIVID)
4. Include sensory details (smells, sounds, sights, tastes)
5. Add practical tips embedded naturally in the story
6. A reflective closing paragraph
7. Keep it 800-1200 words
8. Use markdown formatting (## headings, **bold**, *italic*, > blockquotes)
9. Include a "Quick Tips" section at the end
10. End with a catchy one-liner`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI generation failed");
    }

    const data = await response.json();
    const blogContent = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ success: true, blog: blogContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Blog generation error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
