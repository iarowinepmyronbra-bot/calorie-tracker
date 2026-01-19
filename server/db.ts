import { eq, like, desc, and, gte, lte, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, foods, Food, foodLogs, FoodLog, InsertFoodLog,
  userProfiles, UserProfile, InsertUserProfile,
  weightLogs, WeightLog, InsertWeightLog,
  exerciseLogs, ExerciseLog, InsertExerciseLog,
  sleepLogs, SleepLog, InsertSleepLog,
  favoriteFoods, FavoriteFood, InsertFavoriteFood
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * 搜索食物（支持模糊匹配）
 */
export async function searchFoods(query: string): Promise<Food[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot search foods: database not available");
    return [];
  }

  try {
    const results = await db
      .select()
      .from(foods)
      .where(like(foods.name, `%${query}%`))
      .limit(20);
    return results;
  } catch (error) {
    console.error("[Database] Failed to search foods:", error);
    return [];
  }
}

/**
 * 根据ID获取食物
 */
export async function getFoodById(id: number): Promise<Food | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get food: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(foods).where(eq(foods.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get food:", error);
    return undefined;
  }
}

/**
 * 添加饮食记录
 */
export async function addFoodLog(log: InsertFoodLog): Promise<number | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add food log: database not available");
    return undefined;
  }

  try {
    const result = await db.insert(foodLogs).values(log);
    return result[0].insertId;
  } catch (error) {
    console.error("[Database] Failed to add food log:", error);
    return undefined;
  }
}

/**
 * 获取用户的饮食记录（按日期过滤）
 */
export async function getUserFoodLogs(
  userId: number,
  startDate?: Date,
  endDate?: Date
): Promise<FoodLog[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get food logs: database not available");
    return [];
  }

  try {
    const conditions = [eq(foodLogs.userId, userId)];
    
    if (startDate && endDate) {
      conditions.push(gte(foodLogs.loggedAt, startDate));
      conditions.push(lte(foodLogs.loggedAt, endDate));
    }

    const results = await db
      .select()
      .from(foodLogs)
      .where(and(...conditions))
      .orderBy(desc(foodLogs.loggedAt));
    return results;
  } catch (error) {
    console.error("[Database] Failed to get food logs:", error);
    return [];
  }
}

/**
 * 删除饮食记录
 */
export async function deleteFoodLog(id: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete food log: database not available");
    return false;
  }

  try {
    await db.delete(foodLogs).where(and(eq(foodLogs.id, id), eq(foodLogs.userId, userId)));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete food log:", error);
    return false;
  }
}

/**
 * 获取用户每日统计
 */
