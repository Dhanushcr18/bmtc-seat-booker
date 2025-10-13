import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const getAllRoutes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("routes")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const getRouteById = query({
  args: { routeId: v.id("routes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.routeId);
  },
});

export const searchRoutes = query({
  args: {
    source: v.optional(v.string()),
    destination: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let routes = await ctx.db
      .query("routes")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    if (args.source) {
      routes = routes.filter((r) =>
        r.source.toLowerCase().includes(args.source!.toLowerCase())
      );
    }

    if (args.destination) {
      routes = routes.filter((r) =>
        r.destination.toLowerCase().includes(args.destination!.toLowerCase())
      );
    }

    return routes;
  },
});

export const addRoute = mutation({
  args: {
    routeName: v.string(),
    source: v.string(),
    destination: v.string(),
    distance: v.number(),
    estimatedTime: v.number(),
    fare: v.number(),
    stops: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    return await ctx.db.insert("routes", {
      ...args,
      isActive: true,
    });
  },
});

export const updateRoute = mutation({
  args: {
    routeId: v.id("routes"),
    routeName: v.optional(v.string()),
    source: v.optional(v.string()),
    destination: v.optional(v.string()),
    distance: v.optional(v.number()),
    estimatedTime: v.optional(v.number()),
    fare: v.optional(v.number()),
    stops: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const { routeId, ...updates } = args;
    await ctx.db.patch(routeId, updates);
    return routeId;
  },
});

export const deleteRoute = mutation({
  args: { routeId: v.id("routes") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    await ctx.db.patch(args.routeId, { isActive: false });
    return args.routeId;
  },
});
