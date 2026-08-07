import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Compass, Clock, Wallet } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl"
        >
          <h1 className="text-5xl font-bold mb-6">Plan your perfect trip with AI</h1>
          <p className="text-xl text-muted-foreground mb-8">
            The intelligent operating system for modern travel.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/plan">
              <button className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold">
                Start Planning
              </button>
            </Link>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
