import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CommissionPyramid from "@/components/CommissionPyramid";
import {
  Sparkles, TrendingUp, Users, DollarSign, Award,
  CheckCircle, Zap, Gift, Wallet, ArrowRight, Star,
  Calculator, LucideIcon, Network, Edit, Share2
} from "lucide-react";
import { Link } from "react-router-dom";
import affiliateHeroBg from "@/assets/affiliate-hero-bg.jpg";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { Slider } from "@/components/ui/slider";

// Component for consistent section headings
const SectionHeader = ({ badge, title, subtitle }: { badge: string, title: React.ReactNode, subtitle?: string }) => (
  <div className="text-center mb-16 space-y-4">
    <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 px-4 py-1.5 rounded-full">
      <Sparkles className="w-3.5 h-3.5 text-accent" />
      <span className="text-xs font-bold text-accent tracking-[0.2em] uppercase">{badge}</span>
    </div>
    <h2 className="text-3xl md:text-5xl font-bold font-serif text-[#1a472a] leading-tight">
      {title}
    </h2>
    {subtitle && (
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
        {subtitle}
      </p>
    )}
  </div>
);

// Component for Glassy Cards
const BenefitCard = ({ icon: Icon, title, description, delay }: { icon: LucideIcon, title: string, description: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="group relative"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-[2rem] shadow-lg transform transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-xl border border-gray-100" />
    <div className="relative p-8 flex flex-col items-start h-full">
      <div className="w-14 h-14 rounded-2xl bg-[#1a472a]/5 flex items-center justify-center mb-6 group-hover:bg-[#1a472a] transition-colors duration-500">
        <Icon className="w-7 h-7 text-[#1a472a] group-hover:text-white transition-colors duration-500" />
      </div>
      <h3 className="text-xl font-bold text-[#1a472a] mb-3 font-serif">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

const ProgramaAfiliados = () => {
  // Parallax Setup
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const yHero = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  // Calculator State
  const [personalSales, setPersonalSales] = useState([500]); // S/ 500
  const [teamSize, setTeamSize] = useState([5]); // 5 personas

  // Simple projection logic (Example) - can be refined
  // Base commission 21% is max, but let's average for projection
  // Direct sales * 21% + (Team Size * Avg Sales (400) * Avg Commission (4%))
  const projectedEarnings = Math.floor(
    (personalSales[0] * 0.25) + (teamSize[0] * 400 * 0.05)
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Header />

      {/* 1. Hero Section - Premium & Parallax */}
      <section ref={heroRef} className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: yHero }} className="absolute inset-0 z-0 scale-110">
          <img src={affiliateHeroBg} alt="Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#0f2918]/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-black/20" />
        </motion.div>

        <div className="container relative z-10 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto space-y-8"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2 rounded-full shadow-2xl">
              <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-bold text-white tracking-widest uppercase">Sistema Multinivel 7-Niveles</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white font-serif tracking-tight leading-[1.1] drop-shadow-lg">
              Construye Tu <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200">
                Imperio Digital
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 font-light max-w-2xl mx-auto leading-relaxed">
              Transforma tu influencia en ingresos pasivos. Gana hasta un <strong className="text-amber-400 font-bold">21% en comisiones</strong> recomendando productos que cambian vidas.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link to="/registro-afiliado">
                <Button size="xl" className="h-12 px-8 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-base font-bold shadow-lg hover:shadow-amber-500/25 transition-all hover:scale-105">
                  Comenzar Ahora <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login-afiliado">
                <Button size="xl" className="h-12 px-8 rounded-full bg-white text-[#1a472a] hover:bg-gray-100/90 text-base font-bold shadow-lg transition-all hover:scale-105 border-none">
                  Ya soy Afiliado
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Interactive Calculator Section (The "Surprise") */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <SectionHeader
            badge="Proyección de Éxito"
            title={<>Calcula tu <span className="text-accent">Potencial</span></>}
            subtitle="Juega con los números y descubre cuánto puedes ganar mensualemente construyendo tu red."
          />

          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden grid lg:grid-cols-12">
              {/* Controls */}
              <div className="lg:col-span-7 p-8 md:p-12 space-y-10">
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <label className="text-lg font-bold text-[#1a472a] flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-accent" /> Ventas Personales (Mensual)
                    </label>
                    <span className="text-2xl font-bold text-accent font-serif">S/ {personalSales[0]}</span>
                  </div>
                  <Slider
                    value={personalSales}
                    onValueChange={setPersonalSales}
                    max={5000}
                    step={100}
                    className="py-4"
                  />
                  <p className="text-sm text-muted-foreground">Desliza para estimar cuánto venderás tú directamente.</p>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <label className="text-lg font-bold text-[#1a472a] flex items-center gap-2">
                      <Users className="w-5 h-5 text-accent" /> Tamaño de tu Equipo
                    </label>
                    <span className="text-2xl font-bold text-accent font-serif">{teamSize[0]} personas</span>
                  </div>
                  <Slider
                    value={teamSize}
                    onValueChange={setTeamSize}
                    max={200}
                    step={1}
                    className="py-4"
                  />
                  <p className="text-sm text-muted-foreground">Estimación de personas activas en tu red (Nivel 1-7).</p>
                </div>
              </div>

              {/* Result */}
              <div className="lg:col-span-5 bg-[#1a472a] text-white p-8 md:p-12 flex flex-col justify-center items-center text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />

                <div className="relative z-10 space-y-2">
                  <p className="text-accent font-bold tracking-widest uppercase text-sm">Ganancia Mensual Estimada</p>
                  <div className="text-5xl md:text-6xl font-bold font-serif my-6 tabular-nums tracking-tight">
                    S/ {projectedEarnings.toLocaleString()}
                  </div>
                  <p className="text-white/70 text-sm max-w-xs mx-auto">
                    *Esta es una proyección basada en promedios del mercado. Tus resultados dependerán de tu esfuerzo.
                  </p>

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Benefits Grid - Glassmorphism */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <SectionHeader
            badge="Ventajas Winner Organa"
            title="Por Qué Elegirnos"
            subtitle="No solo vendemos productos, vendemos un estilo de vida libre y saludable."
          />

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <BenefitCard
              icon={Gift}
              title="Cero Riesgo"
              description="Registro 100% gratuito. No necesitas comprar stock ni pagar membresías mensuales. Empiezas a ganar desde la primera venta."
              delay={0.1}
            />
            <BenefitCard
              icon={TrendingUp}
              title="Altas Comisiones"
              description="Hasta un 21% de ganancias residuales. Nuestro plan de compensación es uno de los más agresivos y justos del mercado."
              delay={0.2}
            />
            <BenefitCard
              icon={Wallet}
              title="Pagos Semanales"
              description="Olvídate de esperar a fin de mes. Recibe tus comisiones cada semana directamente en tu cuenta o Yape."
              delay={0.3}
            />
            <BenefitCard
              icon={Network}
              title="7 Niveles de Profundidad"
              description="Gana no solo por tu trabajo, sino por el liderazgo que ejerces sobre tu equipo hasta 7 generaciones."
              delay={0.4}
            />
            <BenefitCard
              icon={Award}
              title="Productos Premium"
              description="Vende con confianza. Nuestros productos tienen certificaciones orgánicas y miles de testimonios positivos."
              delay={0.5}
            />
            <BenefitCard
              icon={Zap}
              title="Tecnología de Punta"
              description="Accede a un Dashboard profesional para ver tus estadísticas, red y comisiones en tiempo real."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* 4. Commission Pyramid Section - Refined */}
      <section className="py-24 bg-gradient-to-b from-[#FDFBF7] to-white relative">
        <div className="container mx-auto px-4">
          <SectionHeader
            badge="Plan de Compensación"
            title="Estructura de Ganancias"
          />
          <CommissionPyramid />
        </div>
      </section>

      {/* 5. Process Steps - Clean Design */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <SectionHeader
            badge="Ruta al Éxito"
            title="Tu Camino en 3 Pasos"
          />

          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-gray-200 via-accent/50 to-gray-200" />

            {[
              { title: "Regístrate", desc: "Completa tus datos en 2 min", step: "01" },
              { title: "Comparte", desc: "Usa tu link único", step: "02" },
              { title: "Cobra", desc: "Recibe pagos semanales", step: "03" }
            ].map((item, idx) => (
              <div key={idx} className="relative flex flex-col items-center text-center group">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-[#FDFBF7] shadow-xl flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform duration-500">
                  <span className="text-3xl font-bold text-accent font-serif">{item.step}</span>
                </div>
                <h3 className="text-2xl font-bold text-[#1a472a] mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProgramaAfiliados;
