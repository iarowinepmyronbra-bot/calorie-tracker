import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Moon, Star } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface SleepLogProps {
  onSleepAdded?: () => void;
}

export function SleepLog({ onSleepAdded }: SleepLogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [bedTime, setBedTime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [quality, setQuality] = useState("3");
  const [notes, setNotes] = useState("");

  const { data: todaySleep, refetch } = trpc.sleep.list.useQuery(
    {
      startDate: new Date(new Date().setHours(0, 0, 0, 0)),
      endDate: new Date(new Date().setHours(23, 59, 59, 999)),
    }
  );

  const addMutation = trpc.sleep.add.useMutation({
    onSuccess: () => {
      toast.success("睡眠记录已添加");
      refetch();
      onSleepAdded?.();
      setIsDialogOpen(false);
      setBedTime("");
      setWakeTime("");
      setQuality("3");
      setNotes("");
    },
    onError: (error: any) => {
      toast.error("添加失败: " + error.message);
    },
  });

  const handleAdd = () => {
    if (!bedTime || !wakeTime) {
      toast.error("请填写完整信息");
      return;
    }

    const bedDate = new Date(bedTime);
    const wakeDate = new Date(wakeTime);

    if (wakeDate <= bedDate) {
      toast.error("起床时间必须晚于入睡时间");
      return;
    }

    addMutation.mutate({
      bedTime: bedDate,
      wakeTime: wakeDate,
      quality: parseInt(quality),
      notes: notes || undefined,
    });
  };

  const calculateDuration = (bed: Date, wake: Date) => {
    const diff = wake.getTime() - bed.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}小时${minutes}分钟`;
  };

  const getQualityLabel = (q: number) => {
    if (q >= 4) return { label: "优秀", color: "text-green-500" };
    if (q === 3) return { label: "良好", color: "text-blue-500" };
    if (q === 2) return { label: "一般", color: "text-yellow-500" };
    return { label: "较差", color: "text-red-500" };
  };

  const avgQuality = todaySleep && todaySleep.length > 0
    ? todaySleep.reduce((sum: number, s: any) => sum + (s.quality || 3), 0) / todaySleep.length
    : 0;

  const totalDuration = todaySleep?.reduce((sum: number, s: any) => {
    const diff = new Date(s.wakeTime).getTime() - new Date(s.bedTime).getTime();
    return sum + diff;
  }, 0) || 0;

  const totalHours = Math.floor(totalDuration / (1000 * 60 * 60));
  const totalMinutes = Math.floor((totalDuration % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5" />
                今日睡眠
              </CardTitle>
              <CardDescription>
                {format(new Date(), "yyyy年M月d日", { locale: zhCN })}
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  添加睡眠
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>添加睡眠记录</DialogTitle>
                  <DialogDescription>记录您的睡眠时间和质量</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>入睡时间</Label>
                    <Input
                      type="datetime-local"
                      value={bedTime}
                      onChange={(e) => setBedTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>起床时间</Label>
                    <Input
                      type="datetime-local"
                      value={wakeTime}
                      onChange={(e) => setWakeTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>睡眠质量（1-5分）</Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((q) => (
                        <Button
                          key={q}
                          variant={quality === q.toString() ? "default" : "outline"}
                          size="sm"
                          onClick={() => setQuality(q.toString())}
                        >
                          {q}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>备注（可选）</Label>
                    <Input
                      placeholder="例如：睡眠质量不错"
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
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">总时长</div>
                <div className="text-2xl font-bold text-blue-500">
                  {totalHours}h {totalMinutes}m
                </div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">平均质量</div>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <Star className={`h-5 w-5 ${getQualityLabel(avgQuality).color}`} />
                  <span className={getQualityLabel(avgQuality).color}>
                    {getQualityLabel(avgQuality).label}
                  </span>
                </div>
              </div>
            </div>

            {/* 睡眠列表 */}
            {todaySleep && todaySleep.length > 0 ? (
              <div className="space-y-2">
                {todaySleep.map((sleep: any) => {
                  const qualityInfo = getQualityLabel(sleep.quality || 3);
                  return (
                    <div
                      key={sleep.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {format(new Date(sleep.bedTime), "HH:mm")} -{" "}
                          {format(new Date(sleep.wakeTime), "HH:mm")}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {calculateDuration(new Date(sleep.bedTime), new Date(sleep.wakeTime))} ·{" "}
                          <span className={qualityInfo.color}>{qualityInfo.label}</span>
                        </div>
                        {sleep.notes && (
                          <div className="text-xs text-muted-foreground mt-1">{sleep.notes}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Moon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>今天还没有睡眠记录</p>
                <p className="text-sm">点击上方按钮添加睡眠</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
