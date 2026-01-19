import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Mic, Search, Plus, Loader2, Camera } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

interface FoodSearchProps {
  onFoodAdded?: () => void;
}

export function FoodSearch({ onFoodAdded }: FoodSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [grams, setGrams] = useState("100");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: searchResults, isLoading: isSearching } = trpc.foods.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  );

  const addFoodLog = trpc.foodLogs.add.useMutation({
    onSuccess: () => {
      toast.success("已添加到今日饮食记录");
      setIsDialogOpen(false);
      setSelectedFood(null);
      setGrams("100");
      setSearchQuery("");
      onFoodAdded?.();
    },
    onError: (error) => {
      toast.error("添加失败：" + error.message);
    },
  });

  const { isListening, transcript, startListening, stopListening, browserSupported } = useSpeechRecognition({
    onResult: (text) => {
      setSearchQuery(text);
      toast.success(`识别到：${text}`);
    },
    onError: (error) => {
      toast.error("语音识别失败：" + error);
    },
  });

  const handleSelectFood = (food: any) => {
    setSelectedFood(food);
    setIsDialogOpen(true);
  };

  const handleAddFood = () => {
    if (!selectedFood) return;

    const gramsNum = parseInt(grams);
    if (isNaN(gramsNum) || gramsNum <= 0) {
      toast.error("请输入有效的克数");
      return;
    }

    const ratio = gramsNum / 100;
    addFoodLog.mutate({
      foodId: selectedFood.id,
      foodName: selectedFood.name,
      grams: gramsNum,
      calories: Math.round(selectedFood.caloriesPer100g * ratio),
      protein: Math.round(selectedFood.proteinPer100g * ratio),
      fat: Math.round(selectedFood.fatPer100g * ratio),
      carbs: Math.round(selectedFood.carbsPer100g * ratio),
    });
  };

  const handleVoiceButtonPress = () => {
    if (isListening) {
      stopListening();
    } else {
      if (!browserSupported) {
        toast.error("您的浏览器不支持语音识别");
        return;
      }
      startListening();
    }
  };

  const handleCameraClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setSelectedImage(file);
        analyzeImage(file);
      }
    };
    input.click();
  };

  const recognizeMutation = trpc.foodVision.recognize.useMutation();

  const analyzeImage = async (file: File) => {
    setIsAnalyzing(true);
    toast.info("正在识别食物...");
    
    try {
      // 读取文件为base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageBase64 = e.target?.result as string;
        
        try {
          const result = await recognizeMutation.mutateAsync({ imageBase64 });
          
          if (result.success && result.foods.length > 0) {
            const topFood = result.foods[0];
            toast.success(`识别到: ${topFood.name}`);
            setSearchQuery(topFood.name);
          } else {
            toast.error(result.error || "未识别到食物");
          }
        } catch (error: any) {
          toast.error("识别失败: " + (error.message || "请稍后重试"));
        } finally {
          setIsAnalyzing(false);
        }
      };
      
      reader.onerror = () => {
        toast.error("读取图片失败");
        setIsAnalyzing(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error: any) {
      toast.error("识别失败: " + (error.message || "请稍后重试"));
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      <Card>
        <CardHeader>
          <CardTitle>查询食物卡路里</CardTitle>
          <CardDescription>搜索食物或使用底部语音输入</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索食物，如：鸡胸肉、米饭..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Search Results */}
          {isSearching && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {searchResults && searchResults.length > 0 && (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {searchResults.map((food) => (
                <div
                  key={food.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => handleSelectFood(food)}
                >
                  <div>
                    <div className="font-medium">{food.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {food.caloriesPer100g}卡/100g · 蛋白{food.proteinPer100g}g · 脂肪{food.fatPer100g}g · 碳水{food.carbsPer100g}g
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {searchQuery && searchResults && searchResults.length === 0 && !isSearching && (
            <div className="text-center py-8 text-muted-foreground">未找到相关食物</div>
          )}
        </CardContent>
      </Card>

      {/* Bottom Action Buttons - Fixed at Bottom */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6">
        {/* Camera Button */}
        <Button
          size="lg"
          className={`rounded-full h-16 w-16 shadow-2xl transition-all ${
            isAnalyzing ? "bg-primary/50 scale-110" : "bg-card hover:bg-card/80 border-2 border-primary/30"
          }`}
          onClick={handleCameraClick}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Camera className="h-6 w-6" />
          )}
        </Button>

        {/* Voice Input Button */}
        <Button
          size="lg"
          className={`rounded-full h-16 w-16 shadow-2xl transition-all ${
            isListening ? "bg-destructive hover:bg-destructive/90 scale-110" : "bg-primary hover:bg-primary/90"
          }`}
          onClick={handleVoiceButtonPress}
        >
          <Mic className={`h-6 w-6 ${isListening ? "animate-pulse" : ""}`} />
        </Button>

        {/* Status Tooltip */}
        {(isListening || isAnalyzing) && (
          <div className="absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap bg-card px-4 py-2 rounded-lg shadow-lg border">
            <div className="text-sm font-medium">
              {isListening ? "正在听..." : "正在识别..."}
            </div>
            {transcript && <div className="text-xs text-muted-foreground mt-1">{transcript}</div>}
          </div>
        )}
      </div>

      {/* Add Food Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加食物</DialogTitle>
            <DialogDescription>请输入食用的克数</DialogDescription>
          </DialogHeader>
          {selectedFood && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="font-semibold text-lg">{selectedFood.name}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  每100克：{selectedFood.caloriesPer100g}卡 · 蛋白{selectedFood.proteinPer100g}g · 脂肪{selectedFood.fatPer100g}g ·
                  碳水{selectedFood.carbsPer100g}g
                </div>
              </div>

              <div>
                <Label htmlFor="grams">食用克数</Label>
                <Input
                  id="grams"
                  type="number"
                  value={grams}
                  onChange={(e) => setGrams(e.target.value)}
                  placeholder="例如：150"
                  className="mt-1.5"
                />
              </div>

              {grams && parseInt(grams) > 0 && (
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="text-sm font-medium">营养成分（{grams}克）</div>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                    <div>
                      热量：<span className="font-semibold">{Math.round((selectedFood.caloriesPer100g * parseInt(grams)) / 100)}</span> 卡
                    </div>
                    <div>
                      蛋白质：<span className="font-semibold">{Math.round((selectedFood.proteinPer100g * parseInt(grams)) / 100)}</span> g
                    </div>
                    <div>
                      脂肪：<span className="font-semibold">{Math.round((selectedFood.fatPer100g * parseInt(grams)) / 100)}</span> g
                    </div>
                    <div>
                      碳水：<span className="font-semibold">{Math.round((selectedFood.carbsPer100g * parseInt(grams)) / 100)}</span> g
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  取消
                </Button>
                <Button onClick={handleAddFood} disabled={addFoodLog.isPending} className="flex-1">
                  {addFoodLog.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      添加中...
                    </>
                  ) : (
                    "确认添加"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
