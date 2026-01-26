import { Bell, UserX, Check } from "lucide-react";
import { 
  useNotifications, 
  useMarkNotificationRead 
} from "@/lib/hooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuHeader,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export function NotificationBell() {
  const { data: notifications = [] } = useNotifications();
  const { mutate: markAsRead } = useMarkNotificationRead();

  const unreadCount = notifications.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4">
          <h4 className="text-sm font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Badge variant="outline">{unreadCount} New</Badge>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No new alerts
            </div>
          ) : (
            notifications.map((notif: any) => (
              <DropdownMenuItem 
                key={notif.id} 
                className="p-4 cursor-default focus:bg-accent flex flex-col items-start gap-2"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 bg-red-100 rounded-full">
                    <UserX className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Absence Penalty
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-2 h-8 text-xs flex items-center gap-2"
                  onClick={(e) => {
                    e.preventDefault();
                    markAsRead(notif.id);
                  }}
                >
                  <Check className="h-3 w-3" /> Mark as read
                </Button>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}