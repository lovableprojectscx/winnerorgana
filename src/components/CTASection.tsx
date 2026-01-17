import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles, TrendingUp, Users, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const CTASection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const yBackground = useTransform(scrollYProgress, [0, 1], ["-40%", "40%"]);

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
    <section ref={sectionRef} className="py-20 md:py-28 relative overflow-hidden">
      {/* Background Image with Parallax Feel */}
      {/* Optimized Hero Image */}
      <motion.div style={{ y: yBackground }} className="absolute inset-0 z-0 scale-150">
        <img
          src="/images/hero-bg.jpg"
          alt="Hero Background"
          className="w-full h-full object-cover object-center"
          fetchPriority="high"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a472a]/95 via-[#1a472a]/90 to-[#0f2918]/90 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
      </motion.div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full mb-8 shadow-lg">
            <Sparkles className="w-3 h-3 text-accent animate-pulse" />
            <span className="text-xs font-bold text-white tracking-[0.2em] uppercase">Movimiento Winner Organa</span>
          </div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 text-white font-serif tracking-tight leading-tight drop-shadow-lg">
            Emprende con el Poder <br className="hidden md:block" /> de la <span className="text-accent relative inline-block">
              Naturaleza
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-accent opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
              </svg>
            </span>
          </h2>

          <p className="text-lg md:text-2xl mb-12 text-gray-100 max-w-3xl mx-auto font-light leading-relaxed drop-shadow-md">
            Convierte tu pasión por un estilo de vida saludable en un negocio rentable.
            <span className="block mt-2 font-medium text-white">Lleva lo mejor del campo peruano a cada hogar y construye tu propia libertad.</span>
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 mb-16 max-w-4xl mx-auto">
            {[
              { icon: Users, label: "Emprendedores", value: "1,000+" },
              { icon: TrendingUp, label: "Ganancias Generadas", value: "+45%" },
              { icon: Sparkles, label: "Productos Exclusivos", value: "50+" }
            ].map((stat, index) => (
              <div
                key={index}
                className={`bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:bg-white/20 transition-all duration-500 hover:-translate-y-1 group ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                style={{ transitionDelay: `${0.3 + index * 0.15}s` }}
              >
                <div className="mb-3 inline-block p-3 bg-black/20 rounded-full group-hover:bg-accent/20 transition-colors duration-300">
                  <stat.icon className="w-6 h-6 text-accent" />
                </div>
                <div className="text-3xl font-bold text-white mb-1 tracking-tight">{stat.value}</div>
                <div className="text-[10px] uppercase tracking-widest text-white/80 font-bold">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`} style={{ transitionDelay: '0.6s' }}>
            <Button
              size="lg"
              className="bg-accent text-primary hover:bg-white hover:text-primary rounded-full px-10 py-7 text-lg font-bold shadow-2xl hover:shadow-accent/50 transition-all duration-300 transform hover:scale-105"
              asChild
            >
              <Link to="/programa-afiliados" className="flex items-center gap-3">
                Únete al Equipo
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <p className="mt-4 text-white/70 text-xs font-medium tracking-wide">
              * Registro gratuito • Capacitación incluida • Sin horarios fijos
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
