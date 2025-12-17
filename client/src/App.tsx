import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "./lib/auth-context";
import { Layout } from "./components/layout/Layout";
import { useEffect } from "react";

// Pages
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Teachers from "@/pages/Teachers";
import Students from "@/pages/Students";
import Departments from "@/pages/Departments";
import Sessions from "@/pages/Sessions";
import Reports from "@/pages/Reports";
import TeacherPortal from "@/pages/TeacherPortal";
import NotFound from "@/pages/not-found";

import Admins from "@/pages/Admins";
import Attendances from "./pages/Attendaces";

// Protected Route Wrapper
function ProtectedRoute({ component: Component, allowedRoles }: { component: React.ComponentType, allowedRoles?: string[] }) {
  const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
    } else if (!loading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      setLocation(user.role === 'admin' ? '/' : '/portal');
    }
  }, [user, loading, location, setLocation, allowedRoles]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return null;
  if (allowedRoles && !allowedRoles.includes(user.role)) return null;

  return (
    <Layout>
      <Component />
    </Layout>
  );
}

function LoginRoute() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setLocation(user.role === 'admin' ? '/' : '/portal');
    }
  }, [user, setLocation]);

  if (user) return null;

  return <Login />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginRoute} />
      
      {/* Admin Routes */}
      <Route path="/">
        <ProtectedRoute component={Dashboard} allowedRoles={['admin']} />
      </Route>
      <Route path="/teachers">
        <ProtectedRoute component={Teachers} allowedRoles={['admin']} />
      </Route>
      <Route path="/admins">
        <ProtectedRoute component={Admins} allowedRoles={['admin']} />
      </Route>
      <Route path="/students">
        <ProtectedRoute component={Students} allowedRoles={['admin']} />
      </Route>
      <Route path="/departments">
        <ProtectedRoute component={Departments} allowedRoles={['admin']} />
      </Route>
      <Route path="/sessions">
        <ProtectedRoute component={Sessions} allowedRoles={['admin']} />
      </Route>
        <Route path="/attendaces">
        <ProtectedRoute component={Attendances} allowedRoles={['admin']} />
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
      <AuthProvider>
        <Toaster />
        <Router />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
