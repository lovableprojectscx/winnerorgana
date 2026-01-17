import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroProducts from "@/assets/hero-products.jpg";
import { ArrowRight, Leaf, Award, TrendingUp } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const Hero = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const yBackground = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const opacityText = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-b from-background via-background to-secondary/20">
      {/* Subtle decorative elements with Parallax */}
      <motion.div style={{ y: yBackground }} className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/3 rounded-full blur-3xl" />
      </motion.div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left Content */}
          <motion.div
            style={{ y: yText, opacity: opacityText }}
            className="order-1 lg:order-1 text-center lg:text-left pt-8 sm:pt-12 lg:pt-0"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <Leaf className="w-4 h-4" />
              100% Orgánico del Perú
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-lora font-bold text-foreground mb-6 leading-[1.1]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              La Pureza del{" "}
              <span className="text-accent">Origen</span>{" "}
              <br className="hidden sm:block" />
              <span className="text-primary">la Fuerza</span> de tu Negocio
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Productos que nacen de la tierra peruana. Únete a nuestra comunidad de emprendedores y{" "}
              <span className="text-accent font-semibold">construye tu independencia financiera</span>.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Button
                variant="gold"
                size="xl"
                className="group text-base sm:text-lg"
                asChild
              >
                <Link to="/programa-afiliados">
                  Comenzar a Emprender
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <Button
                variant="outline"
                size="xl"
                className="border-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground text-base sm:text-lg font-semibold transition-all duration-300"
                asChild
              >
                <Link to="/catalogo">
                  Ver Productos
                </Link>
              </Button>
            </motion.div>

            {/* Mini Stats */}
            <motion.div
              className="flex flex-wrap justify-center lg:justify-start gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              {[
                { icon: TrendingUp, value: "21%", label: "Comisión" },
                { icon: Award, value: "100%", label: "Orgánico" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right - Product Image */}
          <motion.div
            style={{ y: yBackground }}
            className="order-2 lg:order-2 relative mt-8 lg:mt-0 pb-8 sm:pb-0"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="relative">
              {/* Glow effect behind image */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-primary/10 to-transparent rounded-3xl blur-2xl scale-110" />

              {/* Main product image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-border/50">
                <img
                  src={heroProducts}
                  alt="Superfoods orgánicos peruanos - Quinoa, Maca, Aguaymanto"
                  className="w-full h-auto object-cover"
                />

                {/* Subtle overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent" />
              </div>

              {/* Floating badges */}
              <motion.div
                className="absolute -top-4 -right-4 sm:top-4 sm:right-4 bg-white shadow-lg rounded-2xl px-4 py-3 border border-border/50"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Leaf className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Certificado</p>
                    <p className="text-sm font-semibold text-foreground">Orgánico</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -left-4 sm:bottom-4 sm:left-4 bg-white shadow-lg rounded-2xl px-4 py-3 border border-border/50"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Gana hasta</p>
                    <p className="text-sm font-semibold text-accent">21% Comisión</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
