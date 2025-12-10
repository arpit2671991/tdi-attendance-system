import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  CalendarDays, 
  BarChart3, 
  CheckSquare,
  School,
  LogOut,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const adminNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Admins', href: '/admins', icon: ShieldCheck },
  { name: 'Teachers', href: '/teachers', icon: Users },
  { name: 'Students', href: '/students', icon: GraduationCap },
  { name: 'Sessions', href: '/sessions', icon: CalendarDays },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
];

const teacherNavigation = [
  { name: 'My Attendance', href: '/portal', icon: CheckSquare },
  { name: 'My Reports', href: '/reports', icon: BarChart3 },
];

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  if (!user) return null;

  const navigation = user.role === 'admin' ? adminNavigation : teacherNavigation;

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-sidebar-border">
        <School className="h-6 w-6 text-sidebar-primary" />
        <span className="text-lg font-heading font-bold tracking-tight">EduTrack</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          <div className="mb-4 px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
            {user.role === 'admin' ? 'Administration' : 'Faculty Portal'}
          </div>
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50")} />
                  {item.name}
                </a>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-9 w-9 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary font-bold">
            {user.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium truncate">{user.name}</span>
            <span className="text-xs text-sidebar-foreground/50 truncate capitalize">{user.role}</span>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 border-sidebar-border bg-transparent"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
