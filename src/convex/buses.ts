import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const getAllBuses = query({
  args: {},
  handler: async (ctx) => {
    const buses = await ctx.db
      .query("buses")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return await Promise.all(
      buses.map(async (bus) => {
        const route = await ctx.db.get(bus.routeId);
        const driver = bus.driverId ? await ctx.db.get(bus.driverId) : null;
        const conductor = bus.conductorId
          ? await ctx.db.get(bus.conductorId)
          : null;

        return {
          ...bus,
          route,
          driver,
          conductor,
        };
      })
    );
  },
});

export const getBusesByRoute = query({
  args: { routeId: v.id("routes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("buses")
      .withIndex("by_route", (q) => q.eq("routeId", args.routeId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const getBusById = query({
  args: { busId: v.id("buses") },
  handler: async (ctx, args) => {
    const bus = await ctx.db.get(args.busId);
    if (!bus) return null;

    const route = await ctx.db.get(bus.routeId);
    const driver = bus.driverId ? await ctx.db.get(bus.driverId) : null;
    const conductor = bus.conductorId ? await ctx.db.get(bus.conductorId) : null;

    return {
      ...bus,
      route,
      driver,
      conductor,
    };
  },
});

export const addBus = mutation({
  args: {
    busNumber: v.string(),
    routeId: v.id("routes"),
    capacity: v.number(),
    totalSeats: v.number(),
    busType: v.string(),
    driverId: v.optional(v.id("staff")),
    conductorId: v.optional(v.id("staff")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const busId = await ctx.db.insert("buses", {
      ...args,
      isActive: true,
    });

    // Initialize seats for the bus
    for (let i = 1; i <= args.totalSeats; i++) {
      await ctx.db.insert("seats", {
        busId,
        seatNumber: i,
        isOccupied: false,
      });
    }

    return busId;
  },
});

export const updateBus = mutation({
  args: {
    busId: v.id("buses"),
    busNumber: v.optional(v.string()),
    routeId: v.optional(v.id("routes")),
    capacity: v.optional(v.number()),
    totalSeats: v.optional(v.number()),
    busType: v.optional(v.string()),
    driverId: v.optional(v.id("staff")),
    conductorId: v.optional(v.id("staff")),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const { busId, ...updates } = args;
    await ctx.db.patch(busId, updates);
    return busId;
  },
});

export const updateBusLocation = mutation({
  args: {
    busId: v.id("buses"),
    lat: v.number(),
    lng: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.busId, {
      currentLocation: {
        lat: args.lat,
        lng: args.lng,
        lastUpdated: Date.now(),
      },
    });
    return args.busId;
  },
});
