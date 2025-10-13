import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  CONDUCTOR: "conductor",
  DRIVER: "driver",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.CONDUCTOR),
  v.literal(ROLES.DRIVER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
      phone: v.optional(v.string()),
    }).index("email", ["email"]),

    routes: defineTable({
      routeName: v.string(),
      source: v.string(),
      destination: v.string(),
      distance: v.number(), // in km
      estimatedTime: v.number(), // in minutes
      fare: v.number(),
      stops: v.array(v.string()),
      isActive: v.boolean(),
    })
      .index("by_source", ["source"])
      .index("by_destination", ["destination"])
      .index("by_active", ["isActive"]),

    buses: defineTable({
      busNumber: v.string(),
      routeId: v.id("routes"),
      capacity: v.number(),
      totalSeats: v.number(),
      busType: v.string(), // "AC", "Non-AC", "Volvo"
      driverId: v.optional(v.id("staff")),
      conductorId: v.optional(v.id("staff")),
      isActive: v.boolean(),
      currentLocation: v.optional(
        v.object({
          lat: v.number(),
          lng: v.number(),
          lastUpdated: v.number(),
        })
      ),
    })
      .index("by_bus_number", ["busNumber"])
      .index("by_route", ["routeId"])
      .index("by_active", ["isActive"]),

    staff: defineTable({
      name: v.string(),
      email: v.string(),
      phone: v.string(),
      role: v.union(v.literal("driver"), v.literal("conductor")),
      licenseNumber: v.optional(v.string()),
      isActive: v.boolean(),
    })
      .index("by_email", ["email"])
      .index("by_role", ["role"]),

    seats: defineTable({
      busId: v.id("buses"),
      seatNumber: v.number(),
      isOccupied: v.boolean(),
      lastScanned: v.optional(v.number()),
    })
      .index("by_bus", ["busId"])
      .index("by_bus_and_seat", ["busId", "seatNumber"]),

    bookings: defineTable({
      userId: v.id("users"),
      busId: v.id("buses"),
      routeId: v.id("routes"),
      seatNumbers: v.array(v.number()),
      bookingDate: v.number(),
      journeyDate: v.string(),
      source: v.string(),
      destination: v.string(),
      totalFare: v.number(),
      paymentStatus: v.string(), // "pending", "completed", "failed"
      paymentId: v.optional(v.string()),
      qrCode: v.optional(v.string()),
      status: v.string(), // "confirmed", "cancelled", "completed"
    })
      .index("by_user", ["userId"])
      .index("by_bus", ["busId"])
      .index("by_status", ["status"])
      .index("by_payment_status", ["paymentStatus"]),

    payments: defineTable({
      bookingId: v.id("bookings"),
      userId: v.id("users"),
      amount: v.number(),
      paymentMethod: v.string(),
      transactionId: v.string(),
      status: v.string(), // "success", "failed", "pending"
    })
      .index("by_booking", ["bookingId"])
      .index("by_user", ["userId"])
      .index("by_transaction", ["transactionId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;