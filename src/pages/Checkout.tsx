import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/hooks/useCart";
import { useUserCredits } from "@/hooks/useUserCredits";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, Gift, ShoppingBag, Trophy, AlertCircle, LogIn } from "lucide-react";
import { BuyWinnerPointsBanner } from "@/components/BuyWinnerPointsBanner";
import { PaymentMethodSelector, PaymentType } from "@/components/checkout/PaymentMethodSelector";
import { DirectPaymentForm } from "@/components/checkout/DirectPaymentForm";

const Checkout = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { balance, credits, isAuthenticated, isLoading, refetch } = useUserCredits();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [affiliateInfo, setAffiliateInfo] = useState<{ id: string; name: string; code: string } | null>(null);
  const [paymentType, setPaymentType] = useState<PaymentType>("winner_points");
  const [paymentProof, setPaymentProof] = useState<{ url: string; method: string } | null>(null);
  const [userId, setUserId] = useState<string>("");
  
  const urlAffiliateCode = searchParams.get("ref") || "";
  
  const [formData, setFormData] = useState({
    dni: "",
    phone: "",
    address: "",
    city: "",
    affiliateCode: urlAffiliateCode,
  });

  // Los precios ya están en WinnerPoints directamente
  const totalInWP = getTotalPrice();
  const totalInSoles = totalInWP / 10; // 10 WP = 1 Sol
  const hasEnoughCredits = balance >= totalInWP;

  // Get user info from credits (contains email)
  const userEmail = credits?.email || "";

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }
    };
    getUser();
  }, []);
  
  useEffect(() => {
    if (urlAffiliateCode) {
      validateAffiliateCode(urlAffiliateCode);
    }
  }, [urlAffiliateCode]);

  // Auto-select payment method based on credits
  useEffect(() => {
    if (!hasEnoughCredits && !isLoading) {
      setPaymentType("dinero_real");
    }
  }, [hasEnoughCredits, isLoading]);

  const validateAffiliateCode = async (code: string) => {
    if (!code || code.length < 3) {
      setAffiliateInfo(null);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from("affiliates")
        .select("id, name, affiliate_code")
        .eq("affiliate_code", code.toUpperCase())
        .maybeSingle();

      if (data && !error) {
        setAffiliateInfo({ id: data.id, name: data.name, code: data.affiliate_code });
      } else {
        setAffiliateInfo(null);
      }
    } catch {
      setAffiliateInfo(null);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === "affiliateCode") {
      validateAffiliateCode(value);
    }
  };

  const handleProofUploaded = (proofUrl: string, paymentMethod: string) => {
    setPaymentProof({ url: proofUrl, method: paymentMethod });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Inicia sesión",
        description: "Necesitas una cuenta para realizar compras",
        variant: "destructive",
      });
      navigate("/login-afiliado");
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agrega productos antes de continuar",
        variant: "destructive",
      });
      return;
    }

    // Validation for WinnerPoints payment
    if (paymentType === "winner_points" && !hasEnoughCredits) {
      toast({
        title: "Saldo insuficiente",
        description: `Necesitas ${totalInWP} WP pero solo tienes ${balance} WP`,
        variant: "destructive",
      });
      return;
    }

    // Validation for direct payment
    if (paymentType === "dinero_real" && !paymentProof) {
      toast({
        title: "Comprobante requerido",
        description: "Debes subir tu comprobante de pago",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const orderNumber = `ORD-${Date.now()}`;
      const totalAmount = getTotalPrice();
      
      // Verify stock availability first
      for (const item of items) {
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("stock, name")
          .eq("id", item.id)
          .single();

        if (productError) throw productError;
        
        if (productData.stock !== null && productData.stock < item.quantity) {
          throw new Error(`Stock insuficiente para "${productData.name}". Disponible: ${productData.stock}`);
        }
      }

      // Create orders for each item
      let firstOrderId: string | null = null;
      const createdOrders: { orderId: string; productId: string; quantity: number }[] = [];
      
      const orderStatus = paymentType === "winner_points" ? "Pagado con WP" : "Pendiente de Verificación";
      const paymentStatus = paymentType === "winner_points" ? "completed" : "pending_verification";

      for (const item of items) {
        const { data: orderData, error } = await supabase
          .from("orders")
          .insert({
            order_number: orderNumber,
            customer_name: userEmail.split("@")[0],
            customer_email: userEmail,
            customer_dni: formData.dni,
            customer_phone: formData.phone,
            shipping_address: formData.address,
            shipping_city: formData.city,
            product_name: item.name,
            product_id: item.id,
            amount: item.price * item.quantity,
            status: orderStatus,
            payment_type: paymentType,
            payment_status: paymentStatus,
          })
          .select("id")
          .single();

        if (error) throw error;
        if (orderData) {
          if (!firstOrderId) firstOrderId = orderData.id;
          createdOrders.push({
            orderId: orderData.id,
            productId: item.id,
            quantity: item.quantity
          });
        }
      }

      // For direct payment, save the payment proof
      if (paymentType === "dinero_real" && paymentProof && firstOrderId) {
        const { error: proofError } = await supabase
          .from("payment_proofs")
          .insert({
            order_id: firstOrderId,
            proof_url: paymentProof.url,
            payment_method: paymentProof.method,
            amount: totalInSoles,
            status: "pending"
          });

        if (proofError) {
          console.error("Error saving payment proof:", proofError);
        }

        // Create commissions (will be credited to WP when payment is verified)
        if (affiliateInfo) {
          await supabase.rpc("create_order_commissions", {
            p_order_id: firstOrderId,
            p_order_amount: totalAmount,
            p_affiliate_code: affiliateInfo.code
          });
        }

        toast({
          title: "¡Pedido registrado!",
          description: "Tu pago será verificado pronto. Te notificaremos cuando esté confirmado.",
        });

        clearCart();
        navigate("/mi-cuenta");
        return;
      }

      // WinnerPoints payment flow
      // Decrease stock after orders are created
      for (const order of createdOrders) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rpcCall = supabase.rpc as any;
        const { error: stockError } = await rpcCall("decrease_product_stock", {
          p_product_id: order.productId,
          p_quantity: order.quantity,
          p_order_id: order.orderId
        });

        if (stockError) {
          console.error("Error decreasing stock:", stockError);
        }
      }

      // Deduct WinnerPoints
      if (firstOrderId) {
        const { data: creditResult, error: creditError } = await supabase.rpc("use_credits_for_purchase", {
          p_amount: totalInWP,
          p_order_id: firstOrderId
        });

        if (creditError) throw creditError;
        
        const result = creditResult as { success: boolean; error?: string };
        if (!result.success) {
          throw new Error(result.error || "Error al procesar los créditos");
        }

        refetch();
      }

      // If affiliate code is valid, create commissions (already in WP since paid with WP)
      if (affiliateInfo && firstOrderId) {
        await supabase.rpc("create_order_commissions", {
          p_order_id: firstOrderId,
          p_order_amount: totalAmount,
          p_affiliate_code: affiliateInfo.code
        });
      }

      toast({
        title: "¡Compra completada con WinnerPoints!",
        description: `Pagaste ${totalInWP.toLocaleString()} WP. Pedido ${orderNumber} confirmado.`,
      });

      clearCart();
      navigate("/");

    } catch (error: any) {
      toast({
        title: "Error al procesar el pedido",
        description: error.message || "Intenta nuevamente",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 md:py-16 text-center">
          <ShoppingBag className="w-16 h-16 md:w-20 md:h-20 mx-auto text-muted-foreground/50 mb-4" />
          <h1 className="text-2xl md:text-3xl font-bold mb-4">Tu carrito está vacío</h1>
          <p className="text-muted-foreground mb-6">Agrega productos para continuar con tu compra</p>
          <Button onClick={() => navigate("/catalogo")} size="lg">
            Ir al Catálogo
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 md:py-16 text-center">
          <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Not authenticated - require login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 md:py-16">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-8 pb-6 space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <LogIn className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Inicia Sesión para Comprar</h1>
              <p className="text-muted-foreground">
                Para realizar compras necesitas una cuenta.
              </p>
              <div className="flex flex-col gap-3 pt-4">
                <Button onClick={() => navigate("/login-afiliado")} size="lg">
                  <LogIn className="w-4 h-4 mr-2" />
                  Iniciar Sesión
                </Button>
                <Button variant="outline" onClick={() => navigate("/registro-afiliado")} size="lg">
                  Crear Cuenta
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // Main checkout form - authenticated
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-6 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6 md:mb-8">Finalizar Compra</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Order Summary - Mobile First */}
          <div className="lg:hidden">
            <Card className="mb-6">
              <CardHeader className="py-4">
                <CardTitle className="text-lg">Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-muted-foreground">x{item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{(item.price * item.quantity).toLocaleString()} WP</p>
                      <p className="text-xs text-muted-foreground">S/ {((item.price * item.quantity) / 10).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <div className="text-right">
                      <span className="text-primary">{totalInWP.toLocaleString()} WP</span>
                      <p className="text-sm font-normal text-muted-foreground">S/ {totalInSoles.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method Selector */}
            <PaymentMethodSelector
              selectedMethod={paymentType}
              onMethodChange={setPaymentType}
              balance={balance}
              totalWP={totalInWP}
              totalSoles={totalInSoles}
              hasEnoughCredits={hasEnoughCredits}
            />

            {/* Direct Payment Form */}
            {paymentType === "dinero_real" && userId && (
              <DirectPaymentForm
                totalSoles={totalInSoles}
                onProofUploaded={handleProofUploaded}
                userId={userId}
              />
            )}

            {/* WinnerPoints Payment Info */}
            {paymentType === "winner_points" && (
              <Card className="border-2 border-accent bg-accent/5">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-accent">
                      <Trophy className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Pago con WinnerPoints</h3>
                      <p className="text-sm text-muted-foreground">
                        Tu saldo: <span className="font-bold text-accent">{balance.toLocaleString()} WP</span>
                        <span className="mx-1">•</span>
                        <span>A pagar: {totalInWP.toLocaleString()} WP</span>
                      </p>
                      <div className="mt-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Se descontarán {totalInWP.toLocaleString()} WP de tu saldo
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="py-4 md:py-6">
                <CardTitle className="text-lg md:text-xl">Datos de Envío</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                  {/* Show user email */}
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Comprando como: <span className="font-medium text-foreground">{userEmail}</span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dni" className="text-sm">DNI *</Label>
                    <Input
                      id="dni"
                      type="text"
                      placeholder="Ej: 12345678"
                      value={formData.dni}
                      onChange={(e) => handleChange("dni", e.target.value.replace(/\D/g, '').slice(0, 8))}
                      required
                      minLength={8}
                      maxLength={8}
                      className="h-10 md:h-11"
                    />
                    <p className="text-xs text-muted-foreground">Ingresa tu DNI de 8 dígitos</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm">Teléfono de Contacto *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Ej: 999 888 777"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      required
                      className="h-10 md:h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm">Dirección de Envío *</Label>
                    <Input
                      id="address"
                      type="text"
                      placeholder="Calle, número, urbanización"
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      required
                      className="h-10 md:h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm">Ciudad / Distrito *</Label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="Ej: Lima, Miraflores"
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      required
                      className="h-10 md:h-11"
                    />
                  </div>

                  {/* Affiliate Code Field */}
                  <div className="space-y-2">
                    <Label htmlFor="affiliateCode" className="flex items-center gap-2 text-sm">
                      <Gift className="w-4 h-4" />
                      Código de Afiliado (Opcional)
                    </Label>
                    <Input
                      id="affiliateCode"
                      type="text"
                      placeholder="Ej: WINABC123"
                      value={formData.affiliateCode}
                      onChange={(e) => handleChange("affiliateCode", e.target.value.toUpperCase())}
                      className="h-10 md:h-11"
                    />
                    {affiliateInfo && (
                      <div className="flex items-center gap-2 p-2.5 md:p-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 shrink-0" />
                        <div className="text-xs md:text-sm">
                          <span className="text-green-700">Código válido - Referido por: </span>
                          <span className="font-semibold text-green-800">{affiliateInfo.name}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit" 
                    className="w-full h-11 md:h-12 text-sm md:text-base"
                    disabled={isProcessing || (paymentType === "dinero_real" && !paymentProof)}
                    variant={paymentType === "winner_points" ? "default" : "default"}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : paymentType === "winner_points" ? (
                      <>
                        <Trophy className="mr-2 h-4 w-4" />
                        Pagar {totalInWP.toLocaleString()} WinnerPoints
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Confirmar Pedido (S/ {totalInSoles.toFixed(2)})
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary - Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-muted-foreground">x{item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{(item.price * item.quantity).toLocaleString()} WP</p>
                      <p className="text-xs text-muted-foreground">S/ {((item.price * item.quantity) / 10).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <div className="text-right">
                      <span className="text-primary">{totalInWP.toLocaleString()} WP</span>
                      <p className="text-sm font-normal text-muted-foreground">S/ {totalInSoles.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Balance Info */}
                <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-accent" />
                    <span className="font-medium">Tu saldo WinnerPoints</span>
                  </div>
                  <p className="text-2xl font-bold text-accent">{balance.toLocaleString()} WP</p>
                  {hasEnoughCredits ? (
                    <Badge className="mt-2 bg-green-100 text-green-700 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Saldo suficiente
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="mt-2 bg-orange-50 text-orange-700 border-orange-200">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Usa pago directo
                    </Badge>
                  )}
                </div>

                <div className="bg-muted/50 p-4 rounded-lg text-sm">
                  <p className="font-medium mb-2">
                    {paymentType === "winner_points" ? "Pago con WinnerPoints" : "Pago con Dinero Real"}
                  </p>
                  <p className="text-muted-foreground">
                    {paymentType === "winner_points"
                      ? "Tu pedido será procesado inmediatamente al confirmar."
                      : "Tu pedido será procesado cuando verifiquemos tu pago."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
