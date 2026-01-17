import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock,
  Receipt,
  User,
  Calendar,
  CreditCard
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PendingOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  product_name: string;
  created_at: string;
  payment_proof?: {
    id: string;
    proof_url: string;
    payment_method: string;
    amount: number;
  };
}

export function PaymentVerificationSection() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    loadPendingOrders();
  }, []);

  const loadPendingOrders = async () => {
    try {
      // Get orders with pending payment verification
      const { data: ordersData, error } = await supabase
        .from("orders")
        .select("*")
        .eq("payment_type", "dinero_real")
        .eq("payment_status", "pending_verification")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get payment proofs for these orders
      const orderIds = ordersData?.map(o => o.id) || [];
      const { data: proofsData } = await supabase
        .from("payment_proofs")
        .select("*")
        .in("order_id", orderIds);

      const ordersWithProofs = ordersData?.map(order => ({
        ...order,
        payment_proof: proofsData?.find(p => p.order_id === order.id)
      })) || [];

      setOrders(ordersWithProofs);
    } catch (error) {
      console.error("Error loading pending orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (orderId: string, approved: boolean) => {
    setProcessing(orderId);
    try {
      const { data, error } = await supabase.rpc("verify_direct_payment", {
        p_order_id: orderId,
        p_approved: approved,
        p_admin_notes: adminNotes || null
      });

      if (error) throw error;
      
      const result = data as { success: boolean; error?: string; message?: string };
      
      if (!result.success) {
        throw new Error(result.error || "Error al procesar");
      }

      toast({
        title: approved ? "Pago aprobado" : "Pago rechazado",
        description: result.message,
      });

      setShowDialog(false);
      setSelectedOrder(null);
      setAdminNotes("");
      loadPendingOrders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo procesar la verificación",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const openVerifyDialog = (order: PendingOrder) => {
    setSelectedOrder(order);
    setAdminNotes("");
    setShowDialog(true);
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "yape": return "Yape";
      case "plin": return "Plin";
      case "transfer": return "Transferencia";
      default: return method;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Verificación de Pagos</h2>
          <p className="text-muted-foreground">
            Revisa y aprueba los pagos de dinero real
          </p>
        </div>
        {orders.length > 0 && (
          <Badge variant="destructive" className="text-lg px-3 py-1">
            {orders.length} pendiente{orders.length !== 1 && "s"}
          </Badge>
        )}
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-medium">Sin pagos pendientes</h3>
            <p className="text-muted-foreground">
              Todos los pagos han sido verificados
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-muted-foreground" />
                      <span className="font-mono font-bold">{order.order_number}</span>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        <Clock className="w-3 h-3 mr-1" />
                        Pendiente
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {order.customer_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(order.created_at), "dd MMM yyyy, HH:mm", { locale: es })}
                      </span>
                      {order.payment_proof && (
                        <span className="flex items-center gap-1">
                          <CreditCard className="w-3 h-3" />
                          {getPaymentMethodLabel(order.payment_proof.payment_method)}
                        </span>
                      )}
                    </div>

                    <p className="text-sm">
                      <span className="text-muted-foreground">Producto: </span>
                      <span className="font-medium">{order.product_name}</span>
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="text-2xl font-bold text-primary">
                      S/ {(order.amount / 10).toFixed(2)}
                    </div>
                    <div className="flex gap-2">
                      {order.payment_proof?.proof_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(order.payment_proof?.proof_url, "_blank")}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver comprobante
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => openVerifyDialog(order)}
                      >
                        Verificar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Verification Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Verificar Pago</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Orden:</span>
                  <span className="font-mono font-bold">{selectedOrder.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cliente:</span>
                  <span>{selectedOrder.customer_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monto esperado:</span>
                  <span className="font-bold text-primary">
                    S/ {(selectedOrder.amount / 10).toFixed(2)}
                  </span>
                </div>
                {selectedOrder.payment_proof && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Método:</span>
                    <span>{getPaymentMethodLabel(selectedOrder.payment_proof.payment_method)}</span>
                  </div>
                )}
              </div>

              {selectedOrder.payment_proof?.proof_url && (
                <div className="border rounded-lg overflow-hidden">
                  <img
                    src={selectedOrder.payment_proof.proof_url}
                    alt="Comprobante de pago"
                    className="w-full max-h-64 object-contain bg-muted"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Notas del administrador (opcional)</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Agregar notas sobre esta verificación..."
                  rows={2}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              onClick={() => selectedOrder && handleVerify(selectedOrder.id, false)}
              disabled={processing !== null}
            >
              {processing === selectedOrder?.id ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Rechazar
            </Button>
            <Button
              onClick={() => selectedOrder && handleVerify(selectedOrder.id, true)}
              disabled={processing !== null}
              className="bg-green-600 hover:bg-green-700"
            >
              {processing === selectedOrder?.id ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Aprobar Pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
