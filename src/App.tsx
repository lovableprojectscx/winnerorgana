import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Catalogo from "./pages/Catalogo";
import ProductDetailPage from "./pages/ProductDetailPage";
import Checkout from "./pages/Checkout";
import ProgramaAfiliados from "./pages/ProgramaAfiliados";
import Contacto from "./pages/Contacto";
import AreaAfiliado from "./pages/AreaAfiliado";
import RegistroAfiliado from "./pages/RegistroAfiliado";
import LoginAfiliado from "./pages/LoginAfiliado";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import MiBilletera from "./pages/MiBilletera";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/catalogo/:id" element={<ProductDetailPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/programa-afiliados" element={<ProgramaAfiliados />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/area-afiliado" element={<AreaAfiliado />} />
          <Route path="/registro-afiliado" element={<RegistroAfiliado />} />
          <Route path="/login-afiliado" element={<LoginAfiliado />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/mi-billetera" element={<MiBilletera />} />

          {/* Legal docs are shown in an in-page panel from the footer */}
          <Route path="/terminos-condiciones" element={<Navigate to="/" replace />} />
          <Route path="/politica-privacidad" element={<Navigate to="/" replace />} />
          <Route path="/politica-devoluciones" element={<Navigate to="/" replace />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

