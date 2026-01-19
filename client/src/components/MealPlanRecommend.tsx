import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ChefHat, Sparkles } from "lucide-react";
import { Streamdown } from "streamdown";

export function MealPlanRecommend() {
  const [preferences, setPreferences] = useState("");
  const [recommendation, setRecommendation] = useState("");

  const { data: profile } = trpc.userProfile.get.useQuery();

  const recommendMutation = trpc.mealPlan.recommend.useMutation({
    onSuccess: (data) => {
      setRecommendation(typeof data.recommendation === 'string' ? data.recommendation : '');
      toast.success("食谱推荐已生成");
    },
    onError: (error: any) => {
      toast.error("生成失败: " + error.message);
    },
  });

  const handleRecommend = () => {
    if (!profile) {
      toast.error("请先完成用户画像设置");
      return;
    }

    recommendMutation.mutate({
      targetCalories: profile.dailyCalorieTarget,
      preferences: preferences || undefined,
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            每日食谱推荐
          </CardTitle>
          <CardDescription>
            AI为您量身定制健康饮食计划
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 输入区域 */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
              <div className="space-y-2">
                <Label>饮食偏好（可选）</Label>
                <Input
                  placeholder="例如：不吃辣、素食、低碳水..."
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                />
              </div>
              <Button
                onClick={handleRecommend}
                disabled={recommendMutation.isPending}
                className="w-full"
              >
                {recommendMutation.isPending ? (
                  "生成中..."
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    生成今日食谱
                  </>
                )}
              </Button>
            </div>

            {/* 推荐结果 */}
            {recommendation && (
              <div className="p-4 border rounded-lg bg-card">
                <Streamdown>{recommendation}</Streamdown>
              </div>
            )}

            {!recommendation && !recommendMutation.isPending && (
              <div className="text-center py-12 text-muted-foreground">
                <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>点击上方按钮生成今日食谱</p>
                <p className="text-sm mt-2">AI会根据您的个人信息和目标定制专属饮食计划</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
