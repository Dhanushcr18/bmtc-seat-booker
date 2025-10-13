import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { ArrowLeft, Bus, Calendar, MapPin, Ticket, X } from "lucide-react";
import { useNavigate } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";

export default function MyBookings() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const bookings = useQuery(api.bookings.getUserBookings);
  const cancelBooking = useMutation(api.bookings.cancelBooking);

  if (isLoading || !user) {
    navigate("/auth");
    return null;
  }

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await cancelBooking({ bookingId: bookingId as any });
      toast.success("Booking cancelled successfully");
    } catch (error) {
      toast.error("Failed to cancel booking");
      console.error(error);
    }
  };

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
          <h1 className="text-4xl font-bold tracking-tight mb-2">My Bookings</h1>
          <p className="text-muted-foreground mb-8">View and manage your bus ticket bookings</p>

          {bookings && bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking._id} className="glass-strong border">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Ticket className="h-5 w-5" />
                          {booking.route?.routeName || "Route"}
                        </CardTitle>
                        <CardDescription>
                          Booking ID: {booking._id.slice(-8)}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          booking.status === "confirmed"
                            ? "default"
                            : booking.status === "cancelled"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Route:</span>
                          <span className="font-medium">
                            {booking.source} → {booking.destination}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Bus className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Bus:</span>
                          <span className="font-medium">{booking.bus?.busNumber || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Journey Date:</span>
                          <span className="font-medium">{new Date(booking.journeyDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Seats:</span>
                          <span className="font-medium ml-2">{booking.seatNumbers.join(", ")}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Total Fare:</span>
                          <span className="font-bold text-primary ml-2">₹{booking.totalFare}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Payment:</span>
                          <Badge variant={booking.paymentStatus === "completed" ? "default" : "secondary"} className="ml-2">
                            {booking.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {booking.status === "confirmed" && (
                      <div className="mt-4 pt-4 border-t flex justify-end">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelBooking(booking._id)}
                          className="glass"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancel Booking
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="glass-strong border">
              <CardContent className="text-center py-12">
                <Ticket className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold mb-2">No bookings yet</h3>
                <p className="text-muted-foreground mb-6">Start booking your bus tickets now!</p>
                <Button onClick={() => navigate("/dashboard")} className="glass-strong">
                  Browse Routes
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
