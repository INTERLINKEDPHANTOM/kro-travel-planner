import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import Index from "./pages/Index";
import PlanTrip from "./pages/PlanTrip";
import PlanSelection from "./pages/PlanSelection";
import FreeItinerary from "./pages/FreeItinerary";
import PaidItinerary from "./pages/PaidItinerary";
import MyTrips from "./pages/MyTrips";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Destinations from "./pages/Destinations";
import TripGallery from "./pages/TripGallery";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/plan" element={<PageTransition><PlanTrip /></PageTransition>} />
        <Route path="/plans" element={<PageTransition><PlanSelection /></PageTransition>} />
        <Route path="/itinerary/:destination" element={<PageTransition><FreeItinerary /></PageTransition>} />
        <Route path="/paid-itinerary" element={<PageTransition><PaidItinerary /></PageTransition>} />
        <Route path="/my-trips" element={<PageTransition><MyTrips /></PageTransition>} />
        <Route path="/trip-gallery/:tripId" element={<PageTransition><TripGallery /></PageTransition>} />
        <Route path="/destinations" element={<PageTransition><Destinations /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
