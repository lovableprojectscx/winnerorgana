import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Copy, Home, User as UserIcon, Users, LogOut, TrendingUp,
  DollarSign, Loader2, Award, Share2, ChevronRight, Wallet,
  CheckCircle, RefreshCw, Calendar, Sparkles,
  ShoppingBag, Heart, Crown, Settings, MapPin
} from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import type { User, Session } from "@supabase/supabase-js";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { AddressesSection } from "@/components/profile/AddressesSection";

interface ReferralData {
  id: string;
  name: string;
  email: string;
  level: number;
  total_sales: number;
  created_at: string;
  status: string;
}

interface CommissionData {
  id: string;
  amount: number;
  level: number;
  status: string;
  created_at: string;
  order_id: string | null;
}

interface OrderData {
  id: string;
  order_number: string;
  product_name: string;
  amount: number;
  status: string;
  created_at: string;
}

const AreaAfiliado = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState("resumen");
  const { favorites } = useFavorites();
  const [affiliateData, setAffiliateData] = useState<any>(null);
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [commissions, setCommissions] = useState<CommissionData[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [linkCopied, setLinkCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [profileData, setProfileData] = useState({
    nombre: "",
    email: "",
    yape: "",
    affiliateCode: "",
    level: "",
    totalSales: 0,
    totalCommissions: 0,
    referralCount: 0
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (!session) {
          navigate("/login-afiliado");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (!session) {
        navigate("/login-afiliado");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    if (!user) return;
    setIsRefreshing(true);
    await Promise.all([loadAffiliateData(), loadOrders()]);
  };

  const loadOrders = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', user.email)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  const loadAffiliateData = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("affiliates")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setAffiliateData(data);
        setProfileData({
          nombre: data.name || "",
          email: data.email || "",
          yape: data.yape_number || "",
          affiliateCode: data.affiliate_code || "",
          level: data.level || "Bronce",
          totalSales: Number(data.total_sales) || 0,
          totalCommissions: Number(data.total_commissions) || 0,
          referralCount: data.referral_count || 0
        });
      }
    } catch (error: any) {
      console.error("Error loading affiliate:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información del afiliado",
        variant: "destructive",
      });
      await supabase.auth.signOut();
      navigate("/login-afiliado");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadReferrals = useCallback(async () => {
    if (!user || !affiliateData) return;
    try {
      const { data: referralRecords } = await supabase
        .from("referrals")
        .select(`id, level, created_at, referred_id`)
        .eq("referrer_id", affiliateData.id)
        .order("created_at", { ascending: false });

      if (referralRecords && referralRecords.length > 0) {
        const referredIds = referralRecords.map(r => r.referred_id);
        const { data: affiliatesData } = await supabase
          .from("affiliates")
          .select("id, name, email, total_sales, created_at, status")
          .in("id", referredIds);

        if (affiliatesData) {
          const mappedReferrals: ReferralData[] = referralRecords.map(ref => {
            const affiliate = affiliatesData.find(a => a.id === ref.referred_id);
            return {
              id: ref.id,
              name: affiliate?.name || "Desconocido",
              email: affiliate?.email || "",
              level: ref.level,
              total_sales: Number(affiliate?.total_sales) || 0,
              created_at: affiliate?.created_at || ref.created_at,
              status: affiliate?.status || "Activo"
            };
          });
          setReferrals(mappedReferrals);
        }
      } else {
        setReferrals([]);
      }
    } catch (error) {
      console.error("Error loading referrals:", error);
    }
  }, [user, affiliateData]);

  const loadCommissions = useCallback(async () => {
    if (!user || !affiliateData) return;
    try {
      const { data } = await supabase
        .from("commissions")
        .select("*")
        .eq("affiliate_id", affiliateData.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (data) {
        setCommissions(data.map(c => ({ ...c, amount: Number(c.amount) })));
      }
    } catch (error) {
      console.error("Error loading commissions:", error);
    }
  }, [user, affiliateData]);

  useEffect(() => {
    if (affiliateData) {
      loadReferrals();
      loadCommissions();
    }
  }, [affiliateData, loadReferrals, loadCommissions]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({ title: "Sesión cerrada", description: "Has cerrado sesión correctamente" });
      navigate("/login-afiliado");
    } catch (error: any) {
      toast({ title: "Error", description: "No se pudo cerrar la sesión", variant: "destructive" });
    }
  };

  const handleSaveProfile = async () => {
    if (!affiliateData) return;
    if (!profileData.nombre.trim()) {
      toast({ title: "Error", description: "El nombre es requerido", variant: "destructive" });
      return;
    }
    if (!profileData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      toast({ title: "Error", description: "Por favor ingresa un email válido", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("affiliates")
        .update({
          name: profileData.nombre.trim(),
          email: profileData.email.trim(),
          yape_number: profileData.yape.trim() || null,
        })
        .eq("id", affiliateData.id);

      if (error) throw error;
      await loadAffiliateData();
      toast({ title: "¡Perfil actualizado!", description: "Tus cambios han sido guardados exitosamente" });
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({ title: "Error", description: "No se pudo actualizar el perfil.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const getReferralLink = () => {
    return `${window.location.origin}/registro-afiliado?ref=${profileData.affiliateCode}`;
  };

  const copyToClipboard = async (text: string, type: 'link' | 'code') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'link') {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      } else {
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
      }
      toast({ title: "¡Copiado!", description: type === 'link' ? "Enlace copiado" : "Código copiado" });
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast({ title: "¡Copiado!", description: type === 'link' ? "Enlace copiado" : "Código copiado" });
    }
  };

  const shareOnWhatsApp = () => {
    const message = `¡Únete al programa de afiliados de Winner Organa!\n\nUsa mi código: *${profileData.affiliateCode}*\n\nGana comisiones del 10% en ventas directas.\n\nRegístrate aquí: ${getReferralLink()}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getReferralLink())}`, "_blank", "width=600,height=400");
  };

  // Light Theme Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100 }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-t-2 border-b-2 border-amber-500 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-amber-500" />
          </div>
        </div>
        <p className="text-gray-500 font-medium tracking-wide animate-pulse text-sm uppercase">Cargando...</p>
      </div>
    );
  }

  const level1Referrals = referrals.filter(r => r.level === 1);
  const pendingCommissions = commissions.filter(c => c.status === "pending").reduce((acc, c) => acc + c.amount, 0);

  const stats = [
    {
      title: "COMISIONES TOTALES",
      value: `S/ ${profileData.totalCommissions.toFixed(2)}`,
      subtitle: `S/ ${pendingCommissions.toFixed(2)} por cobrar`,
      icon: <Wallet className="w-6 h-6" />,
      text: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100"
    },
    {
      title: "VENTAS DIRECTAS",
      value: `S/ ${profileData.totalSales.toFixed(2)}`,
      subtitle: `${level1Referrals.length} socios directos`,
      icon: <TrendingUp className="w-6 h-6" />,
      text: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100"
    },
    {
      title: "RED DE IMPERIO",
      value: referrals.length.toString(),
      subtitle: "Socios en tu organización",
      icon: <Users className="w-6 h-6" />,
      text: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-100"
    },
    {
      title: "RANGO ACTUAL",
      value: profileData.level.toUpperCase(),
      subtitle: "Próximo objetivo: S/ 15,000",
      icon: <Crown className="w-6 h-6" />,
      text: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100"
    }
  ];

  /* 
   * Professional Card Component 
   * Clean white background with subtle shadow
   */
  const InfoCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <motion.div
      variants={itemVariants}
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );

  const renderResumen = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Welcome Banner */}
      <motion.div variants={itemVariants} className="relative rounded-3xl overflow-hidden p-8 border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left z-10">
            <Badge className="mb-3 bg-amber-100 text-amber-700 border-amber-200 px-3 py-1 hover:bg-amber-200 transition-colors">
              PANEL DE CONTROL PROFESIONAL
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 font-serif tracking-tight">
              Bienvenido, {profileData.nombre.split(' ')[0]}
            </h2>
            <p className="text-gray-500 max-w-xl">
              Tu imperio digital está creciendo. Gestiona tu red, monitorea tus comisiones y escala tu negocio al siguiente nivel.
            </p>
          </div>
          <div className="flex gap-3 z-10">
            <Button
              onClick={shareOnWhatsApp}
              className="bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Invitar
            </Button>
            <Button
              variant="outline"
              className="border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
              onClick={() => setActiveSection('mi-red')}
            >
              Ver Mi Red
            </Button>
          </div>

          {/* Subtle background decoration */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <InfoCard key={index} className="group">
            <div className="p-6 relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.text} border ${stat.border}`}>
                  {stat.icon}
                </div>
                {index === 3 && <Sparkles className="w-5 h-5 text-amber-500" />}
              </div>
              <p className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-1">
                {stat.title}
              </p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1 tracking-tight">
                {stat.value}
              </p>
              <div className={`text-xs font-medium ${stat.text} flex items-center gap-1 bg-white/50 w-fit px-2 py-1 rounded-full`}>
                {stat.subtitle}
              </div>
            </div>
          </InfoCard>
        ))}
      </div>

      {/* Affiliate Link & Code Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        <InfoCard className="lg:col-span-2">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Tu Enlace de Poder</h3>
                <p className="text-sm text-gray-500">Comparte este enlace para expandir tu red automáticamente.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative group">
                <div className="h-12 bg-gray-50 border border-gray-200 rounded-lg flex items-center px-4 text-gray-600 font-mono text-sm truncate relative z-10 shadow-inner">
                  {getReferralLink()}
                </div>
              </div>
              <Button
                onClick={() => copyToClipboard(getReferralLink(), 'link')}
                className={`h-12 px-6 font-medium transition-all ${linkCopied ? 'bg-green-600 text-white' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
              >
                {linkCopied ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {linkCopied ? "Copiado" : "Copiar"}
              </Button>
            </div>

            <div className="mt-6 flex gap-3">
              <Button onClick={shareOnWhatsApp} variant="outline" className="flex-1 border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 hover:border-green-300">
                WhatsApp
              </Button>
              <Button onClick={shareOnFacebook} variant="outline" className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300">
                Facebook
              </Button>
            </div>
          </div>
        </InfoCard>

        <InfoCard className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-white border-amber-100">
          <div className="p-6 flex flex-col items-center text-center h-full justify-center relative z-10">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 p-[2px] mb-4 shadow-lg shadow-amber-200">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <Crown className="w-8 h-8 text-amber-500" />
              </div>
            </div>

            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Tu Código Élite</h3>
            <div
              onClick={() => copyToClipboard(profileData.affiliateCode, 'code')}
              className="text-3xl font-black text-gray-900 cursor-pointer hover:scale-105 transition-transform font-mono tracking-tight"
            >
              {profileData.affiliateCode}
            </div>
            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1 font-medium cursor-pointer" onClick={() => copyToClipboard(profileData.affiliateCode, 'code')}>
              {codeCopied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              Click para copiar
            </p>
          </div>
        </InfoCard>
      </div>

      {/* Commission Structure */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-amber-600" />
          Plan de Compensación
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { level: 1, rate: "10%", name: "Vendedor Directo", color: "text-green-600", bg: "bg-green-50", border: "border-green-100" },
            { level: 2, rate: "4%", name: "Mentor Directo", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
            { level: 3, rate: "2%", name: "Líder de Equipo", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
            { level: 4, rate: "2%", name: "Desarrollador", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
            { level: 5, rate: "1%", name: "Expansor", color: "text-pink-600", bg: "bg-pink-50", border: "border-pink-100" },
            { level: 6, rate: "1%", name: "Consolidador", color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-100" },
            { level: 7, rate: "1%", name: "Embajador", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
          ].map((item) => (
            <InfoCard key={item.level} className={`p-4 text-center group hover:shadow-md transition-all`}>
              <div className={`text-2xl font-bold ${item.color} mb-1`}>{item.rate}</div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Nivel {item.level}</div>
              <div className="text-xs text-gray-600 leading-tight font-medium">{item.name}</div>
            </InfoCard>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <InfoCard className="p-0 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Movimientos Recientes
          </h3>
          <Button variant="ghost" size="sm" onClick={loadAllData} className="text-gray-400 hover:text-gray-900">
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="p-2">
          {commissions.length > 0 ? (
            <div className="space-y-1">
              {commissions.slice(0, 5).map((commission) => (
                <div key={commission.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium text-sm">Comisión Nivel {commission.level}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(commission.created_at).toLocaleDateString("es-PE", { dateStyle: 'medium' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-600 font-bold">+S/ {commission.amount.toFixed(2)}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${commission.status === 'paid'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}>
                      {commission.status === "paid" ? "Pagado" : "Pendiente"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400">
              <p>Aún no hay movimientos registrados.</p>
            </div>
          )}
        </div>
      </InfoCard>
    </motion.div>
  );

  const renderPerfil = () => (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-2xl mx-auto">
      <InfoCard className="p-8">
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 p-[2px]">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-amber-600" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tu Perfil Profesional</h2>
            <p className="text-gray-500 text-sm">Gestiona tu identidad en la plataforma.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs uppercase text-gray-500 font-bold tracking-wider">Nombre Completo</Label>
              <Input
                value={profileData.nombre}
                onChange={(e) => setProfileData({ ...profileData, nombre: e.target.value })}
                className="bg-gray-50 border-gray-200 text-gray-900 h-12 pl-4 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase text-gray-500 font-bold tracking-wider">Correo Electrónico</Label>
              <Input
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="bg-gray-50 border-gray-200 text-gray-900 h-12 pl-4 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase text-gray-500 font-bold tracking-wider flex items-center justify-between">
              <span>Método de Pago (Yape)</span>
              <span className="text-amber-600 text-[10px] font-medium">Para recibir tus comisiones</span>
            </Label>
            <Input
              value={profileData.yape}
              onChange={(e) => setProfileData({ ...profileData, yape: e.target.value })}
              placeholder="Ingresa tu número"
              className="bg-gray-50 border-gray-200 text-gray-900 h-12 pl-4 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <Button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white font-bold text-lg shadow-lg shadow-amber-900/10"
          >
            {isSaving ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle className="mr-2 w-5 h-5" />}
            Guardar Cambios
          </Button>
        </div>
      </InfoCard>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-amber-100 selection:text-amber-900">
      <Header />

      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">

        {/* Sidebar Navigation */}
        <aside className="md:w-64 shrink-0 space-y-4">
          {/* Profile Card Mini */}
          <InfoCard className="p-6 text-center">
            <div className="w-20 h-20 mx-auto rounded-full p-[2px] bg-gradient-to-tr from-amber-400 to-amber-600 shadow-md mb-4">
              <div className="w-full h-full rounded-full bg-white overflow-hidden relative">
                {user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-xl font-bold text-amber-600">
                      {profileData.nombre.charAt(0) || "U"}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <h3 className="font-bold text-gray-900 truncate text-lg">{profileData.nombre || "Usuario"}</h3>
            <Badge variant="outline" className="mt-2 border-amber-200 text-amber-700 bg-amber-50 font-medium">
              {profileData.level}
            </Badge>
          </InfoCard>

          {/* Navigation Menu */}
          <nav className="space-y-1">
            {[
              { id: 'resumen', label: 'Resumen', icon: Home },
              { id: 'mi-red', label: 'Mi Red', icon: Users, badge: referrals.length },
              { id: 'perfil', label: 'Mi Perfil', icon: Settings },
              { id: 'mis-compras', label: 'Mis Compras', icon: ShoppingBag, badge: orders.length },
              { id: 'mis-direcciones', label: 'Mis Direcciones', icon: MapPin },
              { id: 'favoritos', label: 'Favoritos', icon: Heart, badge: favorites.size }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 font-medium ${activeSection === item.id
                  ? 'bg-amber-100 text-amber-900 shadow-sm'
                  : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${activeSection === item.id ? 'text-amber-600' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeSection === item.id ? 'bg-amber-200 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>
                    {item.badge}
                  </span>
                ) : (
                  <ChevronRight className={`w-4 h-4 text-gray-300 ${activeSection === item.id ? 'opacity-100 text-amber-500' : 'opacity-0'}`} />
                )}
              </button>
            ))}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors mt-8 group font-medium"
            >
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Cerrar Sesión</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {activeSection === "resumen" && renderResumen()}
            {activeSection === "perfil" && renderPerfil()}
            {activeSection === "mis-direcciones" && (
              <motion.div variants={containerVariants} initial="hidden" animate="visible">
                <AddressesSection />
              </motion.div>
            )}
            {activeSection === "mi-red" && (
              <motion.div variants={containerVariants} initial="hidden" animate="visible">
                <InfoCard className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Users className="text-purple-600" /> Mi Red de Afiliados
                  </h2>
                  {referrals.length > 0 ? (
                    <div className="space-y-3">
                      {referrals.map(referral => (
                        <div key={referral.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm">
                              {referral.name.charAt(0)}
                            </div>
                            <div className="text-center md:text-left">
                              <p className="font-bold text-gray-900">{referral.name}</p>
                              <p className="text-xs text-gray-500">{referral.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge className="bg-purple-100 text-purple-700 border-purple-200">Nivel {referral.level}</Badge>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Ventas Totales</p>
                              <p className="font-bold text-emerald-600">S/ {referral.total_sales.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-10" />
                      <p>Aún no tienes socios en tu red.</p>
                    </div>
                  )}
                </InfoCard>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

      </div>
      <Footer />
    </div>
  );
};

export default AreaAfiliado;
