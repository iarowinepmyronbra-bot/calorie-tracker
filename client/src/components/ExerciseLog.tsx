import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Trash2, Activity } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

const EXERCISE_TYPES = [
  { value: "running", label: "跑步", metPerKg: 9.8 },
  { value: "walking", label: "快走", metPerKg: 4.5 },
  { value: "cycling", label: "骑行", metPerKg: 7.5 },
  { value: "swimming", label: "游泳", metPerKg: 8.3 },
  { value: "yoga", label: "瑜伽", metPerKg: 3.0 },
  { value: "strength", label: "力量训练", metPerKg: 6.0 },
  { value: "basketball", label: "篮球", metPerKg: 8.0 },
  { value: "football", label: "足球", metPerKg: 9.0 },
  { value: "badminton", label: "羽毛球", metPerKg: 5.5 },
  { value: "rope_jumping", label: "跳绳", metPerKg: 12.0 },
];

interface ExerciseLogProps {
  onExerciseAdded?: () => void;
}

export function ExerciseLog({ onExerciseAdded }: ExerciseLogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [exerciseType, setExerciseType] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");

  const { data: profile } = trpc.userProfile.get.useQuery();
  const { data: todayExercises, refetch } = trpc.exercise.list.useQuery(
    {
      startDate: new Date(new Date().setHours(0, 0, 0, 0)),
      endDate: new Date(new Date().setHours(23, 59, 59, 999)),
    }
  );

  const addMutation = trpc.exercise.add.useMutation({
    onSuccess: () => {
      toast.success("运动记录已添加");
      refetch();
      onExerciseAdded?.();
      setIsDialogOpen(false);
      setExerciseType("");
      setDuration("");
      setNotes("");
    },
    onError: (error: any) => {
      toast.error("添加失败: " + error.message);
    },
  });

  // TODO: 实现删除API
  const deleteMutation = { mutate: () => {}, isPending: false } as any;
  /*const deleteMutation = trpc.exercise.delete.useMutation({
    onSuccess: () => {
      toast.success("运动记录已删除");
      refetch();
      onExerciseAdded?.();
    },
    onError: (error: any) => {
      toast.error("删除失败: " + error.message);
    },
  });*/

  const handleAdd = () => {
    if (!exerciseType || !duration) {
      toast.error("请填写完整信息");
      return;
    }

    const durationNum = parseInt(duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      toast.error("请输入有效的时长");
      return;
    }

    // 计算消耗卡路里
    const exercise = EXERCISE_TYPES.find((e) => e.value === exerciseType);
    if (!exercise || !profile) {
      toast.error("无法计算消耗");
      return;
    }

    // MET值 × 体重(kg) × 时间(小时) = 消耗卡路里
    const caloriesBurned = Math.round(exercise.metPerKg * profile.initialWeight * (durationNum / 60));

    addMutation.mutate({
      exerciseType,
      duration: durationNum,
      notes: notes || undefined,
    });
  };

  const totalBurned = todayExercises?.reduce((sum: number, ex: any) => sum + ex.caloriesBurned, 0) || 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                今日运动
              </CardTitle>
              <CardDescription>
                {format(new Date(), "yyyy年M月d日", { locale: zhCN })}
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  添加运动
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>添加运动记录</DialogTitle>
                  <DialogDescription>记录您的运动，自动计算消耗卡路里</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>运动类型</Label>
                    <Select value={exerciseType} onValueChange={setExerciseType}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择运动类型" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXERCISE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>时长（分钟）</Label>
                    <Input
                      type="number"
                      placeholder="30"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>备注（可选）</Label>
                    <Input
                      placeholder="例如：晨跑，状态不错"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
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
            {/* 统计 */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <div className="text-sm text-muted-foreground">总消耗</div>
                <div className="text-2xl font-bold text-green-500">{totalBurned} 千卡</div>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>

            {/* 运动列表 */}
            {todayExercises && todayExercises.length > 0 ? (
              <div className="space-y-2">
                {todayExercises.map((exercise: any) => {
                  const type = EXERCISE_TYPES.find((t) => t.value === exercise.exerciseType);
                  return (
                    <div
                      key={exercise.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{type?.label || exercise.exerciseType}</div>
                        <div className="text-sm text-muted-foreground">
                          {exercise.durationMinutes}分钟 · 消耗 {exercise.caloriesBurned}千卡
                        </div>
                        {exercise.notes && (
                          <div className="text-xs text-muted-foreground mt-1">{exercise.notes}</div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate({ id: exercise.id })}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>今天还没有运动记录</p>
                <p className="text-sm">点击上方按钮添加运动</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
