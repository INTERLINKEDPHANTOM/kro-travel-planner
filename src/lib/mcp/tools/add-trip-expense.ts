import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "add_trip_expense",
  title: "Add trip expense",
  description: "Record a new travel expense for the signed-in user, optionally linked to a saved trip.",
  inputSchema: {
    amount: z.number().positive().describe("Expense amount."),
    category: z.string().trim().min(1).default("general").describe("Expense category, e.g. food, transport, stay."),
    description: z.string().trim().nullable().default(null).describe("Optional note about the expense."),
    currency: z.string().trim().default("INR").describe("Currency code, defaults to INR."),
    expense_date: z.string().nullable().default(null).describe("Date in YYYY-MM-DD; defaults to today."),
    trip_id: z.string().uuid().nullable().default(null).describe("Optional saved trip id to attach the expense to."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ amount, category, description, currency, expense_date, trip_id }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("trip_expenses")
      .insert({
        user_id: ctx.getUserId(),
        amount,
        category: category || "general",
        description: description ?? null,
        currency: currency || "INR",
        ...(expense_date ? { expense_date } : {}),
        trip_id: trip_id ?? null,
      })
      .select()
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { expense: data },
    };
  },
});
