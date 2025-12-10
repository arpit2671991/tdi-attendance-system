import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  CalendarDays, 
  BarChart3, 
  CheckSquare,
  School
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Teachers', href: '/teachers', icon: Users },
  { name: 'Students', href: '/students', icon: GraduationCap },
  { name: 'Sessions', href: '/sessions', icon: CalendarDays },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-sidebar-border">
        <School className="h-6 w-6 text-sidebar-primary" />
        <span className="text-lg font-heading font-bold tracking-tight">EduTrack</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          <div className="mb-4 px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
            Admin
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

          <div className="mt-8 mb-4 px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
            Teacher Portal
          </div>
          <Link href="/portal">
            <a
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                location === '/portal'
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <CheckSquare className={cn("h-5 w-5", location === '/portal' ? "text-sidebar-primary" : "text-sidebar-foreground/50")} />
              Attendance
            </a>
          </Link>
        </nav>
      </div>

      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary font-bold">
            AD
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Admin User</span>
            <span className="text-xs text-sidebar-foreground/50">admin@school.edu</span>
          </div>
        </div>
      </div>
    </div>
  );
}
