import { drizzle } from "drizzle-orm/mysql2";
import { foods } from "./drizzle/schema.ts";
import "dotenv/config";

const db = drizzle(process.env.DATABASE_URL);

const commonFoods = [
  // 主食类
  { name: "米饭", caloriesPer100g: 116, proteinPer100g: 3, fatPer100g: 0, carbsPer100g: 26, servingSize: "一碗", servingGrams: 150 },
  { name: "白米饭", caloriesPer100g: 116, proteinPer100g: 3, fatPer100g: 0, carbsPer100g: 26, servingSize: "一碗", servingGrams: 150 },
  { name: "面条", caloriesPer100g: 137, proteinPer100g: 5, fatPer100g: 1, carbsPer100g: 28, servingSize: "一碗", servingGrams: 200 },
  { name: "馒头", caloriesPer100g: 221, proteinPer100g: 7, fatPer100g: 1, carbsPer100g: 47, servingSize: "一个", servingGrams: 100 },
  { name: "面包", caloriesPer100g: 265, proteinPer100g: 9, fatPer100g: 3, carbsPer100g: 50, servingSize: "一片", servingGrams: 40 },
  { name: "包子", caloriesPer100g: 227, proteinPer100g: 7, fatPer100g: 3, carbsPer100g: 44, servingSize: "一个", servingGrams: 80 },
  
  // 肉类
  { name: "鸡胸肉", caloriesPer100g: 165, proteinPer100g: 31, fatPer100g: 4, carbsPer100g: 0, servingSize: "一块", servingGrams: 150 },
  { name: "猪肉", caloriesPer100g: 242, proteinPer100g: 17, fatPer100g: 19, carbsPer100g: 0, servingSize: "一份", servingGrams: 100 },
  { name: "牛肉", caloriesPer100g: 250, proteinPer100g: 26, fatPer100g: 15, carbsPer100g: 0, servingSize: "一份", servingGrams: 100 },
  { name: "羊肉", caloriesPer100g: 203, proteinPer100g: 19, fatPer100g: 14, carbsPer100g: 0, servingSize: "一份", servingGrams: 100 },
  { name: "鱼肉", caloriesPer100g: 206, proteinPer100g: 22, fatPer100g: 13, carbsPer100g: 0, servingSize: "一条", servingGrams: 200 },
  
  // 蛋类
  { name: "鸡蛋", caloriesPer100g: 147, proteinPer100g: 13, fatPer100g: 10, carbsPer100g: 1, servingSize: "一个", servingGrams: 50 },
  { name: "煮鸡蛋", caloriesPer100g: 155, proteinPer100g: 13, fatPer100g: 11, carbsPer100g: 1, servingSize: "一个", servingGrams: 50 },
  
  // 蔬菜类
  { name: "西兰花", caloriesPer100g: 34, proteinPer100g: 3, fatPer100g: 0, carbsPer100g: 7, servingSize: "一份", servingGrams: 100 },
  { name: "番茄", caloriesPer100g: 18, proteinPer100g: 1, fatPer100g: 0, carbsPer100g: 4, servingSize: "一个", servingGrams: 150 },
  { name: "黄瓜", caloriesPer100g: 15, proteinPer100g: 1, fatPer100g: 0, carbsPer100g: 3, servingSize: "一根", servingGrams: 100 },
  { name: "白菜", caloriesPer100g: 13, proteinPer100g: 1, fatPer100g: 0, carbsPer100g: 2, servingSize: "一份", servingGrams: 100 },
  { name: "菠菜", caloriesPer100g: 23, proteinPer100g: 3, fatPer100g: 0, carbsPer100g: 4, servingSize: "一份", servingGrams: 100 },
  { name: "胡萝卜", caloriesPer100g: 41, proteinPer100g: 1, fatPer100g: 0, carbsPer100g: 10, servingSize: "一根", servingGrams: 100 },
  
  // 水果类
  { name: "苹果", caloriesPer100g: 52, proteinPer100g: 0, fatPer100g: 0, carbsPer100g: 14, servingSize: "一个", servingGrams: 150 },
  { name: "香蕉", caloriesPer100g: 89, proteinPer100g: 1, fatPer100g: 0, carbsPer100g: 23, servingSize: "一根", servingGrams: 120 },
  { name: "橙子", caloriesPer100g: 47, proteinPer100g: 1, fatPer100g: 0, carbsPer100g: 12, servingSize: "一个", servingGrams: 130 },
  { name: "西瓜", caloriesPer100g: 30, proteinPer100g: 1, fatPer100g: 0, carbsPer100g: 8, servingSize: "一块", servingGrams: 200 },
  { name: "葡萄", caloriesPer100g: 69, proteinPer100g: 1, fatPer100g: 0, carbsPer100g: 18, servingSize: "一串", servingGrams: 100 },
  
  // 奶制品
  { name: "牛奶", caloriesPer100g: 61, proteinPer100g: 3, fatPer100g: 3, carbsPer100g: 5, servingSize: "一杯", servingGrams: 250 },
  { name: "酸奶", caloriesPer100g: 61, proteinPer100g: 3, fatPer100g: 3, carbsPer100g: 5, servingSize: "一杯", servingGrams: 200 },
  
  // 零食类
  { name: "薯片", caloriesPer100g: 536, proteinPer100g: 7, fatPer100g: 35, carbsPer100g: 50, servingSize: "一包", servingGrams: 50 },
  { name: "巧克力", caloriesPer100g: 546, proteinPer100g: 5, fatPer100g: 31, carbsPer100g: 61, servingSize: "一块", servingGrams: 40 },
  { name: "饼干", caloriesPer100g: 435, proteinPer100g: 7, fatPer100g: 14, carbsPer100g: 71, servingSize: "一包", servingGrams: 50 },
  
  // 饮料类
  { name: "可乐", caloriesPer100g: 43, proteinPer100g: 0, fatPer100g: 0, carbsPer100g: 11, servingSize: "一罐", servingGrams: 330 },
  { name: "橙汁", caloriesPer100g: 45, proteinPer100g: 1, fatPer100g: 0, carbsPer100g: 11, servingSize: "一杯", servingGrams: 250 },
  
  // 快餐类
  { name: "汉堡", caloriesPer100g: 295, proteinPer100g: 17, fatPer100g: 14, carbsPer100g: 25, servingSize: "一个", servingGrams: 200 },
  { name: "披萨", caloriesPer100g: 266, proteinPer100g: 11, fatPer100g: 10, carbsPer100g: 33, servingSize: "一片", servingGrams: 120 },
  { name: "炸鸡", caloriesPer100g: 290, proteinPer100g: 18, fatPer100g: 18, carbsPer100g: 15, servingSize: "一块", servingGrams: 100 },
];

async function seedFoods() {
  try {
    console.log("开始初始化食物数据库...");
    
    for (const food of commonFoods) {
      await db.insert(foods).values(food);
      console.log(`✓ 已添加: ${food.name}`);
    }
    
    console.log(`\n✅ 成功添加 ${commonFoods.length} 种食物到数据库`);
    process.exit(0);
  } catch (error) {
    console.error("❌ 初始化失败:", error);
    process.exit(1);
  }
}

seedFoods();
