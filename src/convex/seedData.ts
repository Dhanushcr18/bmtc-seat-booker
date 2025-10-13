import { internalMutation } from "./_generated/server";

export const seedDatabase = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already exists
    const existingRoutes = await ctx.db.query("routes").collect();
    if (existingRoutes.length > 0) {
      return { message: "Database already seeded" };
    }

    // Create routes
    const route1 = await ctx.db.insert("routes", {
      routeName: "KR Market to Whitefield",
      source: "KR Market",
      destination: "Whitefield",
      distance: 25,
      estimatedTime: 60,
      fare: 50,
      stops: ["KR Market", "Shivaji Nagar", "MG Road", "Indiranagar", "Marathahalli", "Whitefield"],
      isActive: true,
    });

    const route2 = await ctx.db.insert("routes", {
      routeName: "Majestic to Electronic City",
      source: "Majestic",
      destination: "Electronic City",
      distance: 22,
      estimatedTime: 55,
      fare: 45,
      stops: ["Majestic", "Jayanagar", "BTM Layout", "Silk Board", "Electronic City"],
      isActive: true,
    });

    const route3 = await ctx.db.insert("routes", {
      routeName: "Hebbal to Banashankari",
      source: "Hebbal",
      destination: "Banashankari",
      distance: 28,
      estimatedTime: 70,
      fare: 55,
      stops: ["Hebbal", "Yeshwanthpur", "Rajajinagar", "Vijayanagar", "RV Road", "Banashankari"],
      isActive: true,
    });

    // Create staff
    const driver1 = await ctx.db.insert("staff", {
      name: "Rajesh Kumar",
      email: "rajesh@bmtc.com",
      phone: "+91 9876543210",
      role: "driver",
      licenseNumber: "KA01-DL-123456",
      isActive: true,
    });

    const conductor1 = await ctx.db.insert("staff", {
      name: "Suresh Reddy",
      email: "suresh@bmtc.com",
      phone: "+91 9876543211",
      role: "conductor",
      isActive: true,
    });

    const driver2 = await ctx.db.insert("staff", {
      name: "Prakash Singh",
      email: "prakash@bmtc.com",
      phone: "+91 9876543212",
      role: "driver",
      licenseNumber: "KA01-DL-789012",
      isActive: true,
    });

    // Create buses
    const bus1 = await ctx.db.insert("buses", {
      busNumber: "KA-01-AB-1234",
      routeId: route1,
      capacity: 40,
      totalSeats: 40,
      busType: "Non-AC",
      driverId: driver1,
      conductorId: conductor1,
      isActive: true,
    });

    const bus2 = await ctx.db.insert("buses", {
      busNumber: "KA-01-CD-5678",
      routeId: route2,
      capacity: 45,
      totalSeats: 45,
      busType: "AC",
      driverId: driver2,
      isActive: true,
    });

    const bus3 = await ctx.db.insert("buses", {
      busNumber: "KA-01-EF-9012",
      routeId: route3,
      capacity: 50,
      totalSeats: 50,
      busType: "Volvo",
      isActive: true,
    });

    // Create seats for each bus
    for (let i = 1; i <= 40; i++) {
      await ctx.db.insert("seats", {
        busId: bus1,
        seatNumber: i,
        isOccupied: i <= 5, // First 5 seats occupied
      });
    }

    for (let i = 1; i <= 45; i++) {
      await ctx.db.insert("seats", {
        busId: bus2,
        seatNumber: i,
        isOccupied: i <= 8,
      });
    }

    for (let i = 1; i <= 50; i++) {
      await ctx.db.insert("seats", {
        busId: bus3,
        seatNumber: i,
        isOccupied: i <= 10,
      });
    }

    return {
      message: "Database seeded successfully",
      routes: 3,
      buses: 3,
      staff: 3,
    };
  },
});
