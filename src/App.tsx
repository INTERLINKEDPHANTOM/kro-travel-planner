import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import BroadcastNotificationPopup from "@/components/BroadcastNotificationPopup";
import Index from "./pages/Index";
import PlanTrip from "./pages/PlanTrip";
import PlanSelection from "./pages/PlanSelection";
import FreeItinerary from "./pages/FreeItinerary";
import PaidItinerary from "./pages/PaidItinerary";
import MyTrips from "./pages/MyTrips";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Destinations from "./pages/Destinations";
import TripGallery from "./pages/TripGallery";
import About from "./pages/About";
import Founder from "./pages/Founder";
import Contact from "./pages/Contact";
import Legal from "./pages/Legal";
import Offers from "./pages/Offers";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import TripChat from "./pages/TripChat";
import TravelPage from "./pages/TravelPage";
import TripWrapped from "./pages/TripWrapped";
import CreatorStudio from "./pages/CreatorStudio";
import TravelMap from "./pages/TravelMap";

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
        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/trip-gallery/:tripId" element={<PageTransition><TripGallery /></PageTransition>} />
        <Route path="/destinations" element={<PageTransition><Destinations /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/founder" element={<PageTransition><Founder /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/legal" element={<PageTransition><Legal /></PageTransition>} />
        <Route path="/offers" element={<PageTransition><Offers /></PageTransition>} />
        <Route path="/checkout" element={<PageTransition><Checkout /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />
        <Route path="/trip-chat/:tripId" element={<PageTransition><TripChat /></PageTransition>} />
        <Route path="/travel/:slug" element={<PageTransition><TravelPage /></PageTransition>} />
        <Route path="/trip-wrapped/:tripId" element={<PageTransition><TripWrapped /></PageTransition>} />
        <Route path="/creator-studio" element={<PageTransition><CreatorStudio /></PageTransition>} />
        <Route path="/travel-map" element={<PageTransition><TravelMap /></PageTransition>} />
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
        <BroadcastNotificationPopup />
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
