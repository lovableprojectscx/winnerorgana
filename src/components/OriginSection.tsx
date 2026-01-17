import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf } from "lucide-react";
import workspaceImage from "@/assets/workspace.jpg";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const OriginSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-12 md:py-20 bg-gradient-to-r from-muted/30 via-background to-muted/20 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-0 w-48 md:w-72 h-48 md:h-72 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-0 w-48 md:w-72 h-48 md:h-72 bg-accent/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Image */}
          <div className={`relative transition-all duration-1000 order-2 lg:order-1 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
          }`}>
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-2xl opacity-50"></div>
            <div className="relative overflow-hidden rounded-2xl shadow-2xl group">
              <img 
                src={workspaceImage} 
                alt="Workspace" 
                className="w-full h-auto group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            
            {/* Floating Badge */}
            <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 bg-accent text-accent-foreground px-4 py-3 md:px-6 md:py-4 rounded-2xl shadow-xl animate-float">
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 md:w-6 md:h-6" />
                <div>
                  <p className="text-xs md:text-sm font-medium">100% Natural</p>
                  <p className="text-[10px] md:text-xs opacity-90">Productos Orgánicos</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className={`space-y-4 md:space-y-6 order-1 lg:order-2 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
          }`} style={{ transitionDelay: '200ms' }}>
            <div className="inline-block">
              <span className="text-xs md:text-sm font-medium text-accent bg-accent/10 px-3 py-1.5 md:px-4 md:py-2 rounded-full">
                Nuestra Historia
              </span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground bg-gradient-to-r from-foreground to-primary/70 bg-clip-text">
              Nuestro Origen, Tu Oportunidad
            </h2>
            
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Creemos que los mejores productos vienen de la tierra. Esa misma autenticidad es la base de nuestro 
              modelo de negocio. Te ofrecemos productos de calidad insuperable, respaldados por una plataforma 
              moderna y transparente, para que construyas un negocio tan sólido y natural como nuestro origen.
            </p>
            
            <div className="pt-2 md:pt-4">
              <Button variant="link" className="text-primary p-0 text-base md:text-lg group hover:gap-4 transition-all" asChild>
                <Link to="/programa-afiliados">
                  Descubre cómo empezar
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OriginSection;
