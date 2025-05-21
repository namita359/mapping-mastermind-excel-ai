
import { Routes, Route } from "react-router-dom";
import Mapping from "./pages/Mapping";
import Lineage from "./pages/Lineage";
import NotFound from "./pages/NotFound";
import { Toaster } from "./components/ui/toaster";
import "./App.css";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Mapping />} />
        <Route path="/lineage" element={<Lineage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
