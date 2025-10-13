import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Bus, Calendar, LogOut, MapPin, Search, Ticket } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "convex/react";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, signOut, isLoading } = useAuth();
  const navigate = useNavigate();
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<string>("");

  const routes = useQuery(api.routes.getAllRoutes);
  const buses = useQuery(
    api.buses.getBusesByRoute,
    selectedRoute ? { routeId: selectedRoute as any } : "skip"
  );

  const handleLogout = async () => {
    await signOut();
    navigate("/");
    toast.success("Logged out successfully");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background orbs */}
      <div className="glow-orb w-96 h-96 bg-primary/30 top-0 right-0" />
      <div className="glow-orb w-80 h-80 bg-secondary/30 bottom-20 left-10" />

      {/* Navbar */}
      <nav className="glass sticky top-0 z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
              <img src="./logo.svg" alt="BMTC Logo" className="h-10 w-10" />
              <span className="text-xl font-bold tracking-tight">BMTC Booking</span>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/bookings")}
                className="glass"
              >
                <Ticket className="mr-2 h-4 w-4" />
                My Bookings
              </Button>
              {user.role === "admin" && (
                <Button
                  variant="ghost"
                  onClick={() => navigate("/admin")}
                  className="glass"
                >
                  Admin Panel
                </Button>
              )}
              <Button variant="ghost" onClick={handleLogout} className="glass">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Welcome back, {user.name || "User"}!
          </h1>
          <p className="text-muted-foreground mb-8">
            Book your bus tickets quickly and easily
          </p>

          {/* Search Section */}
          <Card className="glass-strong border mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Routes
              </CardTitle>
              <CardDescription>
                Find the perfect route for your journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="source">From</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="source"
                      placeholder="Enter source location"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className="pl-9 glass"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">To</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="destination"
                      placeholder="Enter destination"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="pl-9 glass"
                    />
                  </div>
                </div>
              </div>
              <Button className="w-full glass-strong" size="lg">
                <Search className="mr-2 h-4 w-4" />
                Search Buses
              </Button>
            </CardContent>
          </Card>

          {/* Available Routes */}
          <Card className="glass-strong border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bus className="h-5 w-5" />
                Available Routes
              </CardTitle>
              <CardDescription>
                Select a route to view available buses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {routes && routes.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {routes.map((route) => (
                    <motion.div
                      key={route._id}
                      whileHover={{ scale: 1.02 }}
                      className="glass rounded-xl p-4 cursor-pointer border hover:border-primary transition-all"
                      onClick={() => {
                        setSelectedRoute(route._id);
                        navigate(`/booking/${route._id}`);
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold">{route.routeName}</h3>
                        <span className="text-sm font-bold text-primary">
                          ₹{route.fare}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          {route.source} → {route.destination}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {route.estimatedTime} mins • {route.distance} km
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="w-full mt-3 glass"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/booking/${route._id}`);
                        }}
                      >
                        Book Now
                      </Button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Bus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No routes available at the moment</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
