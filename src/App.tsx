
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AzureSqlMappingProvider } from "@/components/AzureSqlMappingProvider";
import Mapping from "@/pages/Mapping";
import Lineage from "@/pages/Lineage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AzureSqlMappingProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/mapping" replace />} />
            <Route path="/mapping" element={<Mapping />} />
            <Route path="/lineage" element={<Lineage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </AzureSqlMappingProvider>
    </QueryClientProvider>
  );
}

export default App;
