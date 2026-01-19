import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Flame, Target, Award, Calendar, TrendingUp } from "lucide-react";
import { format, differenceInDays, startOfToday } from "date-fns";
import { zhCN } from "date-fns/locale";

export function SocialMotivation() {
  // 模拟数据（后续可接入真实API）
  const consecutiveDays = 7; // 连续打卡天数
  const totalCheckIns = 15; // 总打卡天数
  const weightLost = 2.5; // 已减重（kg）
  const targetWeight = 10; // 目标减重（kg）

  const achievements = [
    {
      id: 1,
      icon: <Flame className="h-6 w-6 text-orange-500" />,
      title: "连续打卡7天",
      description: "坚持就是胜利！",
      unlocked: true,
      date: "2026-01-19",
    },
    {
      id: 2,
      icon: <Target className="h-6 w-6 text-blue-500" />,
      title: "减重达人",
      description: "成功减重5kg",
      unlocked: false,
      progress: 50, // 50%
    },
    {
      id: 3,
      icon: <TrendingUp className="h-6 w-6 text-green-500" />,
      title: "运动健将",
      description: "累计运动100次",
      unlocked: false,
      progress: 30,
    },
    {
      id: 4,
      icon: <Calendar className="h-6 w-6 text-purple-500" />,
      title: "月度冠军",
      description: "连续打卡30天",
      unlocked: false,
      progress: 23,
    },
  ];

  const progressPercent = (weightLost / targetWeight) * 100;

  return (
    <div className="space-y-6">
      {/* 打卡统计 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            打卡记录
          </CardTitle>
          <CardDescription>坚持打卡，养成健康习惯</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg text-center">
              <Flame className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <div className="text-3xl font-bold text-orange-500">{consecutiveDays}</div>
              <div className="text-sm text-muted-foreground mt-1">连续打卡天数</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-3xl font-bold text-blue-500">{totalCheckIns}</div>
              <div className="text-sm text-muted-foreground mt-1">累计打卡天数</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">减重进度</span>
              <span className="text-sm text-muted-foreground">
                {weightLost}kg / {targetWeight}kg
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500"
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-1 text-right">
              {progressPercent.toFixed(1)}% 完成
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 成就徽章 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            成就徽章
          </CardTitle>
          <CardDescription>解锁更多成就，挑战自我</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 border rounded-lg transition-all ${
                  achievement.unlocked
                    ? "bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30"
                    : "bg-muted/30 opacity-60"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${achievement.unlocked ? "bg-yellow-500/20" : "bg-muted"}`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{achievement.title}</h4>
                      {achievement.unlocked && (
                        <Badge variant="secondary" className="text-xs">
                          已解锁
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    {achievement.unlocked && achievement.date && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(achievement.date), "yyyy年M月d日", { locale: zhCN })}
                      </p>
                    )}
                    {!achievement.unlocked && achievement.progress !== undefined && (
                      <div className="mt-2">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all"
                            style={{ width: `${achievement.progress}%` }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{achievement.progress}%</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 激励语 */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Award className="h-12 w-12 mx-auto mb-3 text-yellow-500" />
            <h3 className="text-lg font-semibold mb-2">继续加油！</h3>
            <p className="text-muted-foreground">
              您已经坚持了{consecutiveDays}天，距离下一个成就还有{30 - consecutiveDays}天
            </p>
            <Button className="mt-4">分享我的成就</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
