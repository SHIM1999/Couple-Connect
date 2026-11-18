import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LangProvider } from "@/lib/i18n";
import { AppLayout } from "@/components/layout/AppLayout";
import { PwaStatus } from "@/components/PwaStatus";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
const CalendarPage = lazy(() => import("@/pages/calendar"));
const TodosPage = lazy(() => import("@/pages/todos"));
const GoalsPage = lazy(() => import("@/pages/goals"));
const WishlistPage = lazy(() => import("@/pages/wishlist"));
const BucketlistPage = lazy(() => import("@/pages/bucketlist"));
const SettingsPage = lazy(() => import("@/pages/settings"));
const MorePage = lazy(() => import("@/pages/more"));


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (count, error) => {
        const status = (error as Error & { status?: number }).status;
        return !(status && status < 500) && count < 1;
      },
    },
    mutations: { retry: false },
  },
});

function Router() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-6" role="status" aria-label="Loading"><div className="h-24 rounded bg-muted animate-pulse" /></div>}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/calendar" component={CalendarPage} />
        <Route path="/todos" component={TodosPage} />
        <Route path="/goals" component={GoalsPage} />
        <Route path="/wishlist" component={WishlistPage} />
        <Route path="/bucketlist" component={BucketlistPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/more" component={MorePage} />
        <Route component={NotFound} />
      </Switch>
      </Suspense>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LangProvider>
        <PwaStatus />
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </LangProvider>
    </QueryClientProvider>
  );
}

export default App;
