import { useEffect, useRef, useState } from "react";
import { Rocket, Handshake, Star } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Rocket,
      title: "Tu Negocio, Tu Libertad",
      description: "Gestiona tus ventas, comisiones y equipo desde un panel de control intuitivo y poderoso. Trabaja a tu ritmo, desde donde quieras."
    },
    {
      icon: Handshake,
      title: "Comunidad y Crecimiento",
      description: "Accede a capacitaciones constantes y forma parte de una comunidad de emprendedores que, como tú, buscan el éxito."
    },
    {
      icon: Star,
      title: "Calidad que Inspira Confianza",
      description: "Ofrece productos cuya historia y calidad hablan por sí solas. Vender es fácil cuando crees en lo que ofreces."
    }
  ];

  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
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
    <section ref={sectionRef} className="py-12 md:py-20 bg-gradient-to-br from-background via-white to-muted/20 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-10 right-10 w-32 md:w-64 h-32 md:h-64 bg-accent/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-32 md:w-64 h-32 md:h-64 bg-primary/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`text-center space-y-4 md:space-y-6 group transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div className="flex justify-center relative">
                <div className="relative group-hover:scale-110 transition-all duration-500 p-6 rounded-full bg-primary/5 group-hover:bg-primary/10">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
                  <feature.icon className="w-12 h-12 md:w-16 md:h-16 text-primary relative z-10" strokeWidth={1.5} />
                </div>
              </div>

              <h3 className="text-xl md:text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                {feature.title}
              </h3>

              <p className="text-sm md:text-base text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300 px-2">
                {feature.description}
              </p>

              {/* Decorative Line */}
              <div className="w-0 h-1 bg-gradient-to-r from-primary via-accent to-primary mx-auto group-hover:w-16 md:group-hover:w-20 transition-all duration-500 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
