import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import { SplashScreen } from "@/components/SplashScreen";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import CalendarPage from "@/pages/calendar";
import TodosPage from "@/pages/todos";
import GoalsPage from "@/pages/goals";
import WishlistPage from "@/pages/wishlist";
import BucketlistPage from "@/pages/bucketlist";
import SettingsPage from "@/pages/settings";
import MorePage from "@/pages/more";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

function Router() {
  return (
    <AppLayout>
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
    </AppLayout>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem("splashShown");
    if (!hasSeenSplash) {
      setShowSplash(true);
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem("splashShown", "true");
    setShowSplash(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {showSplash ? (
          <SplashScreen onComplete={handleSplashComplete} />
        ) : (
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        )}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
