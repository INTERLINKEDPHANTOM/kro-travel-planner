import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "search_destinations",
  title: "Search destinations",
  description: "Search published destination guides available in the app by destination or title.",
  inputSchema: {
    query: z.string().trim().min(1).describe("Destination or keyword to search for, e.g. 'Goa'."),
    limit: z.number().int().min(1).max(25).default(10).describe("Maximum number of results."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("itineraries")
      .select("id, title, destination, cover_image_url, updated_at")
      .eq("is_published", true)
      .or(`destination.ilike.%${query}%,title.ilike.%${query}%`)
      .limit(limit ?? 10);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { destinations: data ?? [] },
    };
  },
});
