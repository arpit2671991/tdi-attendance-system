

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { 
  LayoutDashboard, Users, GraduationCap, CalendarDays, BarChart3, 
  CheckSquare, LogOut, ShieldCheck, Menu, X 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Accordion, AccordionItem, AccordionTrigger, AccordionContent 
} from "@/components/ui/accordion";

const adminNavigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  {
    name: "User Management",
    icon: Users,
    children: [
      { name: "Admins", href: "/admins", icon: ShieldCheck },
      { name: "Instructors", href: "/teachers", icon: Users },
      { name: "Students", href: "/students", icon: GraduationCap },
    ],
  },
  {
    name: "Academics",
    icon: GraduationCap,
    children: [
      { name: "Course Levels", href: "/course-levels", icon: GraduationCap },
      { name: "Course Hours", href: "/course-hours", icon: GraduationCap },
      { name: "Courses", href: "/courses", icon: GraduationCap },
      { name: "Classes", href: "/classes", icon: CalendarDays },
      { name: "Daily Schedules", href: "/Daily-Agenda", icon: CalendarDays },
    ],
  },
  {
    name: "Attendance",
    icon: CalendarDays,
    children: [
      { name: "Mark Attendance", href: "/attendaces", icon: CheckSquare },
      { name: "Teachers Attendance Records", href: "/teacher-attendance-records", icon: BarChart3 },
      { name: "Students Attendance Records", href: "/student-attendance-records", icon: BarChart3 },
    ],
  },
  {
    name: "Reports",
    icon: BarChart3,
    children: [
      { name: "Teacher Payroll", href: "/teachers-payroll", icon: BarChart3 },
      { name: "Students Course Hours", href: "/studentcourse-hour", icon: BarChart3 },
    ],
  },
];

const teacherNavigation = [
  { name: "Dashboard", href: "/portal", icon: LayoutDashboard },
  { name: "View My Calendar", href: "/teacher-calendar", icon: CalendarDays },
];

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const isExpanded = !collapsed || hovered;
  const widthClass = isExpanded ? "w-72" : "w-20";

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
    setMobileOpen(false);
  };

  const navigation = user.role === "admin" ? adminNavigation : teacherNavigation;

  return (
    <>
      {/* Mobile Hamburger (Only visible on small screens) */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-sidebar text-sidebar-foreground shadow-lg border border-sidebar-border"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay for mobile */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300",
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar Container */}
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "flex flex-col h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border z-40 transition-[width] duration-300 ease-in-out",
          widthClass,
          "fixed inset-y-0 left-0 md:relative md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* TOP HEADER: Hamburger + Logo */}
        <div className="flex flex-col pt-4 pb-6 px-4 gap-4">
          {/* Hamburger/Close Toggle - Now part of the header flow */}
          <div className={cn("flex w-full", isExpanded ? "justify-start px-2" : "justify-center")}>
             <button
                className="p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed ? <Menu className="h-6 w-6" /> : <X className="h-6 w-6" />}
              </button>
          </div>

          {/* Logo Section */}
          <div className={cn(
            "flex items-center gap-3 w-full transition-all duration-300",
            isExpanded ? "justify-start px-2" : "justify-center"
          )}>
            <img 
              src="/new-logo.png" 
              alt="TDI Logo" 
              className={cn("transition-all object-contain", isExpanded ? "h-10 w-10" : "h-12 w-12")} 
            />
            {isExpanded && (
              <div className="flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-1">
                <span className="text-sm font-bold leading-tight tracking-tight text-sidebar-primary text-white uppercase whitespace-nowrap">
                  Technology Domain
                </span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-white">
                  Institute Mgmt
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 mb-4"><div className="h-px bg-sidebar-border/50" /></div>

        {/* Navigation Section - SCROLLBAR HIDDEN */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1 overflow-x-hidden no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style jsx>{`
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          
          <Accordion type="multiple" className="w-full border-none space-y-1">
            {navigation.map((item) => {
              const isActive = location === item.href || item.children?.some((c) => c.href === location);

              if (!item.children) {
                return (
                  <Link key={item.name} href={item.href}>
                    <a className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      !isExpanded && "justify-center",
                      isActive 
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" 
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
                    )}>
                      <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-sidebar-primary" : "")} />
                      {isExpanded && <span className="truncate">{item.name}</span>}
                    </a>
                  </Link>
                );
              }

              return (
                <AccordionItem key={item.name} value={item.name} className="border-none">
                  <AccordionTrigger className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg hover:no-underline transition-all",
                    !isExpanded && "justify-center",
                    isActive ? "bg-sidebar-accent/40 text-sidebar-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
                  )}>
                    <div className={cn("flex items-center gap-3 flex-1", !isExpanded && "justify-center")}>
                      <item.icon className="h-5 w-5 shrink-0" />
                      {isExpanded && <span className="truncate">{item.name}</span>}
                    </div>
                  </AccordionTrigger>
                  
                  {isExpanded && (
                    <AccordionContent className="pb-1 pt-1 pl-10 space-y-1">
                      {item.children.map((child) => (
                        <Link key={child.name} href={child.href}>
                          <a onClick={() => setMobileOpen(false)} className={cn(
                            "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                            location === child.href ? "text-sidebar-primary font-semibold" : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
                          )}>
                            {child.name}
                          </a>
                        </Link>
                      ))}
                    </AccordionContent>
                  )}
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        {/* Footer Section */}
        <div className="mt-auto border-t border-sidebar-border p-4 bg-sidebar/50">
          {isExpanded ? (
            <div className="animate-in fade-in duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary font-bold shrink-0">
                  {user.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold truncate">{user.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 h-9 text-xs border-sidebar-border hover:bg-destructive/10 hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" /> Logout
              </Button>
            </div>
          ) : (
            <div className="flex justify-center">
               <button onClick={handleLogout} className="p-2 text-sidebar-foreground/60 hover:text-destructive transition-colors">
                  <LogOut className="h-5 w-5" />
               </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}