import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Truck, Upload, Package, MapPin, ExternalLink, Image as ImageIcon } from "lucide-react";

interface ShippingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
  onSuccess: () => void;
}

const SHIPPING_COMPANIES = [
  {
    id: "olva",
    name: "Olva Courier",
    icon: Truck,
    trackingUrl: "https://tracking.olvaexpress.pe/",
    placeholder: "Ej: 26-123456",
    instructions: [
      "Copia tu código de seguimiento.",
      "Haz clic en el botón \"Rastrear en Olva\".",
      "En la web de Olva, selecciona el Año actual (ej. 2026).",
      "Pega tu código en la casilla \"Número de Tracking\" y dale a Buscar."
    ]
  },
  {
    id: "shalom",
    name: "Shalom",
    icon: Truck,
    trackingUrl: "https://rastrea.shalom.pe/login",
    placeholder: "Ej: 001234567890",
    instructions: [
      "Copia tu número de guía.",
      "Haz clic en el botón \"Rastrear en Shalom\".",
      "Si te solicita iniciar sesión, busca la opción de \"Rastreo de Envíos\" o \"Consulta de Guía\".",
      "Ingresa el número de guía sin guiones."
    ]
  }
];

export const ShippingDialog = ({ open, onOpenChange, order, onSuccess }: ShippingDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [shippingCompany, setShippingCompany] = useState(order?.shipping_company || "");
  const [trackingCode, setTrackingCode] = useState(order?.tracking_code || "");
  const [voucherUrl, setVoucherUrl] = useState(order?.shipping_voucher_url || "");
  const [voucherPreview, setVoucherPreview] = useState<string | null>(order?.shipping_voucher_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedCompany = SHIPPING_COMPANIES.find(c => c.id === shippingCompany);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor selecciona una imagen válida"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "La imagen no debe superar los 5MB"
      });
      return;
    }

    setUploadingImage(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `shipping-voucher-${order.id}-${Date.now()}.${fileExt}`;
      const filePath = `shipping-vouchers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setVoucherUrl(publicUrl);
      setVoucherPreview(publicUrl);

      toast({
        title: "¡Imagen subida!",
        description: "El boucher de envío se ha subido correctamente"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al subir la imagen"
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shippingCompany || !trackingCode) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor completa la empresa y el código de seguimiento"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          shipping_company: shippingCompany,
          tracking_code: trackingCode,
          shipping_voucher_url: voucherUrl,
          shipped_at: new Date().toISOString(),
          status: "En Camino"
        })
        .eq('id', order.id);

      if (error) throw error;

      toast({
        title: "¡Éxito!",
        description: "Información de envío guardada correctamente"
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Ocurrió un error al guardar"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            Información de Envío
          </DialogTitle>
          <DialogDescription>
            Pedido #{order.order_number}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 py-4">
            {/* Order Info Card */}
            <div className="p-4 bg-secondary rounded-xl border">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{order.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                  <p className="text-sm mt-1">{order.product_name}</p>
                  <p className="text-lg font-bold text-primary mt-1">S/ {parseFloat(order.amount).toFixed(2)}</p>
                </div>
              </div>
              {order.shipping_address && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {order.shipping_address}, {order.shipping_city}
                </div>
              )}
            </div>

            {/* Shipping Company Select */}
            <div className="space-y-2">
              <Label htmlFor="company" className="text-sm font-medium">
                Empresa de Envío *
              </Label>
              <Select value={shippingCompany} onValueChange={setShippingCompany}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecciona una empresa" />
                </SelectTrigger>
                <SelectContent>
                  {SHIPPING_COMPANIES.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      <span className="flex items-center gap-2">
                        <company.icon className="h-5 w-5" />
                        <span className="font-medium">{company.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tracking Code Input */}
            <div className="space-y-2">
              <Label htmlFor="tracking" className="text-sm font-medium">
                Código de Seguimiento *
              </Label>
              <Input
                id="tracking"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder={selectedCompany?.placeholder || "Ingresa el código de seguimiento"}
                className="h-12 text-lg font-mono"
              />
              {selectedCompany && (
                <p className="text-xs text-muted-foreground">
                  Formato: {selectedCompany.placeholder}
                </p>
              )}
            </div>

            {/* Voucher Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Boucher de Envío (opcional)
              </Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {voucherPreview ? (
                <div className="relative group">
                  <img
                    src={voucherPreview}
                    alt="Boucher de envío"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cambiar"}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setVoucherUrl("");
                        setVoucherPreview(null);
                      }}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="w-full h-32 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  {uploadingImage ? (
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  ) : (
                    <>
                      <div className="p-3 bg-secondary rounded-full">
                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Haz clic para subir el boucher
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Preview Card */}
            {selectedCompany && trackingCode && (
              <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Vista previa del cliente</p>
                <div className="flex items-center gap-2 mb-2">
                  <selectedCompany.icon className="h-6 w-6" />
                  <span className="font-semibold">{selectedCompany.name}</span>
                </div>
                <p className="font-mono text-lg font-bold text-primary">{trackingCode}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => window.open(selectedCompany.trackingUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Rastrear en {selectedCompany.name}
                </Button>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !shippingCompany || !trackingCode}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Truck className="mr-2 h-4 w-4" />
              Guardar Envío
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
