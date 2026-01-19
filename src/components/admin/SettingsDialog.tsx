import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Building2, Percent, Bell, CreditCard, Plus, Trash2, Upload, QrCode } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PaymentMethod {
  id: string;
  name: string;
  account_number: string;
  account_holder: string;
  qr_code_url: string | null;
  is_active: boolean;
}

export const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [newMethod, setNewMethod] = useState({
    name: "",
    account_number: "",
    account_holder: "",
    qr_code_url: ""
  });
  const [isUploadingQr, setIsUploadingQr] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState({
    id: "",
    business_name: "Winner Organa",
    logo_url: "",
    contact_email: "",
    contact_phone: "",
    whatsapp_number: "",
    address: "",
    commission_level_1: 10,
    commission_level_2: 4,
    commission_level_3: 2,
    commission_level_4: 2,
    commission_level_5: 1,
    commission_level_6: 1,
    commission_level_7: 1,
    notify_new_orders: true,
    notify_new_affiliates: true,
  });

  useEffect(() => {
    if (open) {
      loadSettings();
      loadPaymentMethods();
    }
  }, [open]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("business_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          id: data.id,
          business_name: data.business_name || "Winner Organa",
          logo_url: data.logo_url || "",
          contact_email: data.contact_email || "",
          contact_phone: data.contact_phone || "",
          whatsapp_number: data.whatsapp_number || "",
          address: data.address || "",
          commission_level_1: data.commission_level_1 || 10,
          commission_level_2: data.commission_level_2 || 4,
          commission_level_3: data.commission_level_3 || 2,
          commission_level_4: data.commission_level_4 || 2,
          commission_level_5: data.commission_level_5 || 1,
          commission_level_6: data.commission_level_6 || 1,
          commission_level_7: data.commission_level_7 || 1,
          notify_new_orders: data.notify_new_orders ?? true,
          notify_new_affiliates: data.notify_new_affiliates ?? true,
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las configuraciones",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentMethods = async () => {
    setLoadingMethods(true);
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      console.error("Error loading payment methods:", error);
    } finally {
      setLoadingMethods(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("business_settings")
        .update({
          business_name: settings.business_name,
          logo_url: settings.logo_url,
          contact_email: settings.contact_email,
          contact_phone: settings.contact_phone,
          whatsapp_number: settings.whatsapp_number,
          address: settings.address,
          commission_level_1: settings.commission_level_1,
          commission_level_2: settings.commission_level_2,
          commission_level_3: settings.commission_level_3,
          commission_level_4: settings.commission_level_4,
          commission_level_5: settings.commission_level_5,
          commission_level_6: settings.commission_level_6,
          commission_level_7: settings.commission_level_7,
          notify_new_orders: settings.notify_new_orders,
          notify_new_affiliates: settings.notify_new_affiliates,
        })
        .eq("id", settings.id);

      if (error) throw error;

      toast({
        title: "Configuración guardada",
        description: "Los cambios se han guardado correctamente",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron guardar los cambios",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Solo se permiten archivos de imagen"
      });
      return;
    }

    setIsUploadingQr(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-qrs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('payment-qrs')
        .getPublicUrl(fileName);

      setNewMethod({ ...newMethod, qr_code_url: publicUrl });
      toast({ title: "QR subido correctamente" });
    } catch (error) {
      console.error("Error uploading QR:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo subir la imagen QR"
      });
    } finally {
      setIsUploadingQr(false);
    }
  };

  const verifyPaymentMethodsTable = async () => {
    try {
      // Intentamos insertar un registro dummy para verificar si la tabla existe o disparar un error especifico
      // O simplemente leer. Si da error de "relation does not exist", sabemos que tenemos que crearla.
      // Pero como no soy ADMIN de SQL desde aqui, asumo que ya ejecutamos el script SQL anteriormente.
      // Esta funcion es solo un placeholder mental.
    } catch (e) {
      console.log(e);
    }
  }

  const handleAddPaymentMethod = async () => {
    if (!newMethod.name || !newMethod.account_number) {
      toast({
        variant: "destructive",
        title: "Faltan datos",
        description: "El nombre y número/celular son obligatorios"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('payment_methods')
        .insert([{
          name: newMethod.name,
          account_number: newMethod.account_number,
          account_holder: newMethod.account_holder,
          qr_code_url: newMethod.qr_code_url,
          is_active: true
        }]);

      if (error) throw error;

      toast({ title: "Método de pago agregado" });
      setNewMethod({ name: "", account_number: "", account_holder: "", qr_code_url: "" });
      loadPaymentMethods();
    } catch (error) {
      console.error("Error adding payment method:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo agregar el método de pago"
      });
    }
  };

  const handleDeleteMethod = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadPaymentMethods();
      toast({ title: "Método eliminado" });
    } catch (error) {
      console.error("Error deleting method:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el método"
      });
    }
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_active: !currentState })
        .eq('id', id);

      if (error) throw error;
      loadPaymentMethods();
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">
            Configuración del Sistema
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="business" className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="business" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Negocio
              </TabsTrigger>
              <TabsTrigger value="commissions" className="flex items-center gap-2">
                <Percent className="w-4 h-4" />
                Comisiones
              </TabsTrigger>
              <TabsTrigger value="payment" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Pagos
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notificaciones
              </TabsTrigger>
            </TabsList>

            <TabsContent value="business" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="business_name">Nombre del Negocio</Label>
                <Input
                  id="business_name"
                  value={settings.business_name}
                  onChange={(e) =>
                    setSettings({ ...settings, business_name: e.target.value })
                  }
                  placeholder="Winner Organa"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo_url">URL del Logo</Label>
                <Input
                  id="logo_url"
                  value={settings.logo_url}
                  onChange={(e) =>
                    setSettings({ ...settings, logo_url: e.target.value })
                  }
                  placeholder="https://ejemplo.com/logo.png"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Email de Contacto</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) =>
                      setSettings({ ...settings, contact_email: e.target.value })
                    }
                    placeholder="contacto@winnerorgana.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Teléfono de Contacto</Label>
                  <Input
                    id="contact_phone"
                    value={settings.contact_phone}
                    onChange={(e) =>
                      setSettings({ ...settings, contact_phone: e.target.value })
                    }
                    placeholder="+51 999 999 999"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp_number">Número de WhatsApp</Label>
                <Input
                  id="whatsapp_number"
                  value={settings.whatsapp_number}
                  onChange={(e) =>
                    setSettings({ ...settings, whatsapp_number: e.target.value })
                  }
                  placeholder="51999999999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={settings.address}
                  onChange={(e) =>
                    setSettings({ ...settings, address: e.target.value })
                  }
                  placeholder="Dirección del negocio"
                />
              </div>
            </TabsContent>

            <TabsContent value="commissions" className="space-y-4 mt-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  Sistema de comisiones multinivel con 7 niveles (Total: 21%)
                </p>
                <div className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                  7 Niveles
                </div>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {[
                  { key: 'commission_level_1', level: 1, name: 'Vendedor Directo', desc: 'Comisión directa por tus ventas', color: 'border-l-emerald-500' },
                  { key: 'commission_level_2', level: 2, name: 'Mentor Directo', desc: 'Ventas de tus referidos directos', color: 'border-l-blue-500' },
                  { key: 'commission_level_3', level: 3, name: 'Líder de Equipo', desc: 'Ventas del nivel 3', color: 'border-l-purple-500' },
                  { key: 'commission_level_4', level: 4, name: 'Desarrollador', desc: 'Ventas del nivel 4', color: 'border-l-orange-500' },
                  { key: 'commission_level_5', level: 5, name: 'Expansor', desc: 'Ventas del nivel 5', color: 'border-l-pink-500' },
                  { key: 'commission_level_6', level: 6, name: 'Consolidador', desc: 'Ventas del nivel 6', color: 'border-l-cyan-500' },
                  { key: 'commission_level_7', level: 7, name: 'Embajador', desc: 'Ventas del nivel 7', color: 'border-l-amber-500' },
                ].map((item) => (
                  <div
                    key={item.key}
                    className={`flex items-center justify-between p-3 border rounded-lg border-l-4 ${item.color} bg-card hover:bg-muted/50 transition-colors`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          N{item.level}
                        </span>
                        <p className="font-medium text-sm truncate">{item.name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {item.desc}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 ml-2">
                      <Input
                        type="number"
                        className="w-16 text-center text-sm h-8"
                        value={settings[item.key as 'commission_level_1' | 'commission_level_2' | 'commission_level_3' | 'commission_level_4' | 'commission_level_5' | 'commission_level_6' | 'commission_level_7']}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            [item.key]: parseFloat(e.target.value) || 0,
                          })
                        }
                        min={0}
                        max={100}
                      />
                      <span className="text-muted-foreground text-sm">%</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Total de comisiones:</span>
                  <span className="font-bold text-lg text-primary">
                    {(
                      Number(settings.commission_level_1) +
                      Number(settings.commission_level_2) +
                      Number(settings.commission_level_3) +
                      Number(settings.commission_level_4) +
                      Number(settings.commission_level_5) +
                      Number(settings.commission_level_6) +
                      Number(settings.commission_level_7)
                    ).toFixed(0)}%
                  </span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="payment" className="space-y-6 mt-4">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/20">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Agregar Nuevo Método
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <Input
                      placeholder="Nombre (ej: Yape, BCP)"
                      value={newMethod.name}
                      onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                    />
                    <Input
                      placeholder="Número / Cuenta"
                      value={newMethod.account_number}
                      onChange={(e) => setNewMethod({ ...newMethod, account_number: e.target.value })}
                    />
                    <Input
                      placeholder="Titular de la cuenta"
                      value={newMethod.account_holder}
                      onChange={(e) => setNewMethod({ ...newMethod, account_holder: e.target.value })}
                    />
                    <div className="flex gap-2">
                      {newMethod.qr_code_url ? (
                        <div className="flex items-center gap-2 flex-1 p-2 border rounded text-xs truncate bg-green-50">
                          <QrCode className="w-4 h-4 text-green-600" />
                          <span className="truncate">QR subido</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 ml-auto"
                            onClick={() => setNewMethod({ ...newMethod, qr_code_url: "" })}
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex-1">
                          <Input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleQrUpload}
                          />
                          <Button
                            variant="outline"
                            className="w-full dashed border-2 text-muted-foreground"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingQr}
                          >
                            {isUploadingQr ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                            Subir QR
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button onClick={handleAddPaymentMethod} className="w-full" disabled={!newMethod.name || !newMethod.account_number}>
                    Agregar Método de Pago
                  </Button>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">Métodos Activos</h3>
                  {loadingMethods ? (
                    <div className="flex justify-center py-4"><Loader2 className="animate-spin" /></div>
                  ) : paymentMethods.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-4">No hay métodos de pago configurados.</p>
                  ) : (
                    paymentMethods.map(method => (
                      <Card key={method.id} className="overflow-hidden">
                        <CardContent className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {method.qr_code_url ? (
                              <div className="h-10 w-10 rounded-md bg-muted overflow-hidden">
                                <img src={method.qr_code_url} alt="QR" className="h-full w-full object-cover" />
                              </div>
                            ) : (
                              <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-sm flex items-center gap-2">
                                {method.name}
                                {!method.is_active && <Badge variant="secondary" className="text-[10px] h-4">Inactivo</Badge>}
                              </p>
                              <p className="text-xs text-muted-foreground">{method.account_number} • {method.account_holder}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={method.is_active}
                              onCheckedChange={() => handleToggleActive(method.id, method.is_active)}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteMethod(method.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground mb-4">
                Configura las notificaciones que deseas recibir en el panel de administración.
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Nuevos Pedidos</p>
                    <p className="text-sm text-muted-foreground">
                      Recibir alertas cuando lleguen nuevos pedidos
                    </p>
                  </div>
                  <Switch
                    checked={settings.notify_new_orders}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, notify_new_orders: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Nuevos Afiliados</p>
                    <p className="text-sm text-muted-foreground">
                      Recibir alertas cuando se registren nuevos afiliados
                    </p>
                  </div>
                  <Switch
                    checked={settings.notify_new_affiliates}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, notify_new_affiliates: checked })
                    }
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Guardar Cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
