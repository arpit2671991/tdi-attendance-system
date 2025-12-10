import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { DataProvider } from "./lib/store";
import { Layout } from "./components/layout/Layout";

// Pages (to be created)
import Dashboard from "@/pages/Dashboard";
import Teachers from "@/pages/Teachers";
import Students from "@/pages/Students";
import Sessions from "@/pages/Sessions";
import Reports from "@/pages/Reports";
import TeacherPortal from "@/pages/TeacherPortal";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/teachers" component={Teachers} />
        <Route path="/students" component={Students} />
        <Route path="/sessions" component={Sessions} />
        <Route path="/reports" component={Reports} />
        <Route path="/portal" component={TeacherPortal} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
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
