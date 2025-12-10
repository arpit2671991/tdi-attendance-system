import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { DataProvider, useData } from "./lib/store";
import { Layout } from "./components/layout/Layout";
import { useEffect } from "react";

// Pages
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Teachers from "@/pages/Teachers";
import Students from "@/pages/Students";
import Sessions from "@/pages/Sessions";
import Reports from "@/pages/Reports";
import TeacherPortal from "@/pages/TeacherPortal";
import NotFound from "@/pages/not-found";

// Protected Route Wrapper
function ProtectedRoute({ component: Component, allowedRoles }: { component: React.ComponentType, allowedRoles?: string[] }) {
  const { currentUser } = useData();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!currentUser) {
      setLocation("/login");
    } else if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
      // Redirect if role not allowed (e.g. teacher trying to access admin page)
      setLocation(currentUser.role === 'admin' ? '/' : '/portal');
    }
  }, [currentUser, location, setLocation, allowedRoles]);

  if (!currentUser) return null;
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) return null;

  return (
    <Layout>
      <Component />
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      {/* Admin Routes */}
      <Route path="/">
        <ProtectedRoute component={Dashboard} allowedRoles={['admin']} />
      </Route>
      <Route path="/teachers">
        <ProtectedRoute component={Teachers} allowedRoles={['admin']} />
      </Route>
      <Route path="/students">
        <ProtectedRoute component={Students} allowedRoles={['admin']} />
      </Route>
      <Route path="/sessions">
        <ProtectedRoute component={Sessions} allowedRoles={['admin']} />
      </Route>
      
      {/* Shared/Teacher Routes */}
      <Route path="/reports">
        <ProtectedRoute component={Reports} allowedRoles={['admin', 'teacher']} />
      </Route>
      <Route path="/portal">
        <ProtectedRoute component={TeacherPortal} allowedRoles={['teacher']} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DataProvider>
        <Toaster />
        <Router />
      </DataProvider>
    </QueryClientProvider>
  );
}

export default App;
