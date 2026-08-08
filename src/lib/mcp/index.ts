import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listMyTrips from "./tools/list-my-trips";
import getTrip from "./tools/get-trip";
import searchDestinations from "./tools/search-destinations";
import listTripExpenses from "./tools/list-trip-expenses";
import addTripExpense from "./tools/add-trip-expense";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "kro-travel-planner",
  title: "Kro Travel Planner",
  version: "0.1.0",
  instructions:
    "Tools for Kro Travel Planner. Use `list_my_trips` and `get_trip` to read the signed-in user's saved itineraries, `search_destinations` to browse published destination guides, and `list_trip_expenses` / `add_trip_expense` to review or record travel spending.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listMyTrips, getTrip, searchDestinations, listTripExpenses, addTripExpense],
});
