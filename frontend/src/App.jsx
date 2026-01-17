import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/auth-context";
import { StatsProvider } from "@/contexts/stats-context";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Login from "@/pages/login";
import Register from "@/pages/register";
import VolunteerDashboard from "@/pages/volunteer-dashboard";
import OrganizationDashboard from "@/pages/organization-dashboard";
import BrowseProjects from "@/pages/browse-projects";
import ProjectDetails from "@/pages/project-details";

function Router() {
  return (
    <Switch base="/Communities-Connect">
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/volunteer/dashboard" component={VolunteerDashboard} />
      <Route path="/organization/dashboard" component={OrganizationDashboard} />
      <Route path="/projects" component={BrowseProjects} />
      <Route path="/projects/:id" component={ProjectDetails} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatsProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </StatsProvider>
    </QueryClientProvider>
  );
}

export default App;
