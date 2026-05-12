import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { RoleProvider } from "@/lib/role-context";
import { NotificationsProvider } from "@/lib/notifications-context";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";

import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import MasterSetup from "@/pages/master-setup";
import Applicants from "@/pages/applicants";
import Admissions from "@/pages/admissions";

function ProtectedRoute({ component: Component, allowedRoles }: { component: any; allowedRoles?: string[] }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <NotFound />;
  }

  return <Component />;
}

function Router() {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/setup" component={() => <ProtectedRoute component={MasterSetup} allowedRoles={["Admin"]} />} />
        <Route path="/applicants" component={() => <ProtectedRoute component={Applicants} allowedRoles={["Admin", "Admission Officer"]} />} />
        <Route path="/admissions" component={() => <ProtectedRoute component={Admissions} allowedRoles={["Admin", "Admission Officer"]} />} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationsProvider>
          <RoleProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </RoleProvider>
        </NotificationsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
