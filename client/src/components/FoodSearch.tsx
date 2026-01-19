import { useState, useEffect } from "react";
import { Search, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { VoiceInput } from "./VoiceInput";
import { toast } from "sonner";

interface FoodSearchProps {
  onFoodAdded?: () => void;
}

export function FoodSearch({ onFoodAdded }: FoodSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [grams, setGrams] = useState("");

  const { data: searchResults, isLoading: isSearching } = trpc.foods.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  );

  const addFoodLog = trpc.foodLogs.add.useMutation({
    onSuccess: () => {
      toast.success("已添加到今日记录");
      setSelectedFood(null);
      setGrams("");
      setSearchQuery("");
      onFoodAdded?.();
    },
    onError: (error) => {
      toast.error("添加失败：" + error.message);
    },
  });

  const handleVoiceTranscript = (text: string) => {
    setSearchQuery(text);
  };

  const handleSelectFood = (food: any) => {
    setSelectedFood(food);
    // 默认设置为常见份量
    if (food.servingGrams) {
      setGrams(food.servingGrams.toString());
    }
  };

  const handleAddFood = () => {
    if (!selectedFood || !grams) {
      toast.error("请选择食物并输入克数");
      return;
    }

    const gramsNum = parseInt(grams);
    const calories = Math.round((selectedFood.caloriesPer100g * gramsNum) / 100);
    const protein = Math.round((selectedFood.proteinPer100g * gramsNum) / 100);
    const fat = Math.round((selectedFood.fatPer100g * gramsNum) / 100);
    const carbs = Math.round((selectedFood.carbsPer100g * gramsNum) / 100);

    addFoodLog.mutate({
      foodId: selectedFood.id,
      foodName: selectedFood.name,
      grams: gramsNum,
      calories,
      protein,
      fat,
      carbs,
    });
  };

  // 计算体重增长（3500卡路里 ≈ 1磅 ≈ 0.45公斤）
  const calculateWeightGain = (calories: number) => {
    const pounds = calories / 3500;
    const kg = pounds * 0.453592;
    return kg;
  };

  const currentCalories = selectedFood && grams
    ? Math.round((selectedFood.caloriesPer100g * parseInt(grams || "0")) / 100)
    : 0;

  const weightGain = calculateWeightGain(currentCalories);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>查询食物卡路里</CardTitle>
          <CardDescription>使用语音或输入搜索食物</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索食物，如：鸡胸肉、米饭..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <VoiceInput onTranscript={handleVoiceTranscript} />
          </div>

          {isSearching && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {searchResults && searchResults.length > 0 && (
            <div className="space-y-2">
              <Label>搜索结果</Label>
              <div className="grid gap-2">
                {searchResults.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => handleSelectFood(food)}
                    className={`flex items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-accent ${
                      selectedFood?.id === food.id ? "border-primary bg-accent" : ""
                    }`}
                  >
                    <div>
                      <div className="font-medium">{food.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {food.caloriesPer100g} 卡路里/100克
                        {food.servingSize && ` · ${food.servingSize}约${food.servingGrams}克`}
                      </div>
                    </div>
                    {selectedFood?.id === food.id && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {searchQuery && searchResults && searchResults.length === 0 && !isSearching && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              未找到相关食物
            </div>
          )}
        </CardContent>
      </Card>

      {selectedFood && (
        <Card>
          <CardHeader>
            <CardTitle>营养信息</CardTitle>
            <CardDescription>{selectedFood.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="grams">摄入克数</Label>
              <Input
                id="grams"
                type="number"
                placeholder="输入克数"
                value={grams}
                onChange={(e) => setGrams(e.target.value)}
                className="mt-1.5"
              />
            </div>

            {grams && parseInt(grams) > 0 && (
              <>
                <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted p-4">
                  <div>
                    <div className="text-sm text-muted-foreground">总卡路里</div>
                    <div className="text-2xl font-bold text-primary">{currentCalories}</div>
                    <div className="text-xs text-muted-foreground">千卡</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">预计增重</div>
                    <div className="text-2xl font-bold text-destructive">
                      {weightGain > 0.001 ? `+${weightGain.toFixed(3)}` : "<0.001"}
                    </div>
                    <div className="text-xs text-muted-foreground">公斤</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="rounded-lg bg-accent p-3">
                    <div className="text-xs text-muted-foreground">蛋白质</div>
                    <div className="text-lg font-semibold">
                      {Math.round((selectedFood.proteinPer100g * parseInt(grams)) / 100)}g
                    </div>
                  </div>
                  <div className="rounded-lg bg-accent p-3">
                    <div className="text-xs text-muted-foreground">脂肪</div>
                    <div className="text-lg font-semibold">
                      {Math.round((selectedFood.fatPer100g * parseInt(grams)) / 100)}g
                    </div>
                  </div>
                  <div className="rounded-lg bg-accent p-3">
                    <div className="text-xs text-muted-foreground">碳水</div>
                    <div className="text-lg font-semibold">
                      {Math.round((selectedFood.carbsPer100g * parseInt(grams)) / 100)}g
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleAddFood}
                  disabled={addFoodLog.isPending}
                  className="w-full"
                  size="lg"
                >
                  {addFoodLog.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      添加中...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      添加到今日记录
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
