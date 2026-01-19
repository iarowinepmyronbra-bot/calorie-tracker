import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Send, Bot, Dumbbell, Apple } from "lucide-react";
import { Streamdown } from "streamdown";

export function AIAdvisor() {
  const [nutritionistMessage, setNutritionistMessage] = useState("");
  const [trainerMessage, setTrainerMessage] = useState("");
  const [nutritionistChat, setNutritionistChat] = useState<Array<{ role: string; content: string }>>([]);
  const [trainerChat, setTrainerChat] = useState<Array<{ role: string; content: string }>>([]);

  const nutritionistMutation = trpc.aiAdvisor.chat.useMutation({
    onSuccess: (data) => {
      const reply = typeof data.reply === 'string' ? data.reply : '';
      setNutritionistChat((prev) => [...prev, { role: "assistant", content: reply }]);
      setNutritionistMessage("");
    },
    onError: (error: any) => {
      toast.error("咨询失败: " + error.message);
    },
  });

  const trainerMutation = trpc.aiAdvisor.chat.useMutation({
    onSuccess: (data) => {
      const reply = typeof data.reply === 'string' ? data.reply : '';
      setTrainerChat((prev) => [...prev, { role: "assistant", content: reply }]);
      setTrainerMessage("");
    },
    onError: (error: any) => {
      toast.error("咨询失败: " + error.message);
    },
  });

  const handleNutritionistSend = () => {
    if (!nutritionistMessage.trim()) {
      toast.error("请输入问题");
      return;
    }

    setNutritionistChat((prev) => [...prev, { role: "user", content: nutritionistMessage }]);
    nutritionistMutation.mutate({
      message: nutritionistMessage,
      type: "nutritionist",
    });
  };

  const handleTrainerSend = () => {
    if (!trainerMessage.trim()) {
      toast.error("请输入问题");
      return;
    }

    setTrainerChat((prev) => [...prev, { role: "user", content: trainerMessage }]);
    trainerMutation.mutate({
      message: trainerMessage,
      type: "trainer",
    });
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="nutritionist" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="nutritionist">
            <Apple className="h-4 w-4 mr-2" />
            AI营养师
          </TabsTrigger>
          <TabsTrigger value="trainer">
            <Dumbbell className="h-4 w-4 mr-2" />
            AI健身教练
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nutritionist">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI营养师
              </CardTitle>
              <CardDescription>
                专业的饮食分析和营养建议，帮助您科学减肥
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 对话历史 */}
                <div className="min-h-[300px] max-h-[500px] overflow-y-auto space-y-4 p-4 border rounded-lg bg-muted/20">
                  {nutritionistChat.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>您好！我是您的专属营养师</p>
                      <p className="text-sm mt-2">您可以问我关于饮食、营养、减肥的任何问题</p>
                      <div className="mt-6 text-sm space-y-2">
                        <p className="font-medium">例如：</p>
                        <p>• 我今天吃了炸鸡，怎么补救？</p>
                        <p>• 减肥期间可以吃水果吗？</p>
                        <p>• 如何增加蛋白质摄入？</p>
                      </div>
                    </div>
                  ) : (
                    nutritionistChat.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          {msg.role === "assistant" ? (
                            <Streamdown>{msg.content}</Streamdown>
                          ) : (
                            <p>{msg.content}</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  {nutritionistMutation.isPending && (
                    <div className="flex justify-start">
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-muted-foreground">正在思考...</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 输入框 */}
                <div className="flex gap-2">
                  <Textarea
                    placeholder="输入您的问题..."
                    value={nutritionistMessage}
                    onChange={(e) => setNutritionistMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleNutritionistSend();
                      }
                    }}
                    className="min-h-[60px]"
                  />
                  <Button
                    onClick={handleNutritionistSend}
                    disabled={nutritionistMutation.isPending}
                    size="icon"
                    className="h-[60px] w-[60px]"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trainer">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI健身教练
              </CardTitle>
              <CardDescription>
                专业的运动指导和训练计划，助您高效健身
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 对话历史 */}
                <div className="min-h-[300px] max-h-[500px] overflow-y-auto space-y-4 p-4 border rounded-lg bg-muted/20">
                  {trainerChat.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>您好！我是您的专属健身教练</p>
                      <p className="text-sm mt-2">您可以问我关于运动、训练、健身的任何问题</p>
                      <div className="mt-6 text-sm space-y-2">
                        <p className="font-medium">例如：</p>
                        <p>• 新手应该如何开始运动？</p>
                        <p>• 跑步和游泳哪个更减肥？</p>
                        <p>• 如何制定一周健身计划？</p>
                      </div>
                    </div>
                  ) : (
                    trainerChat.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          {msg.role === "assistant" ? (
                            <Streamdown>{msg.content}</Streamdown>
                          ) : (
                            <p>{msg.content}</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  {trainerMutation.isPending && (
                    <div className="flex justify-start">
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-muted-foreground">正在思考...</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 输入框 */}
                <div className="flex gap-2">
                  <Textarea
                    placeholder="输入您的问题..."
                    value={trainerMessage}
                    onChange={(e) => setTrainerMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleTrainerSend();
                      }
                    }}
                    className="min-h-[60px]"
                  />
                  <Button
                    onClick={handleTrainerSend}
                    disabled={trainerMutation.isPending}
                    size="icon"
                    className="h-[60px] w-[60px]"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
