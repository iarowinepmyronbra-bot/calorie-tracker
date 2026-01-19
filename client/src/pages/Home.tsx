import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Utensils, Activity, Moon, Scale, BarChart3, LogOut } from "lucide-react";
import { getLoginUrl } from "@/const";
import { FoodSearch } from "@/components/FoodSearch";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: profile, isLoading: profileLoading } = trpc.userProfile.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: dailyStats } = trpc.foodLogs.dailyStats.useQuery(
    { date: new Date() },
    { enabled: isAuthenticated, refetchInterval: 5000 }
  );

  const { data: todayLogs, refetch: refetchLogs } = trpc.foodLogs.list.useQuery(
    {
      startDate: new Date(new Date().setHours(0, 0, 0, 0)),
      endDate: new Date(new Date().setHours(23, 59, 59, 999)),
    },
    { enabled: isAuthenticated }
  );

  useEffect(() => {
    if (isAuthenticated && !profileLoading && !profile) {
      setLocation("/onboarding");
    }
  }, [isAuthenticated, profile, profileLoading, setLocation]);

  const handleFoodAdded = () => {
    refetchLogs();
    setRefreshKey((prev) => prev + 1);
  };

  const handleLogout = async () => {
    await logout();
    window.location.reload();
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">健康减肥助手</CardTitle>
            <CardDescription>科学管理饮食，轻松达成目标</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✓ 语音输入，快速记录</p>
              <p>✓ 智能计算，精准预测</p>
              <p>✓ 运动追踪，全面管理</p>
              <p>✓ 数据可视化，一目了然</p>
            </div>
            <Button asChild className="w-full" size="lg">
              <a href={getLoginUrl()}>立即开始</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const netCalories = (dailyStats?.totalCalories || 0);
  const calorieTarget = profile.dailyCalorieTarget;
  const remaining = calorieTarget - netCalories;
  const progress = Math.min((netCalories / calorieTarget) * 100, 100);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container flex items-center justify-between py-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">健康减肥助手</h1>
            <p className="text-sm text-muted-foreground">你好，{user?.name || "用户"}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            退出
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6 space-y-6">
        {/* Daily Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>今日概览</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-muted-foreground">已摄入</div>
                <div className="text-2xl font-bold text-primary">{netCalories}</div>
                <div className="text-xs text-muted-foreground">千卡</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">目标</div>
                <div className="text-2xl font-bold">{calorieTarget}</div>
                <div className="text-xs text-muted-foreground">千卡</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">剩余</div>
                <div className={`text-2xl font-bold ${remaining >= 0 ? "text-green-600" : "text-destructive"}`}>
                  {remaining}
                </div>
                <div className="text-xs text-muted-foreground">千卡</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>进度</span>
                <span>{progress.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    progress > 100 ? "bg-destructive" : "bg-primary"
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>

            {remaining < 0 && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                ⚠️ 今日摄入已超标 {Math.abs(remaining)} 卡，建议减少晚餐或增加运动
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="food" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="food">
              <Utensils className="h-4 w-4 mr-2" />
              饮食
            </TabsTrigger>
            <TabsTrigger value="exercise">
              <Activity className="h-4 w-4 mr-2" />
              运动
            </TabsTrigger>
            <TabsTrigger value="sleep">
              <Moon className="h-4 w-4 mr-2" />
              睡眠
            </TabsTrigger>
            <TabsTrigger value="weight">
              <Scale className="h-4 w-4 mr-2" />
              体重
            </TabsTrigger>
            <TabsTrigger value="stats">
              <BarChart3 className="h-4 w-4 mr-2" />
              统计
            </TabsTrigger>
          </TabsList>

          <TabsContent value="food" className="space-y-6">
            <FoodSearch onFoodAdded={handleFoodAdded} />

            {/* Today's Food Logs */}
            <Card>
              <CardHeader>
                <CardTitle>今日饮食记录</CardTitle>
                <CardDescription>共 {todayLogs?.length || 0} 条记录</CardDescription>
              </CardHeader>
              <CardContent>
                {todayLogs && todayLogs.length > 0 ? (
                  <div className="space-y-3">
                    {todayLogs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{log.foodName}</div>
                          <div className="text-sm text-muted-foreground">
                            {log.grams}克 · {log.calories}卡
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(log.loggedAt).toLocaleTimeString("zh-CN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    还没有饮食记录，快去添加吧！
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exercise">
            <Card>
              <CardHeader>
                <CardTitle>运动记录</CardTitle>
                <CardDescription>功能开发中...</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="sleep">
            <Card>
              <CardHeader>
                <CardTitle>睡眠记录</CardTitle>
                <CardDescription>功能开发中...</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="weight">
            <Card>
              <CardHeader>
                <CardTitle>体重追踪</CardTitle>
                <CardDescription>功能开发中...</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>数据统计</CardTitle>
                <CardDescription>功能开发中...</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
