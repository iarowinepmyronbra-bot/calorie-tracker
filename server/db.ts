import { connect } from '@tidbcloud/serverless';
import { drizzle } from 'drizzle-orm/tidb-serverless';
import { eq, sql, desc, and, gte, lte } from 'drizzle-orm';
import * as schema from "../drizzle/schema";

const client = connect({ url: process.env.DATABASE_URL });
export const _db = drizzle(client, { schema });

export async function getDb() {
  return _db;
}

export async function getUserByOpenId(openId: string) {
  const result = await _db.select().from(schema.users).where(eq(schema.users.openId, openId));
  return result[0] || null;
}

export async function upsertUser(userData: any) {
  const existing = await getUserByOpenId(userData.openId);
  if (existing) {
    await _db.update(schema.users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(schema.users.openId, userData.openId));
  } else {
    await _db.insert(schema.users).values(userData);
  }
  return await getUserByOpenId(userData.openId);
}

export async function getUserProfile(userId: number) {
  const result = await _db.select().from(schema.userProfiles).where(eq(schema.userProfiles.userId, userId));
  return result[0] || null;
}

export async function upsertUserProfile(profile: any) {
  const existing = await getUserProfile(profile.userId);
  if (existing) {
    await _db.update(schema.userProfiles).set(profile).where(eq(schema.userProfiles.userId, profile.userId));
  } else {
    await _db.insert(schema.userProfiles).values(profile);
  }
}

export async function searchFoods(query: string) {
  return await _db.select().from(schema.foods).where(sql`${schema.foods.name} LIKE ${'%' + query + '%'}`).limit(20);
}

export async function getFoodById(id: number) {
  const result = await _db.select().from(schema.foods).where(eq(schema.foods.id, id));
  return result[0] || null;
}

export async function addFoodLog(log: any) {
  return await _db.insert(schema.foodLogs).values(log);
}

export async function getUserFoodLogs(userId: number) {
  return await _db.select().from(schema.foodLogs).where(eq(schema.foodLogs.userId, userId)).orderBy(desc(schema.foodLogs.date));
}

export async function deleteFoodLog(id: number, userId: number) {
  await _db.delete(schema.foodLogs).where(and(eq(schema.foodLogs.id, id), eq(schema.foodLogs.userId, userId)));
}

export async function getDailyStats(userId: number, date: string) {
  const logs = await _db.select().from(schema.foodLogs).where(and(eq(schema.foodLogs.userId, userId), eq(schema.foodLogs.date, date)));
  return logs;
}

export async function addWeightLog(log: any) {
  return await _db.insert(schema.weightLogs).values(log);
}

export async function getUserWeightLogs(userId: number) {
  return await _db.select().from(schema.weightLogs).where(eq(schema.weightLogs.userId, userId)).orderBy(desc(schema.weightLogs.date));
}

export async function addExerciseLog(log: any) {
  return await _db.insert(schema.exerciseLogs).values(log);
}

export async function getUserExerciseLogs(userId: number) {
  return await _db.select().from(schema.exerciseLogs).where(eq(schema.exerciseLogs.userId, userId)).orderBy(desc(schema.exerciseLogs.date));
}

export async function addSleepLog(log: any) {
  return await _db.insert(schema.sleepLogs).values(log);
}

export async function getUserSleepLogs(userId: number) {
  return await _db.select().from(schema.sleepLogs).where(eq(schema.sleepLogs.userId, userId)).orderBy(desc(schema.sleepLogs.date));
}

export async function addFavoriteFood(fav: any) {
  return await _db.insert(schema.favoriteFoods).values(fav);
}

export async function removeFavoriteFood(userId: number, foodId: number) {
  await _db.delete(schema.favoriteFoods).where(and(eq(schema.favoriteFoods.userId, userId), eq(schema.favoriteFoods.foodId, foodId)));
}
import { connect } from '@tidbcloud/serverless';
import { drizzle } from 'drizzle-orm/tidb-serverless';
import { eq, sql } from 'drizzle-orm';
import * as schema from "../drizzle/schema";

const client = connect({ url: process.env.DATABASE_URL });
export const _db = drizzle(client, { schema });

export async function getDb() {
  return _db;
}

export async function getUserByOpenId(openId: string) {
  const result = await _db.select().from(schema.users).where(eq(schema.users.openId, openId));
  return result[0] || null;
}

export async function upsertUser(userData: any) {
  const existing = await getUserByOpenId(userData.openId);
  if (existing) {
    await _db.update(schema.users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(schema.users.openId, userData.openId));
  } else {
    await _db.insert(schema.users).values(userData);
  }
  return await getUserByOpenId(userData.openId);
}

export async function searchFoods(query: string) {
  const db = await getDb();
  return await db.select().from(schema.foods).where(sql`${schema.foods.name} LIKE ${'%' + query + '%'}`).limit(20);
}

export async function addFoodLog(log: any) {
  const db = await getDb();
  return await db.insert(schema.foodLogs).values(log);
}
import { connect } from '@tidbcloud/serverless';
import { drizzle } from 'drizzle-orm/tidb-serverless';
import { eq, sql } from 'drizzle-orm';
// 导入项目原有的所有表定义，确保其他功能不崩溃
import * as schema from "../drizzle/schema";

// 1. 初始化连接
const client = connect({ url: process.env.DATABASE_URL });
export const _db = drizzle(client, { schema });

// 2. 修复 getUserByOpenId
export async function getUserByOpenId(openId: string) {
  const result = await _db.select().from(schema.users).where(eq(schema.users.openId, openId));
  return result[0] || null;
}

// 3. 修复 upsertUser
export async function upsertUser(userData: any) {
  const existing = await getUserByOpenId(userData.openId);
  if (existing) {
    await _db.update(schema.users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(schema.users.openId, userData.openId));
  } else {
    await _db.insert(schema.users).values(userData);
  }
  return await getUserByOpenId(userData.openId);
}

// 4. 导出 getDb 兼容旧代码
export async function getDb() {
  return _db;
}
import { connect } from '@tidbcloud/serverless';
import { drizzle } from 'drizzle-orm/tidb-serverless';
import { eq, sql } from 'drizzle-orm';
// 导入项目原有的所有表定义，确保其他功能不崩溃
import * as schema from "../drizzle/schema";

// 1. 初始化连接
const client = connect({ url: process.env.DATABASE_URL });
export const _db = drizzle(client, { schema });

// 2. 修复 getUserByOpenId
export async function getUserByOpenId(openId: string) {
  const result = await _db.select().from(schema.users).where(eq(schema.users.openId, openId));
  return result[0] || null;
}

// 3. 修复 upsertUser
export async function upsertUser(userData: any) {
  const existing = await getUserByOpenId(userData.openId);
  if (existing) {
    await _db.update(schema.users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(schema.users.openId, userData.openId));
  } else {
    await _db.insert(schema.users).values(userData);
  }
  return await getUserByOpenId(userData.openId);
}

// 4. 导出 getDb 兼容旧代码
export async function getDb() {
  return _db;
}
