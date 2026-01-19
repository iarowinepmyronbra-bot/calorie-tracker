import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 食物数据库表 - 存储常见食物的营养信息
 */
export const foods = mysqlTable("foods", {
  id: int("id").autoincrement().primaryKey(),
  /** 食物名称（中文） */
  name: varchar("name", { length: 255 }).notNull(),
  /** 每100克的卡路里 */
  caloriesPer100g: int("caloriesPer100g").notNull(),
  /** 每100克的蛋白质（克） */
  proteinPer100g: int("proteinPer100g").default(0),
  /** 每100克的脂肪（克） */
  fatPer100g: int("fatPer100g").default(0),
  /** 每100克的碳水化合物（克） */
  carbsPer100g: int("carbsPer100g").default(0),
  /** 常见份量描述，如"一碗"、"一个"等 */
  servingSize: varchar("servingSize", { length: 100 }),
  /** 常见份量的克数 */
  servingGrams: int("servingGrams"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Food = typeof foods.$inferSelect;
export type InsertFood = typeof foods.$inferInsert;

/**
 * 饮食记录表 - 记录用户每次摄入的食物
 */
export const foodLogs = mysqlTable("foodLogs", {
  id: int("id").autoincrement().primaryKey(),
  /** 关联用户ID */
  userId: int("userId").notNull(),
  /** 关联食物ID */
  foodId: int("foodId").notNull(),
  /** 食物名称（冗余存储，防止食物表变更） */
  foodName: varchar("foodName", { length: 255 }).notNull(),
  /** 摄入的克数 */
  grams: int("grams").notNull(),
  /** 摄入的卡路里（计算后存储） */
  calories: int("calories").notNull(),
  /** 摄入的蛋白质（克） */
  protein: int("protein").default(0),
  /** 摄入的脂肪（克） */
  fat: int("fat").default(0),
  /** 摄入的碳水化合物（克） */
  carbs: int("carbs").default(0),
  /** 记录时间 */
  loggedAt: timestamp("loggedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FoodLog = typeof foodLogs.$inferSelect;
export type InsertFoodLog = typeof foodLogs.$inferInsert;

/**
 * 用户画像表 - 存储用户的个人信息和目标
 */
export const userProfiles = mysqlTable("userProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  /** 性别 */
  gender: mysqlEnum("gender", ["male", "female"]).notNull(),
  /** 年龄 */
  age: int("age").notNull(),
  /** 身高（厘米） */
  height: int("height").notNull(),
  /** 初始体重（公斤） */
  initialWeight: int("initialWeight").notNull(),
  /** 目标体重（公斤） */
  targetWeight: int("targetWeight").notNull(),
  /** 活动水平 */
  activityLevel: mysqlEnum("activityLevel", ["sedentary", "light", "moderate", "active", "very_active"]).notNull(),
  /** 基础代谢率 BMR */
  bmr: int("bmr").notNull(),
  /** 每日总消耗 TDEE */
  tdee: int("tdee").notNull(),
  /** 每日卡路里目标 */
  dailyCalorieTarget: int("dailyCalorieTarget").notNull(),
  /** 餐次设置（JSON） */
  mealSettings: text("mealSettings"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

/**
 * 体重记录表 - 记录用户每日体重
 */
export const weightLogs = mysqlTable("weightLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** 体重（公斤） */
  weight: int("weight").notNull(),
  /** BMI指数 */
  bmi: int("bmi"),
  /** 记录日期 */
  loggedAt: timestamp("loggedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WeightLog = typeof weightLogs.$inferSelect;
export type InsertWeightLog = typeof weightLogs.$inferInsert;

/**
 * 运动记录表 - 记录用户运动
 */
export const exerciseLogs = mysqlTable("exerciseLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** 运动类型 */
  exerciseType: varchar("exerciseType", { length: 100 }).notNull(),
  /** 时长（分钟） */
  duration: int("duration").notNull(),
  /** 消耗卡路里 */
  caloriesBurned: int("caloriesBurned").notNull(),
  /** 距离（公里），可选 */
  distance: int("distance"),
  /** 备注 */
  notes: text("notes"),
  /** 记录时间 */
  loggedAt: timestamp("loggedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ExerciseLog = typeof exerciseLogs.$inferSelect;
export type InsertExerciseLog = typeof exerciseLogs.$inferInsert;

/**
 * 睡眠记录表 - 记录用户睡眠
 */
export const sleepLogs = mysqlTable("sleepLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** 入睡时间 */
  bedTime: timestamp("bedTime").notNull(),
  /** 起床时间 */
  wakeTime: timestamp("wakeTime").notNull(),
  /** 睡眠时长（小时） */
  duration: int("duration").notNull(),
  /** 睡眠质量（1-5分） */
  quality: int("quality"),
  /** 备注 */
  notes: text("notes"),
  /** 记录日期 */
  loggedAt: timestamp("loggedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SleepLog = typeof sleepLogs.$inferSelect;
export type InsertSleepLog = typeof sleepLogs.$inferInsert;

/**
 * GPS运动追踪记录表
 */
export const gpsExerciseLogs = mysqlTable("gps_exercise_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  exerciseType: varchar("exerciseType", { length: 50 }).notNull(), // running, cycling, walking
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime").notNull(),
  duration: int("duration").notNull(), // 秒
  distance: int("distance").notNull(), // 米
  avgSpeed: int("avgSpeed"), // m/s * 100
  maxSpeed: int("maxSpeed"), // m/s * 100
  calories: int("calories").notNull(),
  routeData: text("routeData"), // JSON格式存储路线点
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GpsExerciseLog = typeof gpsExerciseLogs.$inferSelect;
export type InsertGpsExerciseLog = typeof gpsExerciseLogs.$inferInsert;

/**
 * 打卡记录表
 */
export const checkIns = mysqlTable("check_ins", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: timestamp("date").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // diet, exercise, sleep, weight
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CheckIn = typeof checkIns.$inferSelect;
export type InsertCheckIn = typeof checkIns.$inferInsert;

/**
 * 成就徽章表
 */
export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // consecutive_checkin, weight_goal, exercise_milestone
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;