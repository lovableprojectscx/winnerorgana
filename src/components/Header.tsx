import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, Menu } from "lucide-react";
import { CartDrawer } from "./CartDrawer";
import { WinnerPointsDisplay } from "./WinnerPointsDisplay";
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import logoWinnerOrgana from "@/assets/logo-winner-organa.png";

const Header = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: "/catalogo", label: "Catálogo" },
    { to: "/programa-afiliados", label: "Programa de Afiliados" },
    { to: "/contacto", label: "Contacto" },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-xl shadow-elegant border-b border-border/50' 
        : 'bg-white border-b border-border'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src={logoWinnerOrgana} 
              alt="Winner Organa" 
              className="h-12 md:h-14 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link 
                key={link.to}
                to={link.to} 
                className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg ${
                  isActive(link.to) 
                    ? 'text-primary bg-primary/5' 
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                }`}
              >
                {link.label}
                {isActive(link.to) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* WinnerPoints Display */}
            <WinnerPointsDisplay variant="header" />
            
            <Link 
              to="/area-afiliado" 
              className="hidden md:flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-primary/5"
            >
              <User className="w-4 h-4" />
              <span>Mi Cuenta</span>
            </Link>
            
            <CartDrawer />
            
            <Button variant="hero" size="default" asChild className="hidden sm:flex">
              <Link to="/programa-afiliados">Únete Ahora</Link>
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] bg-background border-l border-border">
                <div className="flex items-center gap-2 mb-8 mt-4">
                  <img 
                    src={logoWinnerOrgana} 
                    alt="Winner Organa" 
                    className="h-14 w-auto object-contain"
                  />
                </div>

                <nav className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.to}>
                      <Link 
                        to={link.to} 
                        className={`flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all ${
                          isActive(link.to) 
                            ? 'text-primary bg-primary/10' 
                            : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                  
                  <div className="h-px bg-border my-4" />
                  
                  <SheetClose asChild>
                    <Link 
                      to="/area-afiliado" 
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-base font-medium text-foreground hover:bg-muted transition-all"
                    >
                      <User className="w-5 h-5" />
                      Mi Cuenta
                    </Link>
                  </SheetClose>
                  
                  <SheetClose asChild>
                    <Button variant="hero" size="lg" asChild className="w-full mt-4">
                      <Link to="/programa-afiliados">Únete Ahora</Link>
                    </Button>
                  </SheetClose>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
