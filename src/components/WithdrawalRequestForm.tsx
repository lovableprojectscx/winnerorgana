import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Banknote, 
  Loader2, 
  Wallet, 
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WithdrawalRequestFormProps {
  userCreditId: string;
  userId: string;
  email: string;
  balance: number;
  onSuccess: () => void;
}

const POINT_VALUE = 0.10; // S/ 0.10 per WP

export const WithdrawalRequestForm = ({
  userCreditId,
  userId,
  email,
  balance,
  onSuccess
}: WithdrawalRequestFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("yape");
  const [paymentDetails, setPaymentDetails] = useState("");

  const amountNum = parseFloat(amount) || 0;
  const amountInSoles = amountNum * POINT_VALUE;
  const minWithdrawal = 100; // Mínimo 100 WP = S/ 10

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amountNum < minWithdrawal) {
      toast({
        variant: "destructive",
        title: "Monto mínimo",
        description: `El monto mínimo de retiro es ${minWithdrawal} WP (S/ ${(minWithdrawal * POINT_VALUE).toFixed(2)})`
      });
      return;
    }

    if (amountNum > balance) {
      toast({
        variant: "destructive",
        title: "Saldo insuficiente",
        description: "No tienes suficientes WinnerPoints para este retiro"
      });
      return;
    }

    if (!paymentDetails.trim()) {
      toast({
        variant: "destructive",
        title: "Datos requeridos",
        description: "Ingresa el número o cuenta para recibir tu pago"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("withdrawal_requests").insert({
        user_id: userId,
        user_credit_id: userCreditId,
        email,
        amount: amountNum,
        amount_in_soles: amountInSoles,
        point_value_at_request: POINT_VALUE,
        payment_method: paymentMethod,
        payment_details: paymentDetails.trim()
      });

      if (error) throw error;

      toast({
        title: "¡Solicitud enviada!",
        description: "Tu solicitud de retiro está siendo procesada. Te notificaremos cuando sea aprobada."
      });

      setAmount("");
      setPaymentDetails("");
      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo enviar la solicitud"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const presetAmounts = [100, 500, 1000, 2000];

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Banknote className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>Solicitar Retiro</CardTitle>
            <CardDescription>
              Convierte tus WinnerPoints a dinero real
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Balance Display */}
          <div className="p-4 rounded-lg bg-muted/50 border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Saldo disponible:</span>
              </div>
              <span className="font-bold text-lg">{balance.toLocaleString()} WP</span>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-3">
            <Label>Cantidad a retirar (WP)</Label>
            <Input
              type="number"
              min={minWithdrawal}
              max={balance}
              placeholder={`Mínimo ${minWithdrawal} WP`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg"
            />
            
            {/* Preset amounts */}
            <div className="flex flex-wrap gap-2">
              {presetAmounts.filter(a => a <= balance).map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={amountNum === preset ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAmount(preset.toString())}
                >
                  {preset.toLocaleString()} WP
                </Button>
              ))}
              {balance >= minWithdrawal && (
                <Button
                  type="button"
                  variant={amountNum === balance ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAmount(balance.toString())}
                >
                  Todo ({balance.toLocaleString()} WP)
                </Button>
              )}
            </div>
          </div>

          {/* Conversion Preview */}
          {amountNum >= minWithdrawal && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{amountNum.toLocaleString()} WP</span>
                  <ArrowRight className="h-4 w-4" />
                  <span className="font-bold">S/ {amountInSoles.toFixed(2)}</span>
                </div>
                <p className="text-xs mt-1">Tipo de cambio: 1 WP = S/ {POINT_VALUE}</p>
              </AlertDescription>
            </Alert>
          )}

          {/* Payment Method */}
          <div className="space-y-3">
            <Label>Método de pago</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yape" id="yape" />
                <Label htmlFor="yape" className="cursor-pointer font-normal">
                  Yape
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="plin" id="plin" />
                <Label htmlFor="plin" className="cursor-pointer font-normal">
                  Plin
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="transfer" id="transfer" />
                <Label htmlFor="transfer" className="cursor-pointer font-normal">
                  Transferencia Bancaria
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Payment Details */}
          <div className="space-y-2">
            <Label>
              {paymentMethod === "transfer" 
                ? "Número de cuenta (incluir banco)"
                : `Número de ${paymentMethod === "yape" ? "Yape" : "Plin"}`}
            </Label>
            <Input
              type="text"
              placeholder={
                paymentMethod === "transfer"
                  ? "Ej: BCP - 123456789012"
                  : "Ej: 987654321"
              }
              value={paymentDetails}
              onChange={(e) => setPaymentDetails(e.target.value)}
            />
          </div>

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Las solicitudes son procesadas en un máximo de 24-48 horas hábiles. 
              Recibirás una notificación cuando tu retiro sea aprobado.
            </AlertDescription>
          </Alert>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isSubmitting || amountNum < minWithdrawal || amountNum > balance}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando solicitud...
              </>
            ) : (
              <>
                <Banknote className="h-4 w-4 mr-2" />
                Solicitar Retiro de S/ {amountInSoles.toFixed(2)}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
