/**
 * 计算基础代谢率 (BMR) - 使用Mifflin-St Jeor公式
 * 
 * @param gender 性别 ('male' | 'female')
 * @param age 年龄
 * @param height 身高(cm)
 * @param weight 体重(kg)
 * @returns BMR (卡路里/天)
 */
export function calculateBMR(
  gender: "male" | "female",
  age: number,
  height: number,
  weight: number
): number {
  if (gender === "male") {
    // 男性: BMR = 10 × 体重(kg) + 6.25 × 身高(cm) - 5 × 年龄 + 5
    return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
  } else {
    // 女性: BMR = 10 × 体重(kg) + 6.25 × 身高(cm) - 5 × 年龄 - 161
    return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
  }
}

/**
 * 活动系数映射
 */
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2, // 久坐（很少或不运动）
  light: 1.375, // 轻度活动（每周运动1-3天）
  moderate: 1.55, // 中度活动（每周运动3-5天）
  active: 1.725, // 高度活动（每周运动6-7天）
  very_active: 1.9, // 非常活跃（每天运动，体力劳动）
};

/**
 * 计算每日总消耗 (TDEE)
 * 
 * @param bmr 基础代谢率
 * @param activityLevel 活动水平
 * @returns TDEE (卡路里/天)
 */
export function calculateTDEE(
  bmr: number,
  activityLevel: keyof typeof ACTIVITY_MULTIPLIERS
): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel];
  return Math.round(bmr * multiplier);
}

/**
 * 计算每日卡路里目标
 * 
 * @param tdee 每日总消耗
 * @param currentWeight 当前体重(kg)
 * @param targetWeight 目标体重(kg)
 * @returns 每日卡路里目标
 */
export function calculateDailyCalorieTarget(
  tdee: number,
  currentWeight: number,
  targetWeight: number
): number {
  if (currentWeight > targetWeight) {
    // 减肥：每天减少500卡（约每周减0.5kg）
    return Math.max(tdee - 500, 1200); // 最低不低于1200卡
  } else if (currentWeight < targetWeight) {
    // 增重：每天增加500卡
    return tdee + 500;
  } else {
    // 维持体重
    return tdee;
  }
}

/**
 * 计算BMI指数
 * 
 * @param weight 体重(kg)
 * @param height 身高(cm)
 * @returns BMI指数
 */
export function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100;
  return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
}

/**
 * 根据BMI判断体重状态
 */
export function getBMIStatus(bmi: number): string {
  if (bmi < 18.5) return "偏瘦";
  if (bmi < 24) return "正常";
  if (bmi < 28) return "偏胖";
  return "肥胖";
}

/**
 * 计算预计达成目标的天数
 * 
 * @param currentWeight 当前体重(kg)
 * @param targetWeight 目标体重(kg)
 * @param dailyCalorieDeficit 每日卡路里赤字
 * @returns 预计天数
 */
export function calculateDaysToGoal(
  currentWeight: number,
  targetWeight: number,
  dailyCalorieDeficit: number
): number {
  const weightDiff = Math.abs(currentWeight - targetWeight);
  // 7700卡路里 ≈ 1公斤脂肪
  const totalCaloriesNeeded = weightDiff * 7700;
  const days = Math.ceil(totalCaloriesNeeded / Math.abs(dailyCalorieDeficit));
  return days;
}

/**
 * 计算体重变化（基于卡路里）
 * 
 * @param calories 净卡路里（摄入 - 消耗）
 * @returns 体重变化(kg)，正数表示增重，负数表示减重
 */
export function calculateWeightChange(calories: number): number {
  // 7700卡路里 ≈ 1公斤脂肪
  return calories / 7700;
}

/**
 * 计算运动消耗卡路里
 * 
 * @param exerciseType 运动类型
 * @param duration 时长(分钟)
 * @param weight 体重(kg)
 * @returns 消耗卡路里
 */
export function calculateExerciseCalories(
  exerciseType: string,
  duration: number,
  weight: number
): number {
  // MET值（代谢当量）
  const MET_VALUES: { [key: string]: number } = {
    "跑步": 8.0,
    "快走": 4.5,
    "慢走": 3.5,
    "游泳": 7.0,
    "骑行": 6.0,
    "瑜伽": 3.0,
    "力量训练": 5.0,
    "跳绳": 10.0,
    "爬楼梯": 8.0,
    "打篮球": 6.5,
    "打羽毛球": 5.5,
    "跳舞": 4.5,
  };

  const met = MET_VALUES[exerciseType] || 5.0; // 默认5.0
  // 卡路里 = MET × 体重(kg) × 时间(小时)
  const hours = duration / 60;
  return Math.round(met * weight * hours);
}
