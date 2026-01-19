import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
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

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("AI Features", () => {
  beforeAll(async () => {
    // 确保测试用户有profile
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    try {
      await caller.userProfile.create({
        gender: "male",
        age: 30,
        height: 175,
        initialWeight: 80,
        targetWeight: 70,
        activityLevel: "moderate",
      });
    } catch (e) {
      // Profile可能已存在，忽略错误
    }
  });

  it("should recommend meal plan", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.mealPlan.recommend({
      targetCalories: 1800,
      preferences: "低碳水",
    });

    expect(result.success).toBe(true);
    expect(result.recommendation).toBeTruthy();
    expect(typeof result.recommendation).toBe("string");
  }, 30000); // AI调用可能需要较长时间

  it("should chat with nutritionist", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.aiAdvisor.chat({
      message: "减肥期间可以吃水果吗？",
      type: "nutritionist",
    });

    expect(result.success).toBe(true);
    expect(result.reply).toBeTruthy();
    expect(typeof result.reply).toBe("string");
  }, 30000);

  it("should chat with trainer", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.aiAdvisor.chat({
      message: "新手应该如何开始运动？",
      type: "trainer",
    });

    expect(result.success).toBe(true);
    expect(result.reply).toBeTruthy();
    expect(typeof result.reply).toBe("string");
  }, 30000);
});
