import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Scale, TrendingDown, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface WeightTrackerProps {
  onWeightAdded?: () => void;
}

export function WeightTracker({ onWeightAdded }: WeightTrackerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [loggedAt, setLoggedAt] = useState("");

  const { data: profile } = trpc.userProfile.get.useQuery();
  const { data: recentWeights, refetch } = trpc.weight.list.useQuery({
    limit: 30,
  });

  const addMutation = trpc.weight.add.useMutation({
    onSuccess: () => {
      toast.success("体重记录已添加");
      refetch();
      onWeightAdded?.();
      setIsDialogOpen(false);
      setWeight("");
      setLoggedAt("");
    },
    onError: (error: any) => {
      toast.error("添加失败: " + error.message);
    },
  });

  const handleAdd = () => {
    if (!weight) {
      toast.error("请输入体重");
      return;
    }

    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0 || weightNum > 300) {
      toast.error("请输入有效的体重（1-300kg）");
      return;
    }

    addMutation.mutate({
      weight: weightNum,
      loggedAt: loggedAt ? new Date(loggedAt) : undefined,
    });
  };

  const latestWeight = recentWeights && recentWeights.length > 0 ? recentWeights[0] : null;
  const weightChange = latestWeight && profile
    ? latestWeight.weight - profile.initialWeight
    : 0;

  const targetRemaining = latestWeight && profile
    ? latestWeight.weight - profile.targetWeight
    : 0;

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "偏瘦", color: "text-blue-500" };
    if (bmi < 24) return { label: "正常", color: "text-green-500" };
    if (bmi < 28) return { label: "超重", color: "text-yellow-500" };
    return { label: "肥胖", color: "text-red-500" };
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                体重追踪
              </CardTitle>
              <CardDescription>
                {format(new Date(), "yyyy年M月d日", { locale: zhCN })}
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  记录体重
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>记录体重</DialogTitle>
                  <DialogDescription>记录您的当前体重</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>体重（kg）</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="65.5"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>记录时间（可选）</Label>
                    <Input
                      type="datetime-local"
                      value={loggedAt}
                      onChange={(e) => setLoggedAt(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">不填写则默认为当前时间</p>
                  </div>
                  <Button onClick={handleAdd} disabled={addMutation.isPending} className="w-full">
                    {addMutation.isPending ? "添加中..." : "确认添加"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 统计卡片 */}
            {latestWeight && profile && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">当前体重</div>
                  <div className="text-2xl font-bold text-blue-500">
                    {latestWeight.weight} kg
                  </div>
                  {latestWeight.bmi && (
                    <div className="text-xs mt-1">
                      BMI: {latestWeight.bmi.toFixed(1)} ·{" "}
                      <span className={getBMICategory(latestWeight.bmi).color}>
                        {getBMICategory(latestWeight.bmi).label}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">距离目标</div>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    {targetRemaining > 0 ? (
                      <>
                        <TrendingDown className="h-5 w-5 text-orange-500" />
                        <span className="text-orange-500">-{targetRemaining.toFixed(1)} kg</span>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <span className="text-green-500">已达成</span>
                      </>
                    )}
                  </div>
                  <div className="text-xs mt-1 text-muted-foreground">
                    目标: {profile.targetWeight} kg
                  </div>
                </div>
              </div>
            )}

            {/* 体重变化 */}
            {weightChange !== 0 && (
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">相比初始体重</span>
                  <div className="flex items-center gap-2">
                    {weightChange > 0 ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-red-500" />
                        <span className="font-medium text-red-500">+{weightChange.toFixed(1)} kg</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-green-500">{weightChange.toFixed(1)} kg</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 体重历史 */}
            {recentWeights && recentWeights.length > 0 ? (
              <div className="space-y-2">
                <h3 className="font-medium">最近记录</h3>
                {recentWeights.slice(0, 7).map((log: any) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <div className="font-medium">{log.weight} kg</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(log.loggedAt), "yyyy年M月d日 HH:mm", { locale: zhCN })}
                      </div>
                    </div>
                    {log.bmi && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">BMI: </span>
                        <span className={getBMICategory(log.bmi).color}>
                          {log.bmi.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Scale className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>还没有体重记录</p>
                <p className="text-sm">点击上方按钮记录体重</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
