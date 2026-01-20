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

// 1. 必须声明 _db 变量
let _db: any = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const connectionString = process.env.DATABASE_URL;
      // 2. 适配 TiDB Cloud SSL 连接
      _db = drizzle({
        connection: {
          uri: connectionString,
          ssl: {
            minVersion: 'TLSv1.2',
            rejectUnauthorized: true
          }
        }
      });
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// --- 以下是保持原样或修复后的导出函数，确保它们都存在 ---

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    textFields.forEach(field => {
      if (user[field] !== undefined) {
        values[field] = user[field] ?? null;
        updateSet[field] = user[field] ?? null;
      }
    });
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error(error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ... (其他函数如 searchFoods, addFoodLog 等请确保在文件中保留，不要删除)
