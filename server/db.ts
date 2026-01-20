import { connect } from '@tidbcloud/serverless';
import { drizzle } from 'drizzle-orm/tidb-serverless';
import { mysqlTable, serial, varchar, timestamp, text } from 'drizzle-orm/mysql-core';
import { eq } from 'drizzle-orm';

// 1. 定义用户表结构 (Schema)
// 这里的字段必须和你数据库里真实的字段对应
export const users = mysqlTable('users', {
  id: serial('id').primaryKey(),
  openId: varchar('open_id', { length: 255 }).unique().notNull(), // 对应 openId
  name: varchar('name', { length: 255 }),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// 2. 初始化数据库连接 (修复 "找不到名称 _db" 的错误)
const client = connect({ url: process.env.DATABASE_URL });
export const _db = drizzle(client);

// 3. 导出查询函数 (修复 sdk.ts "不存在属性 getUserByOpenId" 的错误)
export async function getUserByOpenId(openId: string) {
  const result = await _db.select().from(users).where(eq(users.openId, openId));
  return result[0] || null;
}

// 4. 导出更新/插入函数 (修复 sdk.ts "不存在属性 upsertUser" 的错误)
export async function upsertUser(userData: { openId: string; name?: string; avatarUrl?: string }) {
  const existing = await getUserByOpenId(userData.openId);
  
  if (existing) {
    // 如果存在，更新信息
    await _db.update(users)
      .set({ 
        name: userData.name, 
        avatarUrl: userData.avatarUrl,
        updatedAt: new Date()
      })
      .where(eq(users.openId, userData.openId));
    return existing;
  } else {
    // 如果不存在，插入新用户
    await _db.insert(users).values({
      openId: userData.openId,
      name: userData.name,
      avatarUrl: userData.avatarUrl
    });
    return await getUserByOpenId(userData.openId);
  }
}
