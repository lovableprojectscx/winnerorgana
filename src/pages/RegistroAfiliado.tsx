import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Gift, CheckCircle, User, CreditCard, Lock, Mail, ChevronRight, Crown } from "lucide-react";
import affiliateBg from "@/assets/affiliate-hero-bg.jpg";
import { motion, AnimatePresence } from "framer-motion";

const RegistroAfiliado = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [referrerInfo, setReferrerInfo] = useState<{ name: string; code: string } | null>(null);

  // Get referral code from URL if present
  const urlReferralCode = searchParams.get("ref") || "";

  const [formData, setFormData] = useState({
    nombre: "",
    dni: "",
    email: "",
    password: "",
    confirmPassword: "",
    yape: "",
    codigoInvitacion: urlReferralCode
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Validate referral code when it changes
    if (field === "codigoInvitacion" && value.length >= 3) {
      validateReferralCode(value);
    } else if (field === "codigoInvitacion" && value.length < 3) {
      setReferrerInfo(null);
    }
  };

  const validateReferralCode = async (code: string) => {
    try {
      const { data, error } = await supabase
        .from("affiliates")
        .select("id, name, affiliate_code")
        .eq("affiliate_code", code.toUpperCase())
        .maybeSingle();

      if (data && !error) {
        setReferrerInfo({ name: data.name, code: data.affiliate_code });
      } else {
        setReferrerInfo(null);
      }
    } catch {
      setReferrerInfo(null);
    }
  };

  const generateAffiliateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "WIN";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Find referrer if code provided
      let referrerId: string | null = null;
      if (formData.codigoInvitacion) {
        const { data: referrer } = await supabase
          .from("affiliates")
          .select("id")
          .eq("affiliate_code", formData.codigoInvitacion.toUpperCase())
          .maybeSingle();

        if (referrer) {
          referrerId = referrer.id;
        }
      }

      // 2. Create Supabase user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/area-afiliado`,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No se pudo crear el usuario");

      // 3. Generate unique affiliate code
      const affiliateCode = generateAffiliateCode();

      // 4. Create affiliate record with referral tracking
      const { data: newAffiliate, error: affiliateError } = await supabase
        .from("affiliates")
        .insert({
          user_id: authData.user.id,
          name: formData.nombre,
          dni: formData.dni,
          email: formData.email,
          affiliate_code: affiliateCode,
          status: "Activo",
          level: "Vendedor Directo",
          total_sales: 0,
          referred_by: referrerId,
          yape_number: formData.yape,
          commission_rate: 10,
          total_commissions: 0,
          referral_count: 0
        })
        .select()
        .single();

      if (affiliateError) throw affiliateError;

      // 5. Create referral record if there's a referrer
      if (referrerId && newAffiliate) {
        // Direct referral (level 1)
        await supabase.from("referrals").insert({
          referrer_id: referrerId,
          referred_id: newAffiliate.id,
          level: 1
        });

        // Update referrer's referral count
        const { data: currentReferrer } = await supabase
          .from("affiliates")
          .select("referral_count")
          .eq("id", referrerId)
          .single();

        if (currentReferrer) {
          await supabase
            .from("affiliates")
            .update({ referral_count: (currentReferrer.referral_count || 0) + 1 })
            .eq("id", referrerId);
        }

        // Check for level 2 referral (referrer's referrer)
        const { data: level2Referrer } = await supabase
          .from("affiliates")
          .select("referred_by")
          .eq("id", referrerId)
          .maybeSingle();

        if (level2Referrer?.referred_by) {
          await supabase.from("referrals").insert({
            referrer_id: level2Referrer.referred_by,
            referred_id: newAffiliate.id,
            level: 2
          });

          // Continue chain for levels 3-7
          let currentReferrerId = level2Referrer.referred_by;
          for (let level = 3; level <= 7; level++) {
            const { data: nextReferrer } = await supabase
              .from("affiliates")
              .select("referred_by")
              .eq("id", currentReferrerId)
              .maybeSingle();

            if (nextReferrer?.referred_by) {
              await supabase.from("referrals").insert({
                referrer_id: nextReferrer.referred_by,
                referred_id: newAffiliate.id,
                level: level
              });
              currentReferrerId = nextReferrer.referred_by;
            } else {
              break;
            }
          }
        }
      }

      toast({
        title: "¡Registro exitoso!",
        description: `Tu código de afiliado es: ${affiliateCode}. Redirigiendo...`,
      });

      setTimeout(() => {
        navigate("/area-afiliado");
      }, 1500);

    } catch (error: any) {
      toast({
        title: "Error en el registro",
        description: error.message || "Ocurrió un error al crear tu cuenta",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative font-sans text-gray-100">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <img
          src={affiliateBg}
          alt="Registration Background"
          className="w-full h-full object-cover grayscale-[20%]"
        />
        <div className="absolute inset-0 bg-[#0f291a]/90 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f291a] via-transparent to-[#1a472a]/60" />
      </div>

      <div className="relative z-10">
        <Header />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 relative z-10 my-8">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-amber-500/20 text-amber-300 border-amber-500/30 px-4 py-1.5 uppercase tracking-widest font-bold text-xs backdrop-blur-sm">
              Únete a la Familia Winner Organa
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold text-white font-serif mb-4 leading-tight">
              Comienza Tu Negocio <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Exitoso Hoy Mismo</span>
            </h1>
            <p className="text-gray-300 font-light max-w-lg mx-auto">
              Regístrate y accede a comisiones exclusivas, herramientas de venta y un sistema de crecimiento probado.
            </p>
          </div>

          <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-lg overflow-hidden ring-1 ring-white/10 relative">
            {/* Decorative decorative gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <CardContent className="p-6 md:p-10 relative z-10">
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Personal Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-white/90 text-xs uppercase font-bold tracking-wide">Nombre Completo</Label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 h-4 w-4" />
                      <Input
                        id="nombre"
                        placeholder="Ej: Juan Pérez"
                        value={formData.nombre}
                        onChange={(e) => handleChange("nombre", e.target.value)}
                        className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-white/20 focus:bg-black/30 transition-all h-11"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dni" className="text-white/90 text-xs uppercase font-bold tracking-wide">DNI</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 h-4 w-4" />
                      <Input
                        id="dni"
                        placeholder="Ej: 12345678"
                        value={formData.dni}
                        onChange={(e) => handleChange("dni", e.target.value.replace(/\D/g, '').slice(0, 8))}
                        className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-white/20 focus:bg-black/30 transition-all h-11"
                        required
                        minLength={8}
                        maxLength={8}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/90 text-xs uppercase font-bold tracking-wide">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu.correo@ejemplo.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-white/20 focus:bg-black/30 transition-all h-11"
                      required
                    />
                  </div>
                </div>

                {/* Password Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white/90 text-xs uppercase font-bold tracking-wide">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 h-4 w-4" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={formData.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                        className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-white/20 focus:bg-black/30 transition-all h-11"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white/90 text-xs uppercase font-bold tracking-wide">Confirmar</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 h-4 w-4" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Repite tu contraseña"
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange("confirmPassword", e.target.value)}
                        className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-white/20 focus:bg-black/30 transition-all h-11"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yape" className="text-white/90 text-xs uppercase font-bold tracking-wide">Número de Yape (para tus pagos)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-xs font-bold">PE</span>
                    <Input
                      id="yape"
                      type="text"
                      placeholder="987 654 321"
                      value={formData.yape}
                      onChange={(e) => handleChange("yape", e.target.value)}
                      className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-white/20 focus:bg-black/30 transition-all h-11"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="codigoInvitacion" className="text-amber-300 text-xs uppercase font-bold tracking-wide flex items-center gap-2">
                    <Gift className="w-3 h-3" /> Código de Invitación (Opcional)
                  </Label>
                  <Input
                    id="codigoInvitacion"
                    type="text"
                    placeholder="Si tienes uno, ingrésalo aquí"
                    value={formData.codigoInvitacion}
                    onChange={(e) => handleChange("codigoInvitacion", e.target.value.toUpperCase())}
                    className="bg-amber-500/10 border-amber-500/30 text-amber-100 placeholder:text-amber-500/40 focus:bg-amber-500/20 focus:border-amber-500 transition-all h-11"
                  />

                  <AnimatePresence>
                    {referrerInfo && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex items-center gap-3 p-3 bg-green-500/20 border border-green-500/30 rounded-lg mt-2"
                      >
                        <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                        <div className="text-sm">
                          <span className="text-green-300 font-light">Invitado por: </span>
                          <span className="font-bold text-white">{referrerInfo.name}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Benefits Pill */}
                <div className="p-4 bg-gradient-to-r from-[#1a472a] to-emerald-900/50 rounded-xl border border-white/5 flex items-start gap-4 shadow-inner">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Crown className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-white text-sm">Sistema de Ganancias Multinivel</p>
                    <p className="text-xs text-green-200 leading-relaxed">
                      Desbloquea hasta un <span className="text-amber-400 font-bold">21%</span> de comisiones totales y construye ingresos pasivos en 7 niveles de profundidad.
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold h-14 rounded-xl shadow-lg shadow-amber-900/40 text-base transform hover:scale-[1.01] transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <span className="flex items-center gap-2">
                      Crear Mi Cuenta Ahora <ChevronRight className="w-5 h-5" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="text-center mt-6">
                <p className="text-sm text-gray-400">
                  ¿Ya eres socio?{" "}
                  <Link to="/login-afiliado" className="text-white hover:text-amber-400 font-medium underline-offset-4 hover:underline transition-colors">
                    Accede a tu cuenta aquí
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

// Add minimal badge component inline if not available or replace with standard div
const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
    {children}
  </div>
);

export default RegistroAfiliado;
