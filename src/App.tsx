import {
  Switch,
  Route,
  Router as WouterRouter,
  useLocation,
  Redirect,
} from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Layout } from "@/components/Layout";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import HomePage from "@/pages/home";
import BookDetailPage from "@/pages/book-detail";
import BookFormPage from "@/pages/book-form";
import DashboardPage from "@/pages/dashboard";
import ProfilePage from "@/pages/profile";
import NotFound from "@/pages/not-found";
import { FullPageLoading } from "@/components/LoadingState";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function ProtectedRoute({
  component: Component,
  ...props
}: {
  component: React.ComponentType<Record<string, unknown>>;
  [key: string]: unknown;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return <FullPageLoading label="Sincronizando sesión" />;
  }
  if (!isAuthenticated) return <Redirect to="/login" />;
  return (
    <Layout>
      <Component {...props} />
    </Layout>
  );
}

function GuestRoute({
  component: Component,
}: {
  component: React.ComponentType;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return <FullPageLoading label="Comprobando acceso" />;
  }
  if (isAuthenticated) return <Redirect to="/" />;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login">
        <GuestRoute component={LoginPage} />
      </Route>
      <Route path="/register">
        <GuestRoute component={RegisterPage} />
      </Route>
      <Route path="/">
        <ProtectedRoute
          component={HomePage as React.ComponentType<Record<string, unknown>>}
        />
      </Route>
      <Route path="/books/new">
        <ProtectedRoute component={() => <BookFormPage mode="create" />} />
      </Route>
      <Route path="/books/:id/edit">
        <ProtectedRoute component={() => <BookFormPage mode="edit" />} />
      </Route>
      <Route path="/books/:id">
        <ProtectedRoute
          component={
            BookDetailPage as React.ComponentType<Record<string, unknown>>
          }
        />
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute
          component={
            DashboardPage as React.ComponentType<Record<string, unknown>>
          }
        />
      </Route>
      <Route path="/profile">
        <ProtectedRoute
          component={
            ProfilePage as React.ComponentType<Record<string, unknown>>
          }
        />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AuthProvider>
            <WouterRouter base="/">
              <Router />
            </WouterRouter>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
