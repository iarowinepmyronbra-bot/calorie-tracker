import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Utensils, Activity, Moon, Scale, BarChart3, Trophy, LogOut, User } from "lucide-react";
import { getLoginUrl } from "@/const";
import { FoodSearch } from "@/components/FoodSearch";
import { ExerciseLog } from "@/components/ExerciseLog";
import { SleepLog } from "@/components/SleepLog";
import { WeightTracker } from "@/components/WeightTracker";
import { MealPlanRecommend } from "@/components/MealPlanRecommend";
import { AIAdvisor } from "@/components/AIAdvisor";
import { DataVisualization } from "@/components/DataVisualization";
import { SocialMotivation } from "@/components/SocialMotivation";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("food");
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: profile } = trpc.userProfile.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: todayStats } = trpc.foodLogs.dailyStats.useQuery(
    { date: new Date() },
    { enabled: isAuthenticated, refetchInterval: 5000 }
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation("/onboarding");
    return null;
  }

  if (!profile) {
    setLocation("/onboarding");
    return null;
  }

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const handleFoodAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const caloriesConsumed = todayStats?.totalCalories || 0;
  const caloriesTarget = profile?.dailyCalorieTarget || 2000;
  const caloriesRemaining = Math.max(0, caloriesTarget - caloriesConsumed);
  const progress = Math.min((caloriesConsumed / caloriesTarget) * 100, 100);

  // 底部导航配置
  const tabs = [
    { id: "food", label: "饮食", icon: Utensils },
    { id: "exercise", label: "运动", icon: Activity },
    { id: "stats", label: "统计", icon: BarChart3 },
    { id: "social", label: "成就", icon: Trophy },
    { id: "profile", label: "我的", icon: User },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 顶部状态栏 */}
      <div className="sticky top-0 z-50 bg-card border-b">
        <div className="safe-top" />
        <div className="container py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-primary">健康减肥助手</h1>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 今日概览卡片 */}
      {activeTab === "food" && (
        <div className="container py-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <div className="text-sm text-muted-foreground mb-2">今日摄入</div>
                <div className="text-4xl font-bold text-primary mb-1">
                  {caloriesConsumed}
                  <span className="text-lg text-muted-foreground ml-1">千卡</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  目标 {caloriesTarget} / 剩余 {caloriesRemaining}
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 主内容区域 */}
      <div className="container pb-4">
        {activeTab === "food" && <FoodSearch key={refreshKey} onFoodAdded={handleFoodAdded} />}
        {activeTab === "exercise" && <ExerciseLog onExerciseAdded={handleFoodAdded} />}
        {activeTab === "stats" && (
          <div className="space-y-6">
            <DataVisualization />
            <MealPlanRecommend />
            <AIAdvisor />
          </div>
        )}
        {activeTab === "social" && <SocialMotivation />}
        {activeTab === "profile" && (
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-10 w-10 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold mb-1">{user?.name || "用户"}</h2>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">性别</span>
                    <span className="text-sm font-medium">
                      {profile.gender === "male" ? "男" : "女"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">年龄</span>
                    <span className="text-sm font-medium">{profile.age}岁</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">身高</span>
                    <span className="text-sm font-medium">{profile.height}cm</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">当前体重</span>
                    <span className="text-sm font-medium">{profile.initialWeight}kg</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">目标体重</span>
                    <span className="text-sm font-medium">{profile.targetWeight}kg</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">每日目标</span>
                    <span className="text-sm font-medium">{profile.dailyCalorieTarget}千卡</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <WeightTracker onWeightAdded={handleFoodAdded} />
            <SleepLog onSleepAdded={handleFoodAdded} />
          </div>
        )}
      </div>

      {/* iOS风格底部导航栏 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t">
        <div className="safe-bottom" />
        <div className="grid grid-cols-5 gap-1 px-2 pt-2 pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`h-6 w-6 mb-1 ${isActive ? "scale-110" : ""} transition-transform`} />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
