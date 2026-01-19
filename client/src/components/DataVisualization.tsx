import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingDown, Activity, Apple } from "lucide-react";
import { format, subDays } from "date-fns";
import { zhCN } from "date-fns/locale";

export function DataVisualization() {
  const { data: profile } = trpc.userProfile.get.useQuery();
  
  // 获取最近30天的体重数据
  const { data: weightLogs } = trpc.weight.list.useQuery({ limit: 30 });
  
  // 获取最近7天的饮食记录
  const { data: foodLogs } = trpc.foodLogs.list.useQuery({
    startDate: subDays(new Date(), 7),
    endDate: new Date(),
  });

  // 处理体重数据
  const weightChartData = weightLogs
    ?.slice()
    .reverse()
    .map((log: any) => ({
      date: format(new Date(log.loggedAt), "M/d", { locale: zhCN }),
      weight: log.weight,
      target: profile?.targetWeight || 0,
    })) || [];

  // 处理卡路里趋势数据
  const calorieChartData: { date: string; calories: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dateStr = format(date, "yyyy-MM-dd");
    const dayLogs = foodLogs?.filter((log: any) => 
      format(new Date(log.loggedAt), "yyyy-MM-dd") === dateStr
    ) || [];
    const totalCalories = dayLogs.reduce((sum: number, log: any) => 
      sum + (log.calories || 0), 0
    );
    calorieChartData.push({
      date: format(date, "M/d", { locale: zhCN }),
      calories: totalCalories,
    });
  }

  // 计算营养素分布（最近7天平均）
  const totalProtein = foodLogs?.reduce((sum: number, log: any) => sum + (log.protein || 0), 0) || 0;
  const totalFat = foodLogs?.reduce((sum: number, log: any) => sum + (log.fat || 0), 0) || 0;
  const totalCarbs = foodLogs?.reduce((sum: number, log: any) => sum + (log.carbs || 0), 0) || 0;

  const nutritionData = [
    { name: "蛋白质", value: totalProtein, color: "#3b82f6" },
    { name: "脂肪", value: totalFat, color: "#ef4444" },
    { name: "碳水", value: totalCarbs, color: "#10b981" },
  ].filter(item => item.value > 0);

  // 计算统计数据
  const avgWeight = weightLogs && weightLogs.length > 0
    ? (weightLogs.reduce((sum: any, log: any) => sum + log.weight, 0) / weightLogs.length).toFixed(1)
    : 0;

  const weightChange = weightLogs && weightLogs.length >= 2
    ? (weightLogs[0].weight - weightLogs[weightLogs.length - 1].weight).toFixed(1)
    : 0;

  const avgCalories = calorieChartData.length > 0
    ? Math.round(calorieChartData.reduce((sum, day) => sum + day.calories, 0) / calorieChartData.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>近30天平均体重</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{avgWeight} kg</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>体重变化</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${Number(weightChange) < 0 ? 'text-green-500' : 'text-red-500'}`}>
              {Number(weightChange) < 0 ? '' : '+'}{weightChange} kg
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>近7天平均摄入</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">{avgCalories} 千卡</div>
          </CardContent>
        </Card>
      </div>

      {/* 体重变化曲线 */}
      {weightChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              体重变化趋势
            </CardTitle>
            <CardDescription>近30天体重记录</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weightChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="实际体重"
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="目标体重"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* 卡路里摄入趋势 */}
      {calorieChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              卡路里摄入趋势
            </CardTitle>
            <CardDescription>近7天每日摄入</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={calorieChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="calories" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  name="卡路里"
                  dot={{ fill: '#f59e0b', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* 营养素分布 */}
      {nutritionData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Apple className="h-5 w-5" />
              营养素分布
            </CardTitle>
            <CardDescription>近7天平均摄入比例</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={nutritionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {nutritionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  formatter={(value: number) => `${value.toFixed(1)}g`}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {weightChartData.length === 0 && calorieChartData.every(d => d.calories === 0) && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>暂无数据</p>
            <p className="text-sm mt-2">开始记录饮食和体重，查看数据可视化</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
