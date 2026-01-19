import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    gender: "male" as "male" | "female",
    age: "",
    height: "",
    initialWeight: "",
    targetWeight: "",
    activityLevel: "moderate" as "sedentary" | "light" | "moderate" | "active" | "very_active",
  });

  const createProfile = trpc.userProfile.create.useMutation({
    onSuccess: (data) => {
      toast.success("个人信息设置成功！");
      toast.info(`您的每日卡路里目标：${data.dailyCalorieTarget} 卡`);
      setLocation("/");
    },
    onError: (error) => {
      toast.error("设置失败：" + error.message);
    },
  });

  const handleSubmit = () => {
    if (!formData.age || !formData.height || !formData.initialWeight || !formData.targetWeight) {
      toast.error("请填写完整信息");
      return;
    }

    createProfile.mutate({
      gender: formData.gender,
      age: parseInt(formData.age),
      height: parseInt(formData.height),
      initialWeight: parseInt(formData.initialWeight),
      targetWeight: parseInt(formData.targetWeight),
      activityLevel: formData.activityLevel,
    });
  };

  const activityLevels = [
    { value: "sedentary", label: "久坐", desc: "很少或不运动" },
    { value: "light", label: "轻度活动", desc: "每周运动1-3天" },
    { value: "moderate", label: "中度活动", desc: "每周运动3-5天" },
    { value: "active", label: "高度活动", desc: "每周运动6-7天" },
    { value: "very_active", label: "非常活跃", desc: "每天运动，体力劳动" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">欢迎使用健康减肥助手</CardTitle>
          <CardDescription>让我们先了解一下您的基本信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label className="text-base font-semibold">性别</Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value as "male" | "female" })}
                  className="flex gap-4 mt-2"
                >
                  <div className="flex items-center space-x-2 flex-1">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male" className="cursor-pointer flex-1 text-center py-3 border rounded-lg">
                      男性
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 flex-1">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female" className="cursor-pointer flex-1 text-center py-3 border rounded-lg">
                      女性
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="age">年龄</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="请输入年龄"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="height">身高（厘米）</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="例如：170"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              <Button onClick={() => setStep(2)} className="w-full" size="lg">
                下一步
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="initialWeight">当前体重（公斤）</Label>
                <Input
                  id="initialWeight"
                  type="number"
                  placeholder="例如：70"
                  value={formData.initialWeight}
                  onChange={(e) => setFormData({ ...formData, initialWeight: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="targetWeight">目标体重（公斤）</Label>
                <Input
                  id="targetWeight"
                  type="number"
                  placeholder="例如：60"
                  value={formData.targetWeight}
                  onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>活动水平</Label>
                <Select
                  value={formData.activityLevel}
                  onValueChange={(value: any) => setFormData({ ...formData, activityLevel: value })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {activityLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        <div>
                          <div className="font-medium">{level.label}</div>
                          <div className="text-xs text-muted-foreground">{level.desc}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(1)} variant="outline" className="flex-1" size="lg">
                  上一步
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createProfile.isPending}
                  className="flex-1"
                  size="lg"
                >
                  {createProfile.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      设置中...
                    </>
                  ) : (
                    "完成设置"
                  )}
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-2 pt-4">
            <div className={`h-2 w-2 rounded-full ${step === 1 ? "bg-primary" : "bg-muted"}`} />
            <div className={`h-2 w-2 rounded-full ${step === 2 ? "bg-primary" : "bg-muted"}`} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
