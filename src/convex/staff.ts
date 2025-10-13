import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const getAllStaff = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    return await ctx.db
      .query("staff")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const getStaffByRole = query({
  args: { role: v.union(v.literal("driver"), v.literal("conductor")) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    return await ctx.db
      .query("staff")
      .withIndex("by_role", (q) => q.eq("role", args.role))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const addStaff = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    role: v.union(v.literal("driver"), v.literal("conductor")),
    licenseNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    return await ctx.db.insert("staff", {
      ...args,
      isActive: true,
    });
  },
});

export const updateStaff = mutation({
  args: {
    staffId: v.id("staff"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    licenseNumber: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const { staffId, ...updates } = args;
    await ctx.db.patch(staffId, updates);
    return staffId;
  },
});

export const deleteStaff = mutation({
  args: { staffId: v.id("staff") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    await ctx.db.patch(args.staffId, { isActive: false });
    return args.staffId;
  },
});
