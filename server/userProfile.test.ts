import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("userProfile.create", () => {
  it("should create user profile and calculate BMR/TDEE correctly for male", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.userProfile.create({
      gender: "male",
      age: 30,
      height: 175,
      initialWeight: 80,
      targetWeight: 70,
      activityLevel: "moderate",
    });

    expect(result.success).toBe(true);
    expect(result.bmr).toBeGreaterThan(0);
    expect(result.tdee).toBeGreaterThan(result.bmr);
    expect(result.dailyCalorieTarget).toBeGreaterThan(0);
    
    // 男性BMR = 10 × 80 + 6.25 × 175 - 5 × 30 + 5 = 1749
    expect(result.bmr).toBe(1749);
    // TDEE = BMR × 1.55 (moderate) ≈ 2711
    expect(result.tdee).toBe(2711);
    // 减肥目标 = TDEE - 500 = 2211
    expect(result.dailyCalorieTarget).toBe(2211);
  });

  it("should create user profile and calculate BMR/TDEE correctly for female", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.userProfile.create({
      gender: "female",
      age: 25,
      height: 165,
      initialWeight: 60,
      targetWeight: 55,
      activityLevel: "light",
    });

    expect(result.success).toBe(true);
    expect(result.bmr).toBeGreaterThan(0);
    expect(result.tdee).toBeGreaterThan(result.bmr);
    
    // 女性BMR = 10 × 60 + 6.25 × 165 - 5 × 25 - 161 = 1345 (四舍五入)
    expect(result.bmr).toBe(1345);
    // TDEE = BMR × 1.375 (light) = 1849 (四舍五入)
    expect(result.tdee).toBe(1849);
  });
});
