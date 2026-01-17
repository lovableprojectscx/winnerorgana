import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface AffiliateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  affiliate?: any;
  onSuccess: () => void;
}

export const AffiliateDialog = ({ open, onOpenChange, affiliate, onSuccess }: AffiliateDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    dni: "",
    email: "",
    affiliate_code: "",
    status: "Activo",
    level: "Vendedor Directo",
    total_sales: "0"
  });

  useEffect(() => {
    if (affiliate) {
      setFormData({
        name: affiliate.name || "",
        dni: affiliate.dni || "",
        email: affiliate.email || "",
        affiliate_code: affiliate.affiliate_code || "",
        status: affiliate.status || "Activo",
        level: affiliate.level || "Vendedor Directo",
        total_sales: affiliate.total_sales?.toString() || "0"
      });
    } else {
      // Generate random affiliate code for new affiliates
      const randomCode = `AFF${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      setFormData({
        name: "",
        dni: "",
        email: "",
        affiliate_code: randomCode,
        status: "Activo",
        level: "Vendedor Directo",
        total_sales: "0"
      });
    }
  }, [affiliate, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSave = {
        name: formData.name,
        dni: formData.dni,
        email: formData.email,
        affiliate_code: formData.affiliate_code,
        status: formData.status,
        level: formData.level,
        total_sales: parseFloat(formData.total_sales)
      };

      if (affiliate) {
        // Update existing affiliate
        const { error } = await supabase
          .from('affiliates')
          .update(dataToSave)
          .eq('id', affiliate.id);

        if (error) throw error;

        toast({
          title: "¡Éxito!",
          description: "Afiliado actualizado correctamente"
        });
      } else {
        // Create new affiliate
        const { error } = await supabase
          .from('affiliates')
          .insert([dataToSave]);

        if (error) throw error;

        toast({
          title: "¡Éxito!",
          description: "Afiliado creado correctamente"
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Ocurrió un error al guardar el afiliado"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {affiliate ? "Editar Afiliado" : "Nuevo Afiliado"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Juan Pérez"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dni">DNI *</Label>
              <Input
                id="dni"
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value.replace(/\D/g, '').slice(0, 8) })}
                placeholder="Ej: 12345678"
                required
                minLength={8}
                maxLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@ejemplo.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="affiliate_code">Código de Afiliado *</Label>
              <Input
                id="affiliate_code"
                value={formData.affiliate_code}
                onChange={(e) => setFormData({ ...formData, affiliate_code: e.target.value.toUpperCase() })}
                placeholder="AFFXXXXXX"
                required
              />
              <p className="text-xs text-muted-foreground">
                Este código será usado para rastrear las ventas del afiliado
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Inactivo">Inactivo</SelectItem>
                    <SelectItem value="Suspendido">Suspendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Nivel</Label>
                <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vendedor Directo">Vendedor Directo</SelectItem>
                    <SelectItem value="Mentor Directo">Mentor Directo</SelectItem>
                    <SelectItem value="Líder de Equipo">Líder de Equipo</SelectItem>
                    <SelectItem value="Desarrollador">Desarrollador</SelectItem>
                    <SelectItem value="Expansor">Expansor</SelectItem>
                    <SelectItem value="Consolidador">Consolidador</SelectItem>
                    <SelectItem value="Embajador">Embajador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_sales">Total Ventas (S/)</Label>
              <Input
                id="total_sales"
                type="number"
                step="0.01"
                min="0"
                value={formData.total_sales}
                onChange={(e) => setFormData({ ...formData, total_sales: e.target.value })}
              />
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
              {affiliate ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};