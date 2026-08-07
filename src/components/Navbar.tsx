import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <Compass className="h-6 w-6" />
          <span className="font-bold inline-block">KroTravel</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <Link to="/plan" className="text-sm font-medium hover:underline">
            Plan Trip
          </Link>
          <Link to="/auth" className="text-sm font-medium hover:underline">
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
