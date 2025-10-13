import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAvailableSeats = query({
  args: { busId: v.id("buses") },
  handler: async (ctx, args) => {
    const seats = await ctx.db
      .query("seats")
      .withIndex("by_bus", (q) => q.eq("busId", args.busId))
      .collect();

    return {
      busId: args.busId,
      vacantSeats: seats.filter((s) => !s.isOccupied).map((s) => s.seatNumber),
      occupiedSeats: seats.filter((s) => s.isOccupied).map((s) => s.seatNumber),
      totalSeats: seats.length,
    };
  },
});

export const updateSeatStatus = mutation({
  args: {
    busId: v.id("buses"),
    seatNumber: v.number(),
    isOccupied: v.boolean(),
  },
  handler: async (ctx, args) => {
    const seat = await ctx.db
      .query("seats")
      .withIndex("by_bus_and_seat", (q) =>
        q.eq("busId", args.busId).eq("seatNumber", args.seatNumber)
      )
      .unique();

    if (!seat) {
      throw new Error("Seat not found");
    }

    await ctx.db.patch(seat._id, {
      isOccupied: args.isOccupied,
      lastScanned: Date.now(),
    });

    return seat._id;
  },
});

export const bulkUpdateSeats = mutation({
  args: {
    busId: v.id("buses"),
    vacantSeats: v.array(v.number()),
    occupiedSeats: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    const allSeats = await ctx.db
      .query("seats")
      .withIndex("by_bus", (q) => q.eq("busId", args.busId))
      .collect();

    for (const seat of allSeats) {
      const isOccupied = args.occupiedSeats.includes(seat.seatNumber);
      await ctx.db.patch(seat._id, {
        isOccupied,
        lastScanned: Date.now(),
      });
    }

    return { success: true };
  },
});
