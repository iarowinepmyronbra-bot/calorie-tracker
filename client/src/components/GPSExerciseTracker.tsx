import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapView } from "@/components/Map";
import { toast } from "sonner";
import { Play, Square, MapPin, Timer, Zap } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

export function GPSExerciseTracker() {
  const [exerciseType, setExerciseType] = useState("running");
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState(0);
  const [distance, setDistance] = useState(0);
  const [routePoints, setRoutePoints] = useState<Array<{ lat: number; lng: number }>>([]);
  
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPositionRef = useRef<GeolocationPosition | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  const exerciseTypes = [
    { value: "running", label: "跑步", speed: 2.5 }, // m/s
    { value: "cycling", label: "骑行", speed: 5.5 },
    { value: "walking", label: "步行", speed: 1.4 },
  ];

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // 地球半径（米）
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // 返回米
  };

  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      toast.error("您的浏览器不支持GPS定位");
      return;
    }

    setIsTracking(true);
    setStartTime(new Date());
    setDuration(0);
    setDistance(0);
    setRoutePoints([]);
    lastPositionRef.current = null;

    // 开始计时
    intervalRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    // 开始GPS追踪
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPoint = { lat: latitude, lng: longitude };

        setRoutePoints((prev) => {
          const updated = [...prev, newPoint];

          // 计算距离
          if (lastPositionRef.current) {
            const lastCoords = lastPositionRef.current.coords;
            const dist = calculateDistance(
              lastCoords.latitude,
              lastCoords.longitude,
              latitude,
              longitude
            );
            setDistance((prevDist) => prevDist + dist);
          }

          lastPositionRef.current = position;

          // 更新地图
          if (mapRef.current) {
            // 更新路线
            if (polylineRef.current) {
              polylineRef.current.setPath(updated);
            } else {
              polylineRef.current = new google.maps.Polyline({
                path: updated,
                geodesic: true,
                strokeColor: "#3b82f6",
                strokeOpacity: 1.0,
                strokeWeight: 4,
                map: mapRef.current,
              });
            }

            // 更新当前位置标记
            if (markerRef.current) {
              markerRef.current.setPosition(newPoint);
            } else {
              markerRef.current = new google.maps.Marker({
                position: newPoint,
                map: mapRef.current,
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: "#3b82f6",
                  fillOpacity: 1,
                  strokeColor: "#ffffff",
                  strokeWeight: 2,
                },
              });
            }

            // 移动地图中心
            mapRef.current.setCenter(newPoint);
          }

          return updated;
        });
      },
      (error) => {
        console.error("GPS error:", error);
        toast.error("GPS定位失败，请检查定位权限");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsTracking(false);

    // 计算卡路里（简单估算）
    const selectedExercise = exerciseTypes.find((e) => e.value === exerciseType);
    const avgSpeed = distance / duration; // m/s
    const calories = Math.round((distance / 1000) * 60); // 简单估算：每公里60卡

    toast.success(`运动完成！距离：${(distance / 1000).toFixed(2)}km，消耗：${calories}千卡`);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const avgSpeed = duration > 0 ? (distance / duration) * 3.6 : 0; // km/h

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            GPS运动追踪
          </CardTitle>
          <CardDescription>实时记录您的运动轨迹</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 运动类型选择 */}
            {!isTracking && (
              <div className="space-y-2">
                <label className="text-sm font-medium">运动类型</label>
                <Select value={exerciseType} onValueChange={setExerciseType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {exerciseTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* 统计数据 */}
            {isTracking && (
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <Timer className="h-5 w-5 mx-auto mb-2 text-blue-500" />
                  <div className="text-sm text-muted-foreground">时长</div>
                  <div className="text-xl font-bold">{formatDuration(duration)}</div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <MapPin className="h-5 w-5 mx-auto mb-2 text-green-500" />
                  <div className="text-sm text-muted-foreground">距离</div>
                  <div className="text-xl font-bold">{(distance / 1000).toFixed(2)} km</div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <Zap className="h-5 w-5 mx-auto mb-2 text-orange-500" />
                  <div className="text-sm text-muted-foreground">配速</div>
                  <div className="text-xl font-bold">{avgSpeed.toFixed(1)} km/h</div>
                </div>
              </div>
            )}

            {/* 地图 */}
            <div className="h-[400px] rounded-lg overflow-hidden border">
              <MapView onMapReady={handleMapReady} />
            </div>

            {/* 控制按钮 */}
            <div className="flex gap-2">
              {!isTracking ? (
                <Button onClick={startTracking} className="w-full" size="lg">
                  <Play className="h-5 w-5 mr-2" />
                  开始追踪
                </Button>
              ) : (
                <Button onClick={stopTracking} variant="destructive" className="w-full" size="lg">
                  <Square className="h-5 w-5 mr-2" />
                  停止追踪
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
