import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Package, Clock, Settings, Truck, CheckCircle, XCircle } from "lucide-react";

interface OrderStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
  onSuccess: () => void;
}

export const OrderStatusDialog = ({ open, onOpenChange, order, onSuccess }: OrderStatusDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(order?.status || "Pendiente");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', order.id);

      if (error) throw error;

      toast({
        title: "¡Éxito!",
        description: "Estado del pedido actualizado correctamente"
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Ocurrió un error al actualizar el estado"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Actualizar Estado del Pedido
          </DialogTitle>
          <DialogDescription>
            Pedido #{order.order_number}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="p-3 bg-secondary rounded-lg">
                <p className="text-sm font-medium">Cliente: {order.customer_name}</p>
                <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                <p className="text-sm font-medium mt-2">{order.product_name}</p>
                <p className="text-lg font-bold text-primary mt-1">S/ {parseFloat(order.amount).toFixed(2)}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado del Pedido</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendiente">
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-yellow-500" />
                        Pendiente
                      </span>
                    </SelectItem>
                    <SelectItem value="Procesando">
                      <span className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-blue-500 animate-spin" />
                        Procesando
                      </span>
                    </SelectItem>
                    <SelectItem value="En Camino">
                      <span className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-orange-500" />
                        En Camino
                      </span>
                    </SelectItem>
                    <SelectItem value="Completado">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Completado
                      </span>
                    </SelectItem>
                    <SelectItem value="Cancelado">
                      <span className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        Cancelado
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Actualizar Estado
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};