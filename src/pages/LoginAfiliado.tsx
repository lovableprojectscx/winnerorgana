import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, Mail, ArrowRight, Sparkles } from "lucide-react";
import affiliateBg from "@/assets/affiliate-hero-bg.jpg";

const LoginAfiliado = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      // Verify the user is an affiliate
      const { data: affiliateData, error: affiliateError } = await supabase
        .from("affiliates")
        .select("id")
        .eq("user_id", data.user.id)
        .single();

      if (affiliateError || !affiliateData) {
        await supabase.auth.signOut();
        throw new Error("No tienes una cuenta de afiliado asociada");
      }

      toast({
        title: "¡Bienvenido de nuevo!",
        description: "Has iniciado sesión correctamente",
      });

      navigate("/area-afiliado");

    } catch (error: any) {
      toast({
        title: "Error al iniciar sesión",
        description: error.message || "Credenciales incorrectas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative font-sans">
      {/* Background Image & Overlay */}
      <div className="fixed inset-0 z-0">
        <img
          src={affiliateBg}
          alt="Affiliate Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0f291a]/80 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f291a] via-transparent to-[#0f291a]/40" />
      </div>

      <div className="relative z-10">
        <Header />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 relative z-10 my-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-widest backdrop-blur-sm mb-4">
              <Sparkles className="w-3 h-3" /> Area Exclusiva
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white font-serif tracking-tight">
              Bienvenido Socio
            </h1>
            <p className="text-gray-200 text-sm md:text-base font-light max-w-xs mx-auto">
              Ingresa a tu panel de control y gestiona tu imperio digital.
            </p>
          </div>

          <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-md overflow-hidden ring-1 ring-white/20">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/90 font-medium text-sm ml-1">
                    Correo Electrónico
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-amber-400 transition-colors h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu.correo@ejemplo.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-amber-500/50 focus:ring-amber-500/20 h-11 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white/90 font-medium text-sm ml-1">
                    Contraseña
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-amber-400 transition-colors h-4 w-4" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-amber-500/50 focus:ring-amber-500/20 h-11 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <a href="#" className="text-xs text-amber-300 hover:text-amber-200 transition-colors hover:underline">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-900/20 border-0 h-12 text-sm font-bold uppercase tracking-wide transition-all transform hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Ingresando...
                    </>
                  ) : (
                    <span className="flex items-center gap-2">
                      Iniciar Sesión <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="text-center mt-8 pt-6 border-t border-white/10">
                <p className="text-sm text-gray-300">
                  ¿Aún no eres parte del equipo?{" "}
                  <Link to="/registro-afiliado" className="text-amber-400 hover:text-amber-300 font-semibold hover:underline transition-colors">
                    Regístrate aquí
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 flex justify-center gap-8 text-white/40">
            {/* Simple footer icons or trust badges could go here if needed */}
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default LoginAfiliado;
