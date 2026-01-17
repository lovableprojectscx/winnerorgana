import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Copy, Home, User as UserIcon, Users, LogOut, TrendingUp,
  DollarSign, Loader2, Award, Share2, ChevronRight, Wallet,
  CheckCircle, RefreshCw, Calendar, ArrowUpRight, Sparkles,
  ShoppingBag, Package, Truck, Clock, Settings, XCircle,
  ExternalLink, Image as ImageIcon, MapPin, Heart
} from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import type { User, Session } from "@supabase/supabase-js";
import { Badge } from "@/components/ui/badge";

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
  shipping_company: string | null;
  tracking_code: string | null;
  shipping_voucher_url: string | null;
  shipped_at: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
}

const SHIPPING_COMPANIES: Record<string, {
  name: string;
  icon: React.ElementType;
  trackingUrl: string;
  instructions: string[];
}> = {
  olva: {
    name: "Olva Courier",
    icon: Truck,
    trackingUrl: "https://tracking.olvaexpress.pe/",
    instructions: [
      "Copia tu código de seguimiento.",
      "Haz clic en el botón \"Rastrear en Olva\".",
      "En la web de Olva, selecciona el Año actual (ej. 2026).",
      "Pega tu código en la casilla \"Número de Tracking\" y dale a Buscar."
    ]
  },
  shalom: {
    name: "Shalom",
    icon: Truck,
    trackingUrl: "https://rastrea.shalom.pe/login",
    instructions: [
      "Copia tu número de guía.",
      "Haz clic en el botón \"Rastrear en Shalom\".",
      "Si te solicita iniciar sesión, busca la opción de \"Rastreo de Envíos\" o \"Consulta de Guía\".",
      "Ingresa el número de guía sin guiones."
    ]
  }
};

const getOrderStatusConfig = (status: string) => {
  switch (status) {
    case "Pendiente":
      return { icon: Clock, color: "text-yellow-500", bgColor: "bg-yellow-500/10", label: "Pendiente" };
    case "Procesando":
      return { icon: Settings, color: "text-blue-500", bgColor: "bg-blue-500/10", label: "Procesando" };
    case "En Camino":
      return { icon: Truck, color: "text-orange-500", bgColor: "bg-orange-500/10", label: "En Camino" };
    case "Completado":
      return { icon: CheckCircle, color: "text-green-500", bgColor: "bg-green-500/10", label: "Completado" };
    case "Cancelado":
      return { icon: XCircle, color: "text-red-500", bgColor: "bg-red-500/10", label: "Cancelado" };
    default:
      return { icon: Package, color: "text-muted-foreground", bgColor: "bg-muted", label: status };
  }
};

