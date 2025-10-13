import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { ArrowLeft, Bus, Calendar, CreditCard, MapPin } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";

export default function Booking() {
  const { routeId } = useParams();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [selectedBusId, setSelectedBusId] = useState<Id<"buses"> | null>(null);

  const route = useQuery(api.routes.getRouteById, routeId ? { routeId: routeId as Id<"routes"> } : "skip");
  const buses = useQuery(api.buses.getBusesByRoute, routeId ? { routeId: routeId as Id<"routes"> } : "skip");
  const seatData = useQuery(api.seats.getAvailableSeats, selectedBusId ? { busId: selectedBusId } : "skip");
  const createBooking = useMutation(api.bookings.createBooking);

  if (authLoading || !user) {
    navigate("/auth");
    return null;
  }

  if (!route || !buses) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  const handleSeatClick = (seatNumber: number) => {
    if (seatData?.occupiedSeats.includes(seatNumber)) {
      toast.error("This seat is already occupied");
      return;
    }

    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((s) => s !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const handleBooking = async () => {
    if (!selectedBusId || selectedSeats.length === 0) {
      toast.error("Please select a bus and at least one seat");
      return;
    }

    try {
      const bookingId = await createBooking({
        busId: selectedBusId,
        routeId: routeId as Id<"routes">,
        seatNumbers: selectedSeats,
        journeyDate: new Date().toISOString(),
        source: route.source,
        destination: route.destination,
        totalFare: route.fare * selectedSeats.length,
      });

      toast.success("Booking created successfully!");
      navigate("/bookings");
    } catch (error) {
      toast.error("Failed to create booking. Please try again.");
      console.error(error);
    }
  };

  const totalFare = route.fare * selectedSeats.length;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="glow-orb w-96 h-96 bg-primary/30 top-0 right-0" />
      <div className="glow-orb w-80 h-80 bg-secondary/30 bottom-20 left-10" />

      <nav className="glass sticky top-0 z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
              <img src="/logo.svg" alt="BMTC Logo" className="h-10 w-10" />
              <span className="text-xl font-bold tracking-tight">BMTC Booking</span>
            </div>
            <Button variant="ghost" onClick={() => navigate("/dashboard")} className="glass">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Card className="glass-strong border mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {route.routeName}
              </CardTitle>
              <CardDescription>
                {route.source} → {route.destination} • {route.distance} km • {route.estimatedTime} mins
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="glass-strong border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bus className="h-5 w-5" />
                    Select Bus
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {buses && buses.length > 0 ? (
                    buses.map((bus) => (
                      <div
                        key={bus._id}
                        onClick={() => setSelectedBusId(bus._id)}
                        className={`glass rounded-lg p-4 cursor-pointer border transition-all ${
                          selectedBusId === bus._id ? "border-primary bg-primary/10" : "hover:border-primary/50"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-bold">{bus.busNumber}</h3>
                            <p className="text-sm text-muted-foreground">{bus.busType}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Capacity</p>
                            <p className="font-bold">{bus.totalSeats} seats</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No buses available for this route</p>
                  )}
                </CardContent>
              </Card>

              {selectedBusId && seatData && (
                <Card className="glass-strong border">
                  <CardHeader>
                    <CardTitle>Select Seats</CardTitle>
                    <CardDescription>
                      Available: {seatData.vacantSeats.length} | Occupied: {seatData.occupiedSeats.length}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-3">
                      {Array.from({ length: seatData.totalSeats }, (_, i) => i + 1).map((seatNum) => {
                        const isOccupied = seatData.occupiedSeats.includes(seatNum);
                        const isSelected = selectedSeats.includes(seatNum);

                        return (
                          <Button
                            key={seatNum}
                            variant={isSelected ? "default" : isOccupied ? "secondary" : "outline"}
                            className={`h-12 ${isOccupied ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                            onClick={() => handleSeatClick(seatNum)}
                            disabled={isOccupied}
                          >
                            {seatNum}
                          </Button>
                        );
                      })}
                    </div>
                    <div className="flex gap-4 mt-6 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary rounded" />
                        <span>Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-primary rounded" />
                        <span>Selected</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-secondary opacity-50 rounded" />
                        <span>Occupied</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div>
              <Card className="glass-strong border sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Booking Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Route</span>
                      <span className="font-medium">{route.routeName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fare per seat</span>
                      <span className="font-medium">₹{route.fare}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Selected seats</span>
                      <span className="font-medium">{selectedSeats.length}</span>
                    </div>
                    {selectedSeats.length > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Seat numbers</span>
                        <span className="font-medium">{selectedSeats.join(", ")}</span>
                      </div>
                    )}
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold">Total Amount</span>
                      <span className="text-2xl font-bold text-primary">₹{totalFare}</span>
                    </div>
                    <Button
                      className="w-full glass-strong"
                      size="lg"
                      onClick={handleBooking}
                      disabled={selectedSeats.length === 0 || !selectedBusId}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Proceed to Payment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