export async function getDailyStats(userId: number, date: Date) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get daily stats: database not available");
    return { totalCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0, count: 0 };
  }

  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const results = await db
      .select({
        totalCalories: sql<number>`SUM(${foodLogs.calories})`,
        totalProtein: sql<number>`SUM(${foodLogs.protein})`,
        totalFat: sql<number>`SUM(${foodLogs.fat})`,
        totalCarbs: sql<number>`SUM(${foodLogs.carbs})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(foodLogs)
      .where(
        and(
          eq(foodLogs.userId, userId),
          gte(foodLogs.loggedAt, startOfDay),
          lte(foodLogs.loggedAt, endOfDay)
        )
      );

    const stats = results[0];
    return {
      totalCalories: stats?.totalCalories || 0,
      totalProtein: stats?.totalProtein || 0,
      totalFat: stats?.totalFat || 0,
      totalCarbs: stats?.totalCarbs || 0,
      count: stats?.count || 0,
    };
  } catch (error) {
    console.error("[Database] Failed to get daily stats:", error);
    return { totalCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0, count: 0 };
  }
}

/**
 * 创建或更新用户画像
 */
export async function upsertUserProfile(profile: InsertUserProfile): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user profile: database not available");
    return false;
  }

  try {
    await db.insert(userProfiles).values(profile).onDuplicateKeyUpdate({
      set: profile,
    });
    return true;
  } catch (error) {
    console.error("[Database] Failed to upsert user profile:", error);
    return false;
  }
}

/**
 * 获取用户画像
 */
export async function getUserProfile(userId: number): Promise<UserProfile | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user profile: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get user profile:", error);
    return undefined;
  }
}

/**
 * 添加体重记录
 */
export async function addWeightLog(log: InsertWeightLog): Promise<number | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add weight log: database not available");
    return undefined;
  }

  try {
    const result = await db.insert(weightLogs).values(log);
    return result[0].insertId;
  } catch (error) {
    console.error("[Database] Failed to add weight log:", error);
    return undefined;
  }
}

/**
 * 获取用户体重记录
 */
export async function getUserWeightLogs(userId: number, limit: number = 30): Promise<WeightLog[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get weight logs: database not available");
    return [];
  }

  try {
    const results = await db
      .select()
      .from(weightLogs)
      .where(eq(weightLogs.userId, userId))
      .orderBy(desc(weightLogs.loggedAt))
      .limit(limit);
    return results;
  } catch (error) {
    console.error("[Database] Failed to get weight logs:", error);
    return [];
  }
}

/**
 * 添加运动记录
 */
export async function addExerciseLog(log: InsertExerciseLog): Promise<number | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add exercise log: database not available");
    return undefined;
  }

  try {
    const result = await db.insert(exerciseLogs).values(log);
    return result[0].insertId;
  } catch (error) {
    console.error("[Database] Failed to add exercise log:", error);
    return undefined;
  }
}

/**
 * 获取用户运动记录
 */
export async function getUserExerciseLogs(
  userId: number,
  startDate?: Date,
  endDate?: Date
): Promise<ExerciseLog[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get exercise logs: database not available");
    return [];
  }

  try {
    const conditions = [eq(exerciseLogs.userId, userId)];
    
    if (startDate && endDate) {
      conditions.push(gte(exerciseLogs.loggedAt, startDate));
      conditions.push(lte(exerciseLogs.loggedAt, endDate));
    }

    const results = await db
      .select()
      .from(exerciseLogs)
      .where(and(...conditions))
      .orderBy(desc(exerciseLogs.loggedAt));
    return results;
  } catch (error) {
    console.error("[Database] Failed to get exercise logs:", error);
    return [];
  }
}

/**
 * 添加睡眠记录
 */
export async function addSleepLog(log: InsertSleepLog): Promise<number | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add sleep log: database not available");
    return undefined;
  }

  try {
    const result = await db.insert(sleepLogs).values(log);
    return result[0].insertId;
  } catch (error) {
    console.error("[Database] Failed to add sleep log:", error);
    return undefined;
  }
}

/**
 * 获取用户睡眠记录
 */
export async function getUserSleepLogs(
  userId: number,
  startDate?: Date,
  endDate?: Date
): Promise<SleepLog[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get sleep logs: database not available");
    return [];
  }

  try {
    const conditions = [eq(sleepLogs.userId, userId)];
    
    if (startDate && endDate) {
      conditions.push(gte(sleepLogs.loggedAt, startDate));
      conditions.push(lte(sleepLogs.loggedAt, endDate));
    }

    const results = await db
      .select()
      .from(sleepLogs)
      .where(and(...conditions))
      .orderBy(desc(sleepLogs.loggedAt));
    return results;
  } catch (error) {
    console.error("[Database] Failed to get sleep logs:", error);
    return [];
  }
}

/**
 * 添加收藏食物
 */
export async function addFavoriteFood(userId: number, foodId: number) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    // 检查是否已收藏
    const existing = await db.select().from(favoriteFoods)
      .where(and(eq(favoriteFoods.userId, userId), eq(favoriteFoods.foodId, foodId)))
      .limit(1);
    
    if (existing.length > 0) return existing[0];
    
    await db.insert(favoriteFoods).values({ userId, foodId });
    return { userId, foodId };
  } catch (error) {
    console.error("[Database] Failed to add favorite food:", error);
    return null;
  }
}

/**
 * 移除收藏食物
 */
export async function removeFavoriteFood(userId: number, foodId: number) {
  const db = await getDb();
  if (!db) return;
  
  try {
    await db.delete(favoriteFoods)
      .where(and(eq(favoriteFoods.userId, userId), eq(favoriteFoods.foodId, foodId)));
  } catch (error) {
    console.error("[Database] Failed to remove favorite food:", error);
  }
}

/**
 * 获取用户收藏的食物
 */
export async function getUserFavoriteFoods(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const favorites = await db.select()
      .from(favoriteFoods)
      .where(eq(favoriteFoods.userId, userId));
    
    // 获取食物详情
    const foodIds = favorites.map(f => f.foodId);
    if (foodIds.length === 0) return [];
    
    const foodDetails = await db.select().from(foods)
      .where(inArray(foods.id, foodIds));
    
    return foodDetails;
  } catch (error) {
    console.error("[Database] Failed to get favorite foods:", error);
    return [];
  }
}
