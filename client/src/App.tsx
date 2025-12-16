import { Switch, Route, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import NotFound from "@/pages/not-found";
import Onboarding from "@/pages/onboarding";
import Dashboard from "@/pages/dashboard";
import Practice from "@/pages/practice";
import Phase from "@/pages/phase";
import Songs from "@/pages/songs";
import Perform from "@/pages/perform";
import Settings from "@/pages/settings";
import type { User } from "@shared/schema";

function MainLayout({ children }: { children: React.ReactNode }) {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar user={user || null} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-4 p-3 border-b shrink-0">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  const [location] = useLocation();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/user"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user && location !== "/") {
    return <Onboarding />;
  }

  if (location === "/" && !user) {
    return <Onboarding />;
  }

  if (location === "/" && user) {
    return (
      <MainLayout>
        <Dashboard />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Switch>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/practice" component={Practice} />
        <Route path="/phase/:id" component={Phase} />
        <Route path="/songs" component={Songs} />
        <Route path="/perform" component={Perform} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
