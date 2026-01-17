import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { 
  Smartphone, 
  Building2, 
  Upload, 
  CheckCircle, 
  Loader2,
  Copy,
  ImageIcon,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentSettings {
  yape_number: string | null;
  plin_number: string | null;
  bank_account: string | null;
  bank_name: string | null;
}

interface DirectPaymentFormProps {
  totalSoles: number;
  onProofUploaded: (proofUrl: string, paymentMethod: string) => void;
  userId: string;
}

export function DirectPaymentForm({ totalSoles, onProofUploaded, userId }: DirectPaymentFormProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadedProof, setUploadedProof] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("yape");

  useEffect(() => {
    loadPaymentSettings();
  }, []);

  const loadPaymentSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("business_settings")
        .select("yape_number, plin_number, bank_account, bank_name")
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error("Error loading payment settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: `${label} copiado al portapapeles`,
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Archivo inválido",
        description: "Solo se permiten imágenes (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Archivo muy grande",
        description: "El tamaño máximo es 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("payment-proofs")
        .getPublicUrl(fileName);

      setUploadedProof(publicUrl);
      onProofUploaded(publicUrl, activeTab);
      
      toast({
        title: "Comprobante subido",
        description: "Tu comprobante de pago ha sido cargado correctamente",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Error al subir",
        description: error.message || "No se pudo subir el comprobante",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          Pago con Dinero Real
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Transfiere el monto y sube tu comprobante
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount to pay */}
        <div className="p-4 bg-primary/10 rounded-lg text-center">
          <p className="text-sm text-muted-foreground mb-1">Monto a pagar</p>
          <p className="text-3xl font-bold text-primary">S/ {totalSoles.toFixed(2)}</p>
        </div>

        {/* Payment method tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="yape" className="flex items-center gap-1">
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">Yape</span>
            </TabsTrigger>
            <TabsTrigger value="plin" className="flex items-center gap-1">
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">Plin</span>
            </TabsTrigger>
            <TabsTrigger value="transfer" className="flex items-center gap-1">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Banco</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="yape" className="mt-4 space-y-3">
            <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Número Yape</p>
                  <p className="text-lg font-mono font-bold text-purple-700 dark:text-purple-300">
                    {settings?.yape_number || "No configurado"}
                  </p>
                </div>
                {settings?.yape_number && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(settings.yape_number!, "Número")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="plin" className="mt-4 space-y-3">
            <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Número Plin</p>
                  <p className="text-lg font-mono font-bold text-green-700 dark:text-green-300">
                    {settings?.plin_number || "No configurado"}
                  </p>
                </div>
                {settings?.plin_number && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(settings.plin_number!, "Número")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="transfer" className="mt-4 space-y-3">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Banco</p>
                  <p className="font-bold text-blue-700 dark:text-blue-300">
                    {settings?.bank_name || "No configurado"}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Número de Cuenta</p>
                    <p className="font-mono font-bold text-blue-700 dark:text-blue-300">
                      {settings?.bank_account || "No configurado"}
                    </p>
                  </div>
                  {settings?.bank_account && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(settings.bank_account!, "Cuenta")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Upload proof section */}
        <div className="space-y-3 pt-2 border-t">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Subir Comprobante de Pago *
          </Label>
          
          {uploadedProof ? (
            <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium text-green-700 dark:text-green-300">
                    Comprobante cargado
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Tu pago será verificado por nuestro equipo
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUploadedProof(null)}
                >
                  Cambiar
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
                id="proof-upload"
              />
              <Label
                htmlFor="proof-upload"
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
              >
                {uploading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground text-center">
                      Toca para subir tu captura de pantalla
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      JPG, PNG (máx. 5MB)
                    </span>
                  </>
                )}
              </Label>
            </div>
          )}
        </div>

        {/* Important notice */}
        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-700 dark:text-amber-300">
            <p className="font-medium">Importante</p>
            <p>Tu pedido quedará en "Pendiente de Verificación" hasta que nuestro equipo confirme tu pago.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
