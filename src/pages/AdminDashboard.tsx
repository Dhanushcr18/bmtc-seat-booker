import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { ArrowLeft, Bus, DollarSign, MapPin, Ticket, Users } from "lucide-react";
import { useNavigate } from "react-router";
import { useQuery } from "convex/react";

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const stats = useQuery(api.admin.getDashboardStats);
  const routes = useQuery(api.routes.getAllRoutes);
  const buses = useQuery(api.buses.getAllBuses);
  const bookings = useQuery(api.bookings.getAllBookings);

  if (isLoading || !user) {
    navigate("/auth");
    return null;
  }

  if (user.role !== "admin") {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="glow-orb w-96 h-96 bg-primary/30 top-0 right-0" />
      <div className="glow-orb w-80 h-80 bg-secondary/30 bottom-20 left-10" />

      <nav className="glass sticky top-0 z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
              <img src="/logo.svg" alt="BMTC Logo" className="h-10 w-10" />
              <span className="text-xl font-bold tracking-tight">Admin Dashboard</span>
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
          <h1 className="text-4xl font-bold tracking-tight mb-8">Admin Dashboard</h1>

          {stats && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="glass-strong border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Buses</CardTitle>
                  <Bus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalBuses}</div>
                  <p className="text-xs text-muted-foreground">{stats.activeBuses} currently active</p>
                </CardContent>
              </Card>

              <Card className="glass-strong border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Routes</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalRoutes}</div>
                  <p className="text-xs text-muted-foreground">Active routes</p>
                </CardContent>
              </Card>

              <Card className="glass-strong border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Ticket className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalBookings}</div>
                  <p className="text-xs text-muted-foreground">{stats.todayBookings} today</p>
                </CardContent>
              </Card>

              <Card className="glass-strong border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{stats.totalRevenue}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>
            </div>
          )}

          <Tabs defaultValue="routes" className="space-y-6">
            <TabsList className="glass">
              <TabsTrigger value="routes">Routes</TabsTrigger>
              <TabsTrigger value="buses">Buses</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
            </TabsList>

            <TabsContent value="routes">
              <Card className="glass-strong border">
                <CardHeader>
                  <CardTitle>All Routes</CardTitle>
                  <CardDescription>Manage bus routes and schedules</CardDescription>
                </CardHeader>
                <CardContent>
                  {routes && routes.length > 0 ? (
                    <div className="space-y-3">
                      {routes.map((route) => (
                        <div key={route._id} className="glass rounded-lg p-4 border">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold">{route.routeName}</h3>
                              <p className="text-sm text-muted-foreground">
                                {route.source} → {route.destination}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {route.distance} km • {route.estimatedTime} mins • ₹{route.fare}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No routes available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="buses">
              <Card className="glass-strong border">
                <CardHeader>
                  <CardTitle>All Buses</CardTitle>
                  <CardDescription>Manage bus fleet and assignments</CardDescription>
                </CardHeader>
                <CardContent>
                  {buses && buses.length > 0 ? (
                    <div className="space-y-3">
                      {buses.map((bus) => (
                        <div key={bus._id} className="glass rounded-lg p-4 border">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold">{bus.busNumber}</h3>
                              <p className="text-sm text-muted-foreground">{bus.busType}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Route: {bus.route?.routeName || "Not assigned"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{bus.totalSeats} seats</p>
                              <p className="text-xs text-muted-foreground">Capacity: {bus.capacity}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No buses available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bookings">
              <Card className="glass-strong border">
                <CardHeader>
                  <CardTitle>All Bookings</CardTitle>
                  <CardDescription>View and manage customer bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  {bookings && bookings.length > 0 ? (
                    <div className="space-y-3">
                      {bookings.slice(0, 10).map((booking) => (
                        <div key={booking._id} className="glass rounded-lg p-4 border">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold">{booking.route?.routeName || "Route"}</h3>
                              <p className="text-sm text-muted-foreground">
                                User: {booking.user?.name || booking.user?.email || "Guest"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Seats: {booking.seatNumbers.join(", ")}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-primary">₹{booking.totalFare}</p>
                              <p className="text-xs text-muted-foreground">{booking.status}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No bookings yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
