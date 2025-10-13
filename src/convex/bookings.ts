import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const createBooking = mutation({
  args: {
    busId: v.id("buses"),
    routeId: v.id("routes"),
    seatNumbers: v.array(v.number()),
    journeyDate: v.string(),
    source: v.string(),
    destination: v.string(),
    totalFare: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated");
    }

    // Check if seats are available
    for (const seatNum of args.seatNumbers) {
      const seat = await ctx.db
        .query("seats")
        .withIndex("by_bus_and_seat", (q) =>
          q.eq("busId", args.busId).eq("seatNumber", seatNum)
        )
        .unique();

      if (!seat || seat.isOccupied) {
        throw new Error(`Seat ${seatNum} is not available`);
      }
    }

    // Create booking
    const bookingId = await ctx.db.insert("bookings", {
      userId: user._id,
      busId: args.busId,
      routeId: args.routeId,
      seatNumbers: args.seatNumbers,
      bookingDate: Date.now(),
      journeyDate: args.journeyDate,
      source: args.source,
      destination: args.destination,
      totalFare: args.totalFare,
      paymentStatus: "pending",
      status: "confirmed",
      qrCode: `BMTC-${Date.now()}-${user._id}`,
    });

    // Mark seats as occupied
    for (const seatNum of args.seatNumbers) {
      const seat = await ctx.db
        .query("seats")
        .withIndex("by_bus_and_seat", (q) =>
          q.eq("busId", args.busId).eq("seatNumber", seatNum)
        )
        .unique();

      if (seat) {
        await ctx.db.patch(seat._id, { isOccupied: true });
      }
    }

    return bookingId;
  },
});

export const getUserBookings = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return await Promise.all(
      bookings.map(async (booking) => {
        const bus = await ctx.db.get(booking.busId);
        const route = await ctx.db.get(booking.routeId);
        return {
          ...booking,
          bus,
          route,
        };
      })
    );
  },
});

export const getAllBookings = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const bookings = await ctx.db.query("bookings").collect();

    return await Promise.all(
      bookings.map(async (booking) => {
        const bookingUser = await ctx.db.get(booking.userId);
        const bus = await ctx.db.get(booking.busId);
        const route = await ctx.db.get(booking.routeId);
        return {
          ...booking,
          user: bookingUser,
          bus,
          route,
        };
      })
    );
  },
});

export const updatePaymentStatus = mutation({
  args: {
    bookingId: v.id("bookings"),
    paymentStatus: v.string(),
    paymentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, {
      paymentStatus: args.paymentStatus,
      paymentId: args.paymentId,
    });

    if (args.paymentStatus === "completed" && args.paymentId) {
      const booking = await ctx.db.get(args.bookingId);
      if (booking) {
        await ctx.db.insert("payments", {
          bookingId: args.bookingId,
          userId: booking.userId,
          amount: booking.totalFare,
          paymentMethod: "online",
          transactionId: args.paymentId,
          status: "success",
        });
      }
    }

    return args.bookingId;
  },
});

export const cancelBooking = mutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated");
    }

    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.userId !== user._id && user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    // Free up the seats
    for (const seatNum of booking.seatNumbers) {
      const seat = await ctx.db
        .query("seats")
        .withIndex("by_bus_and_seat", (q) =>
          q.eq("busId", booking.busId).eq("seatNumber", seatNum)
        )
        .unique();

      if (seat) {
        await ctx.db.patch(seat._id, { isOccupied: false });
      }
    }

    await ctx.db.patch(args.bookingId, { status: "cancelled" });
    return args.bookingId;
  },
});
