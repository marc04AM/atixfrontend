import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { LoadingSpinner } from "./components/LoadingSpinner";
import LoginPage from "./pages/LoginPage";

// Lazy load pages for code splitting
const Dashboard = lazy(() => import("./pages/Dashboard"));
const TicketsPage = lazy(() => import("./pages/TicketsPage"));
const TicketDetailPage = lazy(() => import("./pages/TicketDetailPage"));
const WorksPage = lazy(() => import("./pages/WorksPage"));
const WorkDetailPage = lazy(() => import("./pages/WorkDetailPage"));
const CreateWorkPage = lazy(() => import("./pages/CreateWorkPage"));
const UsersPage = lazy(() => import("./pages/UsersPage"));
const ClientsPage = lazy(() => import("./pages/ClientsPage"));
const ClientDetailPage = lazy(() => import("./pages/ClientDetailPage"));
const PlantsPage = lazy(() => import("./pages/PlantsPage"));
const PlantDetailPage = lazy(() => import("./pages/PlantDetailPage"));
const WorksiteReferencesPage = lazy(() => import("./pages/WorksiteReferencesPage"));
const WorksiteReferenceDetailPage = lazy(() => import("./pages/WorksiteReferenceDetailPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Suspense fallback={<LoadingSpinner />}>
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/tickets" element={<TicketsPage />} />
                          <Route path="/tickets/:id" element={<TicketDetailPage />} />
                          <Route path="/works" element={<WorksPage />} />
                          <Route path="/works/new" element={<CreateWorkPage />} />
                          <Route path="/works/:id" element={<WorkDetailPage />} />
                          <Route path="/users" element={<UsersPage />} />
                          <Route path="/clients" element={<ClientsPage />} />
                          <Route path="/clients/:id" element={<ClientDetailPage />} />
                          <Route path="/plants" element={<PlantsPage />} />
                          <Route path="/plants/:id" element={<PlantDetailPage />} />
                          <Route path="/worksite-references" element={<WorksiteReferencesPage />} />
                          <Route path="/worksite-references/:id" element={<WorksiteReferenceDetailPage />} />
                          <Route path="/profile" element={<ProfilePage />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Suspense>
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
