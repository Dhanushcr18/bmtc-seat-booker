import { query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const buses = await ctx.db.query("buses").collect();
    const routes = await ctx.db.query("routes").collect();
    const bookings = await ctx.db.query("bookings").collect();
    const payments = await ctx.db.query("payments").collect();

    const totalBuses = buses.filter((b) => b.isActive).length;
    const totalRoutes = routes.filter((r) => r.isActive).length;
    const activeBuses = buses.filter(
      (b) => b.isActive && b.currentLocation
    ).length;

    const totalRevenue = payments
      .filter((p) => p.status === "success")
      .reduce((sum, p) => sum + p.amount, 0);

    const todayBookings = bookings.filter((b) => {
      const bookingDate = new Date(b.bookingDate);
      const today = new Date();
      return bookingDate.toDateString() === today.toDateString();
    }).length;

    return {
      totalBuses,
      totalRoutes,
      activeBuses,
      totalRevenue,
      totalBookings: bookings.length,
      todayBookings,
      completedBookings: bookings.filter((b) => b.status === "completed")
        .length,
      cancelledBookings: bookings.filter((b) => b.status === "cancelled")
        .length,
    };
  },
});
