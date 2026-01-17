import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4 text-primary">404</h1>
          <h2 className="text-2xl font-bold mb-4 text-foreground">¡Oops! Página no encontrada</h2>
          <p className="text-muted-foreground mb-8">
            La página que buscas no existe o ha sido movida.
          </p>
          <Button variant="hero" size="lg" asChild>
            <Link to="/">Volver al Inicio</Link>
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
