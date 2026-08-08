import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_trip_expenses",
  title: "List trip expenses",
  description: "List the signed-in user's recorded travel expenses, optionally filtered to a single trip.",
  inputSchema: {
    trip_id: z.string().uuid().nullable().default(null).describe("Optional trip id to filter expenses by."),
    limit: z.number().int().min(1).max(100).default(50).describe("Maximum number of expenses to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ trip_id, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("trip_expenses")
      .select("id, trip_id, amount, currency, category, description, expense_date")
      .order("expense_date", { ascending: false })
      .limit(limit ?? 50);
    if (trip_id) query = query.eq("trip_id", trip_id);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const total = (data ?? []).reduce((sum, e) => sum + Number(e.amount ?? 0), 0);
    return {
      content: [{ type: "text", text: JSON.stringify({ total, expenses: data ?? [] }) }],
      structuredContent: { total, expenses: data ?? [] },
    };
  },
});
