import { invokeLLM, type Message } from "./llm";

interface FoodRecognitionResult {
  success: boolean;
  foods: Array<{
    name: string;
    confidence: number;
    estimatedGrams: number;
  }>;
  error?: string;
}

/**
 * 使用AI视觉识别图片中的食物
 * @param imageUrl 图片的公开URL
 * @returns 识别结果
 */
export async function recognizeFood(imageUrl: string): Promise<FoodRecognitionResult> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `你是一个专业的食物识别助手。请识别图片中的所有食物，并以JSON格式返回结果。
要求：
1. 识别所有可见的食物
2. 估算每种食物的大致重量（克）
3. 给出识别的置信度（0-1之间）
4. 使用中文食物名称

返回格式示例：
{
  "foods": [
    {"name": "米饭", "confidence": 0.95, "estimatedGrams": 200},
    {"name": "鸡胸肉", "confidence": 0.90, "estimatedGrams": 150}
  ]
}`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "请识别这张图片中的食物",
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high",
              },
            },
          ],
        } as Message,
      ] as Message[],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "food_recognition",
          strict: true,
          schema: {
            type: "object",
            properties: {
              foods: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                      description: "食物的中文名称",
                    },
                    confidence: {
                      type: "number",
                      description: "识别置信度，0-1之间",
                    },
                    estimatedGrams: {
                      type: "number",
                      description: "估算的重量（克）",
                    },
                  },
                  required: ["name", "confidence", "estimatedGrams"],
                  additionalProperties: false,
                },
              },
            },
            required: ["foods"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return {
        success: false,
        foods: [],
        error: "AI未返回识别结果",
      };
    }

    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const result = JSON.parse(contentStr);
    return {
      success: true,
      foods: result.foods,
    };
  } catch (error: any) {
    console.error("食物识别失败:", error);
    return {
      success: false,
      foods: [],
      error: error.message || "识别失败",
    };
  }
}

/**
 * 分析食物并提供建议
 * @param foodName 食物名称
 * @param calories 卡路里
 * @param userDailyTarget 用户每日目标卡路里
 * @param todayConsumed 今日已摄入卡路里
 * @returns 分析结果
 */
export async function analyzeFoodAdvice(
  foodName: string,
  calories: number,
  userDailyTarget: number,
  todayConsumed: number
): Promise<string> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `你是一个专业的营养师。请分析用户想要食用的食物，并提供建议。

分析要点：
1. 是否建议食用（基于用户的每日目标和已摄入量）
2. 食物的营养价值和优缺点
3. 如果不适合，推荐更健康的替代品
4. 最佳食用时间建议

请用简洁、友好的语气回复，不超过150字。`,
        },
        {
          role: "user",
          content: `食物：${foodName}
热量：${calories}卡
我的每日目标：${userDailyTarget}卡
今日已摄入：${todayConsumed}卡
剩余额度：${userDailyTarget - todayConsumed}卡

请给我建议。`,
        } as Message,
      ],
    });

    const content = response.choices[0]?.message?.content;
    return (typeof content === 'string' ? content : JSON.stringify(content)) || "暂无建议";
  } catch (error) {
    console.error("食物分析失败:", error);
    return "分析失败，请稍后重试";
  }
}
