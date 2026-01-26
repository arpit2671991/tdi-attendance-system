import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DbNotification } from "@shared/schema";

export function Notification() {
  const queryClient = useQueryClient();
  const { data: alerts } = useQuery<DbNotification[]>({ queryKey: ["/api/notifications"] });

  const markRead = useMutation({
    mutationFn: async (id: string) => fetch(`/api/notifications/${id}/read`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notifications"] }),
  });

  if (!alerts || alerts.length === 0) return null;
  console.log(alerts)

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-bold text-red-700 flex items-center">
          <Bell className="mr-2 h-4 w-4" /> Critical Attendance Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between border-b border-red-100 pb-2 last:border-0">
              <div>
                <p className="text-sm font-medium text-red-900">{alert.message}</p>
                <p className="text-xs text-red-600">
                  {new Date(alert.createdAt!).toLocaleDateString()}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => markRead.mutate(alert.id)}
                className="text-red-700 hover:bg-red-200"
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}