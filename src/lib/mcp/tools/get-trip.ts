import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_trip",
  title: "Get trip details",
  description: "Get the full itinerary data and preferences for one of the signed-in user's saved trips.",
  inputSchema: {
    trip_id: z.string().uuid().describe("The id of the saved trip, from list_my_trips."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ trip_id }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("saved_itineraries")
      .select("id, destination, status, preferences, itinerary_data, created_at, updated_at")
      .eq("id", trip_id)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) throw new ToolError(`No trip found with id ${trip_id}`);
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { trip: data },
    };
  },
});
