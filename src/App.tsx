
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AzureSqlMappingProvider } from "@/components/AzureSqlMappingProvider";
import Mapping from "./pages/Mapping";
import Lineage from "./pages/Lineage";
import MetadataManagement from "./pages/MetadataManagement";
import NotFound from "./pages/NotFound";
import { Sidebar } from "@/components/ui/sidebar";
import { Navigation } from "@/components/Navigation";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex min-h-screen">
          <Navigation />
          <main className="flex-1">
            <Routes>
              <Route 
                path="/" 
                element={
                  <AzureSqlMappingProvider>
                    <Mapping />
                  </AzureSqlMappingProvider>
                } 
              />
              <Route 
                path="/mapping" 
                element={
                  <AzureSqlMappingProvider>
                    <Mapping />
                  </AzureSqlMappingProvider>
                } 
              />
              <Route 
                path="/lineage" 
                element={
                  <AzureSqlMappingProvider>
                    <Lineage />
                  </AzureSqlMappingProvider>
                } 
              />
              <Route path="/metadata" element={<MetadataManagement />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
