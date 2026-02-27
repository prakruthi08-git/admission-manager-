import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleProvider } from "@/lib/role-context";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";

import Dashboard from "@/pages/dashboard";
import MasterSetup from "@/pages/master-setup";
import Applicants from "@/pages/applicants";
import Admissions from "@/pages/admissions";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard}/>
      <Route path="/setup" component={MasterSetup}/>
      <Route path="/applicants" component={Applicants}/>
      <Route path="/admissions" component={Admissions}/>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RoleProvider>
        <TooltipProvider>
          <Toaster />
          <Layout>
            <Router />
          </Layout>
        </TooltipProvider>
      </RoleProvider>
    </QueryClientProvider>
  );
}

export default App;
