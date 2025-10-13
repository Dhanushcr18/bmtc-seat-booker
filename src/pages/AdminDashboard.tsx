import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { ArrowLeft, Bus, DollarSign, MapPin, Ticket, Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const stats = useQuery(api.admin.getDashboardStats);
  const routes = useQuery(api.routes.getAllRoutes);
  const buses = useQuery(api.buses.getAllBuses);
  const bookings = useQuery(api.bookings.getAllBookings);
  const staff = useQuery(api.staff.getAllStaff);
  
  const addRoute = useMutation(api.routes.addRoute);
  const addBus = useMutation(api.buses.addBus);

  const [openRouteDialog, setOpenRouteDialog] = useState(false);
  const [openBusDialog, setOpenBusDialog] = useState(false);

  // Route form state
  const [routeForm, setRouteForm] = useState({
    routeName: "",
    source: "",
    destination: "",
    distance: "",
    estimatedTime: "",
    fare: "",
    stops: "",
  });

  // Bus form state
  const [busForm, setBusForm] = useState({
    busNumber: "",
    routeId: "",
    capacity: "",
    totalSeats: "",
    busType: "",
    driverId: "",
    conductorId: "",
  });

  if (isLoading || !user) {
    navigate("/auth");
    return null;
  }

  if (user.role !== "admin") {
    navigate("/dashboard");
    return null;
  }

  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addRoute({
        routeName: routeForm.routeName,
        source: routeForm.source,
        destination: routeForm.destination,
        distance: parseFloat(routeForm.distance),
        estimatedTime: parseFloat(routeForm.estimatedTime),
        fare: parseFloat(routeForm.fare),
        stops: routeForm.stops.split(",").map(s => s.trim()),
      });
      toast.success("Route added successfully!");
      setOpenRouteDialog(false);
      setRouteForm({
        routeName: "",
        source: "",
        destination: "",
        distance: "",
        estimatedTime: "",
        fare: "",
        stops: "",
      });
    } catch (error) {
      toast.error("Failed to add route");
      console.error(error);
    }
  };

  const handleAddBus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addBus({
        busNumber: busForm.busNumber,
        routeId: busForm.routeId as any,
        capacity: parseFloat(busForm.capacity),
        totalSeats: parseFloat(busForm.totalSeats),
        busType: busForm.busType,
        driverId: busForm.driverId ? (busForm.driverId as any) : undefined,
        conductorId: busForm.conductorId ? (busForm.conductorId as any) : undefined,
      });
      toast.success("Bus added successfully!");
      setOpenBusDialog(false);
      setBusForm({
        busNumber: "",
        routeId: "",
        capacity: "",
        totalSeats: "",
        busType: "",
        driverId: "",
        conductorId: "",
      });
    } catch (error) {
      toast.error("Failed to add bus");
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
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>All Routes</CardTitle>
                      <CardDescription>Manage bus routes and schedules</CardDescription>
                    </div>
                    <Dialog open={openRouteDialog} onOpenChange={setOpenRouteDialog}>
                      <DialogTrigger asChild>
                        <Button className="glass-strong">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Route
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="glass-strong border max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Add New Route</DialogTitle>
                          <DialogDescription>Create a new bus route in the system</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddRoute} className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="routeName">Route Name</Label>
                              <Input
                                id="routeName"
                                value={routeForm.routeName}
                                onChange={(e) => setRouteForm({ ...routeForm, routeName: e.target.value })}
                                placeholder="e.g., KR Market to Whitefield"
                                required
                                className="glass"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="fare">Fare (₹)</Label>
                              <Input
                                id="fare"
                                type="number"
                                value={routeForm.fare}
                                onChange={(e) => setRouteForm({ ...routeForm, fare: e.target.value })}
                                placeholder="50"
                                required
                                className="glass"
                              />
                            </div>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="source">Source</Label>
                              <Input
                                id="source"
                                value={routeForm.source}
                                onChange={(e) => setRouteForm({ ...routeForm, source: e.target.value })}
                                placeholder="KR Market"
                                required
                                className="glass"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="destination">Destination</Label>
                              <Input
                                id="destination"
                                value={routeForm.destination}
                                onChange={(e) => setRouteForm({ ...routeForm, destination: e.target.value })}
                                placeholder="Whitefield"
                                required
                                className="glass"
                              />
                            </div>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="distance">Distance (km)</Label>
                              <Input
                                id="distance"
                                type="number"
                                value={routeForm.distance}
                                onChange={(e) => setRouteForm({ ...routeForm, distance: e.target.value })}
                                placeholder="25"
                                required
                                className="glass"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="estimatedTime">Estimated Time (mins)</Label>
                              <Input
                                id="estimatedTime"
                                type="number"
                                value={routeForm.estimatedTime}
                                onChange={(e) => setRouteForm({ ...routeForm, estimatedTime: e.target.value })}
                                placeholder="60"
                                required
                                className="glass"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="stops">Stops (comma-separated)</Label>
                            <Input
                              id="stops"
                              value={routeForm.stops}
                              onChange={(e) => setRouteForm({ ...routeForm, stops: e.target.value })}
                              placeholder="KR Market, Shivaji Nagar, MG Road, Whitefield"
                              required
                              className="glass"
                            />
                          </div>
                          <Button type="submit" className="w-full glass-strong">
                            Add Route
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
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
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>All Buses</CardTitle>
                      <CardDescription>Manage bus fleet and assignments</CardDescription>
                    </div>
                    <Dialog open={openBusDialog} onOpenChange={setOpenBusDialog}>
                      <DialogTrigger asChild>
                        <Button className="glass-strong">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Bus
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="glass-strong border max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Add New Bus</DialogTitle>
                          <DialogDescription>Register a new bus in the system</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddBus} className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="busNumber">Bus Number</Label>
                              <Input
                                id="busNumber"
                                value={busForm.busNumber}
                                onChange={(e) => setBusForm({ ...busForm, busNumber: e.target.value })}
                                placeholder="KA-01-AB-1234"
                                required
                                className="glass"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="busType">Bus Type</Label>
                              <Select
                                value={busForm.busType}
                                onValueChange={(value) => setBusForm({ ...busForm, busType: value })}
                              >
                                <SelectTrigger className="glass">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent className="glass-strong border">
                                  <SelectItem value="AC">AC</SelectItem>
                                  <SelectItem value="Non-AC">Non-AC</SelectItem>
                                  <SelectItem value="Volvo">Volvo</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="capacity">Capacity</Label>
                              <Input
                                id="capacity"
                                type="number"
                                value={busForm.capacity}
                                onChange={(e) => setBusForm({ ...busForm, capacity: e.target.value })}
                                placeholder="40"
                                required
                                className="glass"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="totalSeats">Total Seats</Label>
                              <Input
                                id="totalSeats"
                                type="number"
                                value={busForm.totalSeats}
                                onChange={(e) => setBusForm({ ...busForm, totalSeats: e.target.value })}
                                placeholder="40"
                                required
                                className="glass"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="routeId">Assign Route</Label>
                            <Select
                              value={busForm.routeId}
                              onValueChange={(value) => setBusForm({ ...busForm, routeId: value })}
                            >
                              <SelectTrigger className="glass">
                                <SelectValue placeholder="Select route" />
                              </SelectTrigger>
                              <SelectContent className="glass-strong border">
                                {routes?.map((route) => (
                                  <SelectItem key={route._id} value={route._id}>
                                    {route.routeName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="driverId">Driver (Optional)</Label>
                              <Select
                                value={busForm.driverId}
                                onValueChange={(value) => setBusForm({ ...busForm, driverId: value })}
                              >
                                <SelectTrigger className="glass">
                                  <SelectValue placeholder="Select driver" />
                                </SelectTrigger>
                                <SelectContent className="glass-strong border">
                                  <SelectItem value="">None</SelectItem>
                                  {staff?.filter(s => s.role === "driver").map((driver) => (
                                    <SelectItem key={driver._id} value={driver._id}>
                                      {driver.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="conductorId">Conductor (Optional)</Label>
                              <Select
                                value={busForm.conductorId}
                                onValueChange={(value) => setBusForm({ ...busForm, conductorId: value })}
                              >
                                <SelectTrigger className="glass">
                                  <SelectValue placeholder="Select conductor" />
                                </SelectTrigger>
                                <SelectContent className="glass-strong border">
                                  <SelectItem value="">None</SelectItem>
                                  {staff?.filter(s => s.role === "conductor").map((conductor) => (
                                    <SelectItem key={conductor._id} value={conductor._id}>
                                      {conductor.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <Button type="submit" className="w-full glass-strong">
                            Add Bus
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
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