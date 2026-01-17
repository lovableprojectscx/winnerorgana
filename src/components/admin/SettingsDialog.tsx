import { useState, useEffect } from "react";
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
import { Loader2, Building2, Percent, Bell } from "lucide-react";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="business" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Negocio
              </TabsTrigger>
              <TabsTrigger value="commissions" className="flex items-center gap-2">
                <Percent className="w-4 h-4" />
                Comisiones
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
