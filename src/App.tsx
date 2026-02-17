import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PlanTrip from "./pages/PlanTrip";
import PlanSelection from "./pages/PlanSelection";
import FreeItinerary from "./pages/FreeItinerary";
import PaidItinerary from "./pages/PaidItinerary";
import MyTrips from "./pages/MyTrips";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Destinations from "./pages/Destinations";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/plan" element={<PlanTrip />} />
          <Route path="/plans" element={<PlanSelection />} />
          <Route path="/itinerary/:destination" element={<FreeItinerary />} />
          <Route path="/paid-itinerary" element={<PaidItinerary />} />
          <Route path="/my-trips" element={<MyTrips />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
