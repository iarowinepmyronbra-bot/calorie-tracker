import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import * as calc from "./utils/calculations";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  foods: router({
    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return await db.searchFoods(input.query);
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getFoodById(input.id);
      }),
  }),

  foodLogs: router({
    add: protectedProcedure
      .input(
        z.object({
          foodId: z.number(),
          foodName: z.string(),
          grams: z.number(),
          calories: z.number(),
          protein: z.number().optional(),
          fat: z.number().optional(),
          carbs: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const logId = await db.addFoodLog({
          userId: ctx.user.id,
          foodId: input.foodId,
          foodName: input.foodName,
          grams: input.grams,
          calories: input.calories,
          protein: input.protein || 0,
          fat: input.fat || 0,
          carbs: input.carbs || 0,
        });
        return { id: logId, success: !!logId };
      }),

    list: protectedProcedure
      .input(
        z.object({
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        return await db.getUserFoodLogs(
          ctx.user.id,
          input.startDate,
          input.endDate
        );
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const success = await db.deleteFoodLog(input.id, ctx.user.id);
        return { success };
      }),

    dailyStats: protectedProcedure
      .input(z.object({ date: z.date() }))
      .query(async ({ ctx, input }) => {
        return await db.getDailyStats(ctx.user.id, input.date);
      }),
  }),

  userProfile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserProfile(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          gender: z.enum(["male", "female"]),
          age: z.number(),
          height: z.number(),
          initialWeight: z.number(),
          targetWeight: z.number(),
          activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
          mealSettings: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // 计算BMR和TDEE
        const bmr = calc.calculateBMR(input.gender, input.age, input.height, input.initialWeight);
        const tdee = calc.calculateTDEE(bmr, input.activityLevel);
        const dailyCalorieTarget = calc.calculateDailyCalorieTarget(
          tdee,
          input.initialWeight,
          input.targetWeight
        );

        const success = await db.upsertUserProfile({
          userId: ctx.user.id,
          gender: input.gender,
          age: input.age,
          height: input.height,
          initialWeight: input.initialWeight,
          targetWeight: input.targetWeight,
          activityLevel: input.activityLevel,
          bmr,
          tdee,
          dailyCalorieTarget,
          mealSettings: input.mealSettings,
        });

        return { success, bmr, tdee, dailyCalorieTarget };
      }),
  }),

  weight: router({
    add: protectedProcedure
      .input(
        z.object({
          weight: z.number(),
          loggedAt: z.date().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getUserProfile(ctx.user.id);
        const bmi = profile ? calc.calculateBMI(input.weight, profile.height) : undefined;

        const logId = await db.addWeightLog({
          userId: ctx.user.id,
          weight: input.weight,
          bmi,
          loggedAt: input.loggedAt,
        });

        return { id: logId, success: !!logId, bmi };
      }),

    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return await db.getUserWeightLogs(ctx.user.id, input.limit);
      }),
  }),

  exercise: router({
    add: protectedProcedure
      .input(
        z.object({
          exerciseType: z.string(),
          duration: z.number(),
          distance: z.number().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getUserProfile(ctx.user.id);
        const weight = profile?.initialWeight || 70; // 默认70kg
        const caloriesBurned = calc.calculateExerciseCalories(
          input.exerciseType,
          input.duration,
          weight
        );

        const logId = await db.addExerciseLog({
          userId: ctx.user.id,
          exerciseType: input.exerciseType,
          duration: input.duration,
          caloriesBurned,
          distance: input.distance,
          notes: input.notes,
        });

        return { id: logId, success: !!logId, caloriesBurned };
      }),

    list: protectedProcedure
      .input(
        z.object({
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        return await db.getUserExerciseLogs(ctx.user.id, input.startDate, input.endDate);
      }),
  }),

  sleep: router({
    add: protectedProcedure
      .input(
        z.object({
          bedTime: z.date(),
          wakeTime: z.date(),
          quality: z.number().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // 计算睡眠时长（小时）
        const duration = Math.round(
          (input.wakeTime.getTime() - input.bedTime.getTime()) / (1000 * 60 * 60)
        );

        const logId = await db.addSleepLog({
          userId: ctx.user.id,
          bedTime: input.bedTime,
          wakeTime: input.wakeTime,
          duration,
          quality: input.quality,
          notes: input.notes,
        });

        return { id: logId, success: !!logId, duration };
      }),

    list: protectedProcedure
      .input(
        z.object({
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        return await db.getUserSleepLogs(ctx.user.id, input.startDate, input.endDate);
      }),
  }),
});

export type AppRouter = typeof appRouter;