const AreaAfiliado = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState("resumen");
  const { favorites, toggleFavorite } = useFavorites();
  const [favoriteProducts, setFavoriteProducts] = useState<any[]>([]);
  const [affiliateData, setAffiliateData] = useState<any>(null);
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [commissions, setCommissions] = useState<CommissionData[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [voucherDialog, setVoucherDialog] = useState<{ open: boolean; url: string | null }>({ open: false, url: null });
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
        .select(`
          id,
          level,
          created_at,
          referred_id
        `)
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
        setCommissions(data.map(c => ({
          ...c,
          amount: Number(c.amount)
        })));
      }
    } catch (error) {
      console.error("Error loading commissions:", error);
    }
  }, [user, affiliateData]);

  const loadFavoriteProducts = useCallback(async () => {
    if (favorites.size === 0) {
      setFavoriteProducts([]);
      return;
    }

    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .in('id', Array.from(favorites));

      if (data) {
        setFavoriteProducts(data);
      }
    } catch (error) {
      console.error("Error loading favorite products:", error);
    }
  }, [favorites]);

  useEffect(() => {
    if (activeSection === 'favoritos') {
      loadFavoriteProducts();
    }
  }, [activeSection, favorites, loadFavoriteProducts]);

  useEffect(() => {
    if (affiliateData) {
      loadReferrals();
      loadCommissions();
    }
  }, [affiliateData, loadReferrals, loadCommissions]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
      navigate("/login-afiliado");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión",
        variant: "destructive",
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!affiliateData) return;

    // Validation
    if (!profileData.nombre.trim()) {
      toast({
        title: "Error",
        description: "El nombre es requerido",
        variant: "destructive",
      });
      return;
    }

    if (!profileData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      toast({
        title: "Error",
        description: "Por favor ingresa un email válido",
        variant: "destructive",
      });
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

      // Reload affiliate data to confirm changes
      await loadAffiliateData();

      toast({
        title: "¡Perfil actualizado!",
        description: "Tus cambios han sido guardados exitosamente",
      });
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil. Intenta de nuevo.",
        variant: "destructive",
      });
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

      toast({
        title: "¡Copiado!",
        description: type === 'link' ? "Enlace copiado al portapapeles" : "Código copiado al portapapeles",
      });
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      toast({
        title: "¡Copiado!",
        description: type === 'link' ? "Enlace copiado al portapapeles" : "Código copiado al portapapeles",
      });
    }
  };

  const shareOnWhatsApp = () => {
    const message = `¡Únete al programa de afiliados de Winner Organa!

Usa mi código: *${profileData.affiliateCode}*

Gana comisiones del 10% en ventas directas y hasta 21% con 7 niveles de profundidad.

Regístrate aquí: ${getReferralLink()}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getReferralLink())}`, "_blank", "width=600,height=400");
  };

  const shareOnTwitter = () => {
    const text = `¡Únete al programa de afiliados de Winner Organa! Usa mi código ${profileData.affiliateCode}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(getReferralLink())}`, "_blank", "width=600,height=400");
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Oro": return "text-yellow-700 bg-yellow-100 border-yellow-300";
      case "Plata": return "text-gray-700 bg-gray-100 border-gray-300";
      default: return "text-amber-700 bg-amber-100 border-amber-300";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "Activo"
      ? "bg-green-100 text-green-700 border-green-300"
      : "bg-red-100 text-red-700 border-red-300";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Cargando tu área de afiliado...</p>
      </div>
    );
  }

  const level1Referrals = referrals.filter(r => r.level === 1);
  const level2Referrals = referrals.filter(r => r.level === 2);
  const level3Referrals = referrals.filter(r => r.level === 3);
  const level4Referrals = referrals.filter(r => r.level === 4);
  const level5Referrals = referrals.filter(r => r.level === 5);
  const level6Referrals = referrals.filter(r => r.level === 6);
  const level7Referrals = referrals.filter(r => r.level === 7);

  const pendingCommissions = commissions.filter(c => c.status === "pending").reduce((acc, c) => acc + c.amount, 0);
  const paidCommissions = commissions.filter(c => c.status === "paid").reduce((acc, c) => acc + c.amount, 0);

  const stats = [
    {
      title: "COMISIONES TOTALES",
      value: `S/ ${profileData.totalCommissions.toFixed(2)}`,
      subtitle: `S/ ${pendingCommissions.toFixed(2)} pendientes`,
      icon: <Wallet className="w-8 h-8" />,
      color: "bg-gradient-to-br from-green-500 to-emerald-600",
      textColor: "text-white"
    },
    {
      title: "VENTAS DIRECTAS",
      value: `S/ ${profileData.totalSales.toFixed(2)}`,
      subtitle: `${level1Referrals.length} referidos directos`,
      icon: <TrendingUp className="w-8 h-8" />,
      color: "bg-gradient-to-br from-blue-500 to-indigo-600",
      textColor: "text-white"
    },
    {
      title: "RED DE AFILIADOS",
      value: referrals.length.toString(),
      subtitle: `en ${[level1Referrals.length > 0, level2Referrals.length > 0, level3Referrals.length > 0, level4Referrals.length > 0, level5Referrals.length > 0, level6Referrals.length > 0, level7Referrals.length > 0].filter(Boolean).length} niveles`,
      icon: <Users className="w-8 h-8" />,
      color: "bg-gradient-to-br from-purple-500 to-pink-600",
      textColor: "text-white"
    },
    {
      title: "NIVEL ACTUAL",
      value: profileData.level,
      subtitle: "Próxima meta: S/ 15,000",
      icon: <Award className="w-8 h-8" />,
      color: "bg-gradient-to-br from-amber-500 to-orange-600",
      textColor: "text-white"
    }
  ];

  const renderResumen = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className={`relative overflow-hidden ${stat.color} border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-6 text-white">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  {stat.icon}
                </div>
                <Sparkles className="w-5 h-5 opacity-50" />
              </div>
              <p className="text-white/95 text-xs font-semibold tracking-wider">
                {stat.title}
              </p>
              <p className="text-3xl font-bold mt-1">
                {stat.value}
              </p>
              <p className="text-white/90 text-xs mt-2 font-medium">
                {stat.subtitle}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Affiliate Link & Code */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-2 border-primary/20 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Share2 className="w-5 h-5 text-primary" />
              Tu Enlace de Afiliado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="relative">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-muted p-3 rounded-lg font-mono text-sm truncate border">
                  {getReferralLink()}
                </div>
                <Button
                  variant={linkCopied ? "default" : "outline"}
                  size="icon"
                  onClick={() => copyToClipboard(getReferralLink(), 'link')}
                  className={`transition-all duration-300 ${linkCopied ? 'bg-green-600 hover:bg-green-700' : ''}`}
                >
                  {linkCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={shareOnWhatsApp}
                className="bg-green-600 hover:bg-green-700 text-white flex-1"
                size="sm"
              >
                WhatsApp
              </Button>
              <Button
                onClick={shareOnFacebook}
                className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                size="sm"
              >
                Facebook
              </Button>
              <Button
                onClick={shareOnTwitter}
                className="bg-sky-500 hover:bg-sky-600 text-white flex-1"
                size="sm"
              >
                Twitter
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-200 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="w-5 h-5 text-amber-600" />
              Tu Código de Invitación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gradient-to-r from-amber-100 to-orange-100 p-4 rounded-lg font-mono text-2xl font-bold text-amber-800 text-center border-2 border-amber-300 border-dashed">
                {profileData.affiliateCode}
              </div>
              <Button
                variant={codeCopied ? "default" : "outline"}
                size="icon"
                onClick={() => copyToClipboard(profileData.affiliateCode, 'code')}
                className={`transition-all duration-300 ${codeCopied ? 'bg-green-600 hover:bg-green-700' : ''}`}
              >
                {codeCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Comparte este código con nuevos afiliados para que se unan a tu red.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Commission Rates */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Estructura de Comisiones Multinivel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 md:gap-4">
            {[
              { level: 1, rate: "10%", name: "Vendedor Directo", count: level1Referrals.length, gradient: "from-green-500 to-emerald-600" },
              { level: 2, rate: "4%", name: "Mentor Directo", count: level2Referrals.length, gradient: "from-blue-500 to-indigo-600" },
              { level: 3, rate: "2%", name: "Líder de Equipo", count: level3Referrals.length, gradient: "from-purple-500 to-violet-600" },
              { level: 4, rate: "2%", name: "Desarrollador", count: level4Referrals.length, gradient: "from-orange-500 to-amber-600" },
              { level: 5, rate: "1%", name: "Expansor", count: level5Referrals.length, gradient: "from-pink-500 to-rose-600" },
              { level: 6, rate: "1%", name: "Consolidador", count: level6Referrals.length, gradient: "from-cyan-500 to-teal-600" },
              { level: 7, rate: "1%", name: "Embajador", count: level7Referrals.length, gradient: "from-amber-500 to-yellow-600" },
            ].map((item) => (
              <div
                key={item.level}
                className={`p-3 md:p-4 bg-gradient-to-br ${item.gradient} border-0 rounded-xl text-center transform hover:scale-105 transition-transform shadow-lg`}
              >
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center mx-auto mb-2 text-lg md:text-xl font-bold shadow-lg">
                  {item.rate}
                </div>
                <p className="font-bold text-white text-xs md:text-sm">Nivel {item.level}</p>
                <p className="text-white/80 text-[10px] md:text-xs">{item.name}</p>
                <p className="text-white font-medium text-xs md:text-sm mt-1">{item.count} referidos</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Commissions */}
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Comisiones Recientes
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadAllData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </CardHeader>
        <CardContent>
          {commissions.length > 0 ? (
            <div className="space-y-3">
              {commissions.slice(0, 5).map((commission, index) => (
                <div
                  key={commission.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/50 to-muted rounded-xl hover:shadow-md transition-shadow"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${commission.level === 1 ? 'bg-green-100 text-green-600' :
                      commission.level === 2 ? 'bg-blue-100 text-blue-600' :
                        commission.level === 3 ? 'bg-purple-100 text-purple-600' :
                          commission.level === 4 ? 'bg-orange-100 text-orange-600' :
                            commission.level === 5 ? 'bg-pink-100 text-pink-600' :
                              commission.level === 6 ? 'bg-cyan-100 text-cyan-600' :
                                'bg-amber-100 text-amber-600'
                      }`}>
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium">
                        Comisión Nivel {commission.level}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(commission.created_at).toLocaleDateString("es-PE", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-600 font-bold text-lg">+S/ {commission.amount.toFixed(2)}</p>
                    <Badge variant="outline" className={
                      commission.status === "paid"
                        ? "bg-green-100 text-green-700 border-green-300"
                        : "bg-yellow-100 text-yellow-700 border-yellow-300"
                    }>
                      {commission.status === "paid" ? "Pagado" : "Pendiente"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Aún no tienes comisiones</h3>
              <p className="text-muted-foreground mb-4">¡Comparte tu enlace y empieza a ganar!</p>
              <Button onClick={shareOnWhatsApp} className="bg-green-600 hover:bg-green-700">
                <Share2 className="w-4 h-4 mr-2" />
                Compartir Ahora
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderPerfil = () => (
    <div className="space-y-8 animate-fade-in">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-primary" />
            Mi Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-sm font-medium">
                Nombre Completo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nombre"
                value={profileData.nombre}
                onChange={(e) => setProfileData({ ...profileData, nombre: e.target.value })}
                placeholder="Tu nombre completo"
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Correo Electrónico <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                placeholder="tu@email.com"
                className="h-12"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="yape" className="text-sm font-medium">
              Número de Yape para Pagos
            </Label>
            <Input
              id="yape"
              value={profileData.yape}
              onChange={(e) => setProfileData({ ...profileData, yape: e.target.value })}
              placeholder="Ingresa tu número de Yape (ej: 999888777)"
              className="h-12"
            />
            <p className="text-xs text-muted-foreground">
              Este número se usará para transferir tus comisiones
            </p>
          </div>

          {/* Account Info */}
          <div className="p-6 bg-gradient-to-br from-muted to-muted/50 rounded-xl space-y-3 border">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Información de Cuenta</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Código de Afiliado</span>
                <span className="font-mono font-bold text-lg">{profileData.affiliateCode}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Nivel</span>
                <Badge className={`w-fit mt-1 ${getLevelColor(profileData.level)}`}>
                  {profileData.level}
                </Badge>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Estado</span>
                <Badge className={`w-fit mt-1 ${getStatusColor(affiliateData?.status || "Activo")}`}>
                  {affiliateData?.status || "Activo"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              className="flex-1 h-12"
              onClick={handleSaveProfile}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderRed = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Network Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 md:gap-4">
        {[
          { level: 1, count: level1Referrals.length, label: "Nivel 1", name: "Vendedor Directo", rate: "10%", gradient: "from-green-500 to-emerald-600" },
          { level: 2, count: level2Referrals.length, label: "Nivel 2", name: "Mentor Directo", rate: "4%", gradient: "from-blue-500 to-indigo-600" },
          { level: 3, count: level3Referrals.length, label: "Nivel 3", name: "Líder de Equipo", rate: "2%", gradient: "from-purple-500 to-violet-600" },
          { level: 4, count: level4Referrals.length, label: "Nivel 4", name: "Desarrollador", rate: "2%", gradient: "from-orange-500 to-amber-600" },
          { level: 5, count: level5Referrals.length, label: "Nivel 5", name: "Expansor", rate: "1%", gradient: "from-pink-500 to-rose-600" },
          { level: 6, count: level6Referrals.length, label: "Nivel 6", name: "Consolidador", rate: "1%", gradient: "from-cyan-500 to-teal-600" },
          { level: 7, count: level7Referrals.length, label: "Nivel 7", name: "Embajador", rate: "1%", gradient: "from-amber-500 to-yellow-600" }
        ].map((item) => (
          <Card
            key={item.level}
            className={`bg-gradient-to-br ${item.gradient} border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
          >
            <CardContent className="p-3 md:p-4 text-center">
              <p className="text-2xl md:text-3xl font-bold mb-1">{item.count}</p>
              <p className="font-medium text-xs md:text-sm opacity-90">{item.label}</p>
              <p className="text-[10px] md:text-xs opacity-75">{item.rate} comisión</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Network Visualization */}
      {referrals.length > 0 && (
        <Card className="shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Visualización de tu Red
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="relative">
              {/* You at center */}
              <div className="flex flex-col items-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full flex items-center justify-center shadow-xl ring-4 ring-primary/20">
                  <UserIcon className="w-10 h-10" />
                </div>
                <p className="mt-2 font-bold">{profileData.nombre.split(" ")[0]}</p>
                <Badge className={getLevelColor(profileData.level)}>{profileData.level}</Badge>
              </div>

              {/* Level 1 */}
              {level1Referrals.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className="h-8 w-px bg-green-300"></div>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4">
                    {level1Referrals.map((ref, i) => (
                      <div key={ref.id} className="flex flex-col items-center group">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <UserIcon className="w-7 h-7" />
                        </div>
                        <p className="mt-1 text-sm font-medium truncate max-w-[80px]">{ref.name.split(" ")[0]}</p>
                        <p className="text-xs text-green-600">S/ {ref.total_sales.toFixed(0)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Level 2 */}
              {level2Referrals.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className="h-8 w-px bg-blue-300"></div>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    {level2Referrals.map((ref) => (
                      <div key={ref.id} className="flex flex-col items-center group">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          <UserIcon className="w-6 h-6" />
                        </div>
                        <p className="mt-1 text-xs font-medium truncate max-w-[60px]">{ref.name.split(" ")[0]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Level 3 */}
              {level3Referrals.length > 0 && (
                <div>
                  <div className="flex items-center justify-center mb-4">
                    <div className="h-8 w-px bg-purple-300"></div>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {level3Referrals.map((ref) => (
                      <div key={ref.id} className="flex flex-col items-center group">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-full flex items-center justify-center shadow group-hover:scale-110 transition-transform">
                          <UserIcon className="w-5 h-5" />
                        </div>
                        <p className="mt-1 text-[10px] font-medium truncate max-w-[50px]">{ref.name.split(" ")[0]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referrals List */}
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lista Detallada de Afiliados</CardTitle>
          <Button variant="ghost" size="sm" onClick={loadReferrals} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </CardHeader>
        <CardContent>
          {referrals.length > 0 ? (
            <div className="space-y-6">
              {[1, 2, 3, 4, 5, 6, 7].map(level => {
                const levelReferrals = referrals.filter(r => r.level === level);
                if (levelReferrals.length === 0) return null;

                const levelColors: Record<number, { bg: string; border: string; icon: string; text: string }> = {
                  1: { bg: "bg-green-50", border: "border-green-200", icon: "bg-green-100 text-green-600", text: "text-green-700" },
                  2: { bg: "bg-blue-50", border: "border-blue-200", icon: "bg-blue-100 text-blue-600", text: "text-blue-700" },
                  3: { bg: "bg-purple-50", border: "border-purple-200", icon: "bg-purple-100 text-purple-600", text: "text-purple-700" },
                  4: { bg: "bg-orange-50", border: "border-orange-200", icon: "bg-orange-100 text-orange-600", text: "text-orange-700" },
                  5: { bg: "bg-pink-50", border: "border-pink-200", icon: "bg-pink-100 text-pink-600", text: "text-pink-700" },
                  6: { bg: "bg-cyan-50", border: "border-cyan-200", icon: "bg-cyan-100 text-cyan-600", text: "text-cyan-700" },
                  7: { bg: "bg-amber-50", border: "border-amber-200", icon: "bg-amber-100 text-amber-600", text: "text-amber-700" }
                };
                const colors = levelColors[level];

                return (
                  <div key={level}>
                    <div className={`flex items-center gap-2 mb-3 p-2 rounded-lg ${colors.bg} ${colors.border} border`}>
                      <Users className={`w-4 h-4 ${colors.text}`} />
                      <h4 className={`font-semibold text-sm ${colors.text}`}>
                        Nivel {level} ({levelReferrals.length} afiliados)
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {levelReferrals.map(referral => (
                        <div
                          key={referral.id}
                          className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors border"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colors.icon}`}>
                              <UserIcon className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="font-medium">{referral.name}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                Desde {new Date(referral.created_at).toLocaleDateString("es-PE")}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-4">
                            <div>
                              <p className="font-bold text-lg">S/ {referral.total_sales.toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">en ventas</p>
                            </div>
                            <Badge className={getStatusColor(referral.status)}>
                              {referral.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-12 h-12 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Tu red está vacía</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                ¡Comparte tu código de afiliado y empieza a construir tu red multinivel para ganar comisiones!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={shareOnWhatsApp} className="bg-green-600 hover:bg-green-700">
                  <Share2 className="w-4 h-4 mr-2" />
                  Invitar por WhatsApp
                </Button>
                <Button variant="outline" onClick={() => copyToClipboard(getReferralLink(), 'link')}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Enlace
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyTrackingCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "¡Copiado!",
      description: "Código de tracking copiado al portapapeles"
    });
  };

  const renderCompras = () => (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Historial de Compras
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => {
                const statusConfig = getOrderStatusConfig(order.status);
                const StatusIcon = statusConfig.icon;
                const shippingCompany = order.shipping_company ? SHIPPING_COMPANIES[order.shipping_company] : null;

                return (
                  <div
                    key={order.id}
                    className="p-4 border rounded-xl hover:shadow-md transition-all cursor-pointer bg-gradient-to-r from-background to-muted/30"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono font-bold">{order.order_number}</span>
                          <Badge className={`${statusConfig.bgColor} ${statusConfig.color} border-0`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <p className="font-medium">{order.product_name}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(order.created_at)}
                          </span>
                          {shippingCompany && (
                            <span className="flex items-center gap-1">
                              <shippingCompany.icon className="w-4 h-4" />
                              {shippingCompany.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-xl font-bold text-primary">
                          S/ {Number(order.amount).toFixed(2)}
                        </p>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-12 h-12 text-primary/50" />
              </div>
              <h3 className="text-xl font-bold mb-2">Sin compras aún</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Cuando realices compras con tu email registrado, aparecerán aquí con toda la información de envío.
              </p>
              <Button onClick={() => navigate('/catalogo')}>
                <ShoppingBag className="w-4 h-4 mr-2" />
                Ver Catálogo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderFavoritos = () => (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b">
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Heart className="w-5 h-5 fill-red-600" />
            Mis Favoritos
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {favoriteProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteProducts.map((product) => (
                <div
                  key={product.id}
                  className="group relative bg-card rounded-xl border shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  <div className="aspect-square relative overflow-hidden bg-muted">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ImageIcon className="w-12 h-12 opacity-20" />
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(product.id, product.name);
                      }}
                      className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors text-red-500 hover:text-red-600"
                    >
                      <Heart className="w-5 h-5 fill-current" />
                    </button>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold truncate mb-1">{product.name}</h3>
                    <p className="text-primary font-bold">
                      S/ {product.price.toFixed(2)}
                    </p>
                    <Button
                      variant="outline"
                      className="w-full mt-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      onClick={() => navigate('/catalogo')}
                    >
                      Ver en Catálogo
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-12 h-12 text-red-300" />
              </div>
              <h3 className="text-xl font-bold mb-2">No tienes favoritos aún</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Guarda los productos que más te gusten para encontrarlos fácilmente aquí.
              </p>
              <Button onClick={() => navigate('/catalogo')} className="bg-red-600 hover:bg-red-700">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Explorar Catálogo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 shadow-lg overflow-hidden">
              <CardHeader className="pb-4 bg-gradient-to-br from-primary/5 to-primary/10 border-b">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg ring-4 ring-primary/20">
                    <UserIcon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{profileData.nombre}</CardTitle>
                    <Badge className={`mt-1 ${getLevelColor(profileData.level)}`}>
                      {profileData.level}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="divide-y">
                  <button
                    onClick={() => setActiveSection("resumen")}
                    className={`w-full flex items-center justify-between px-4 py-4 text-sm font-medium transition-all ${activeSection === "resumen"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                      }`}
                  >
                    <span className="flex items-center">
                      <Home className="w-5 h-5 mr-3" />
                      Resumen
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveSection("red")}
                    className={`w-full flex items-center justify-between px-4 py-4 text-sm font-medium transition-all ${activeSection === "red"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                      }`}
                  >
                    <span className="flex items-center">
                      <Users className="w-5 h-5 mr-3" />
                      Mi Red
                    </span>
                    <Badge variant="secondary" className="bg-primary/20 text-primary">
                      {referrals.length}
                    </Badge>
                  </button>
                  <button
                    onClick={() => setActiveSection("perfil")}
                    className={`w-full flex items-center justify-between px-4 py-4 text-sm font-medium transition-all ${activeSection === "perfil"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                      }`}
                  >
                    <span className="flex items-center">
                      <UserIcon className="w-5 h-5 mr-3" />
                      Mi Perfil
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveSection("compras")}
                    className={`w-full flex items-center justify-between px-4 py-4 text-sm font-medium transition-all ${activeSection === "compras"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                      }`}
                  >
                    <span className="flex items-center">
                      <ShoppingBag className="w-5 h-5 mr-3" />
                      Mis Compras
                    </span>
                    <Badge variant="secondary" className="bg-primary/20 text-primary">
                      {orders.length}
                    </Badge>
                  </button>
                  <button
                    onClick={() => setActiveSection("favoritos")}
                    className={`w-full flex items-center justify-between px-4 py-4 text-sm font-medium transition-all ${activeSection === "favoritos"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                      }`}
                  >
                    <span className="flex items-center">
                      <Heart className="w-5 h-5 mr-3" />
                      Mis Favoritos
                    </span>
                    <Badge variant="secondary" className="bg-primary/20 text-primary">
                      {favorites.size}
                    </Badge>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-4 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Cerrar Sesión
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  ¡Hola, {profileData.nombre.split(" ")[0]}!
                </h1>
                <p className="text-muted-foreground mt-1">
                  Gestiona tu red de afiliados y revisa tus comisiones
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={loadAllData} disabled={isRefreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>

            {activeSection === "resumen" && renderResumen()}
            {activeSection === "perfil" && renderPerfil()}
            {activeSection === "red" && renderRed()}
            {activeSection === "compras" && renderCompras()}
            {activeSection === "favoritos" && renderFavoritos()}
          </div>
        </div>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          {selectedOrder && (() => {
            const statusConfig = getOrderStatusConfig(selectedOrder.status);
            const StatusIcon = statusConfig.icon;
            const shippingCompany = selectedOrder.shipping_company ? SHIPPING_COMPANIES[selectedOrder.shipping_company] : null;

            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    Detalle del Pedido
                  </DialogTitle>
                  <DialogDescription>
                    {selectedOrder.order_number}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Status Card */}
                  <div className={`p-4 rounded-xl ${statusConfig.bgColor}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-full bg-background`}>
                        <StatusIcon className={`w-6 h-6 ${statusConfig.color}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{statusConfig.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedOrder.status === "En Camino" && "Tu pedido está en camino"}
                          {selectedOrder.status === "Pendiente" && "Estamos procesando tu pedido"}
                          {selectedOrder.status === "Procesando" && "Tu pedido está siendo preparado"}
                          {selectedOrder.status === "Completado" && "¡Tu pedido ha sido entregado!"}
                          {selectedOrder.status === "Cancelado" && "Este pedido fue cancelado"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4 bg-secondary rounded-xl">
                    <h4 className="font-semibold mb-3">Producto</h4>
                    <p className="text-lg">{selectedOrder.product_name}</p>
                    <p className="text-2xl font-bold text-primary mt-2">
                      S/ {Number(selectedOrder.amount).toFixed(2)}
                    </p>
                  </div>

                  {/* Shipping Address */}
                  {selectedOrder.shipping_address && (
                    <div className="p-4 bg-secondary rounded-xl">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Dirección de Envío
                      </h4>
                      <p>{selectedOrder.shipping_address}</p>
                      <p className="text-muted-foreground">{selectedOrder.shipping_city}</p>
                    </div>
                  )}

                  {/* Tracking Card */}
                  {shippingCompany && selectedOrder.tracking_code && (
                    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <shippingCompany.icon className="w-6 h-6" />
                          Empresa: {shippingCompany.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Tracking Code */}
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">Tu Código:</span>
                          <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-lg border">
                            <span className="font-mono text-lg font-bold text-primary">
                              {selectedOrder.tracking_code}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyTrackingCode(selectedOrder.tracking_code!);
                              }}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Instructions */}
                        <div className="bg-background/80 rounded-lg p-4">
                          <p className="font-medium mb-3 text-sm">Instrucciones:</p>
                          <ol className="space-y-2">
                            {shippingCompany.instructions.map((instruction, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex gap-2">
                                <span className="font-bold text-primary">{i + 1}.</span>
                                {instruction}
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* Track Button */}
                        <Button
                          className="w-full"
                          onClick={() => window.open(shippingCompany.trackingUrl, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Rastrear en {shippingCompany.name}
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Shipping Voucher - Always show if available */}
                  {selectedOrder.shipping_voucher_url && (
                    <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50">
                      <CardContent className="py-4">
                        <Button
                          variant="outline"
                          className="w-full border-emerald-300 hover:bg-emerald-200/50"
                          onClick={() => setVoucherDialog({ open: true, url: selectedOrder.shipping_voucher_url })}
                        >
                          <ImageIcon className="w-4 h-4 mr-2 text-emerald-600" />
                          Ver Comprobante de Envío
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Order Details */}
                  <div className="p-4 bg-secondary rounded-xl text-sm">
                    <h4 className="font-semibold mb-3">Detalles del Pedido</h4>
                    <div className="space-y-2 text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Número de Pedido:</span>
                        <span className="font-mono">{selectedOrder.order_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fecha:</span>
                        <span>{formatDate(selectedOrder.created_at)}</span>
                      </div>
                      {selectedOrder.shipped_at && (
                        <div className="flex justify-between">
                          <span>Fecha de Envío:</span>
                          <span>{formatDate(selectedOrder.shipped_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Voucher Image Dialog */}
      <Dialog open={voucherDialog.open} onOpenChange={(open) => setVoucherDialog({ open, url: null })}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Boucher de Envío</DialogTitle>
          </DialogHeader>
          {voucherDialog.url && (
            <img
              src={voucherDialog.url}
              alt="Boucher de envío"
              className="w-full rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AreaAfiliado;
