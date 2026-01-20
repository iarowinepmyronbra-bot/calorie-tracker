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
