import { mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const subscribe = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const clean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean) || clean.length > 254) {
      throw new ConvexError("Enter a valid email address.");
    }
    const existing = await ctx.db
      .query("subscribers")
      .withIndex("by_email", (q) => q.eq("email", clean))
      .first();
    if (!existing) await ctx.db.insert("subscribers", { email: clean });
    return { alreadySubscribed: !!existing };
  },
});
