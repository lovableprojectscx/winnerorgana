import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Banknote, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type PaymentType = "winner_points" | "dinero_real";

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentType;
  onMethodChange: (method: PaymentType) => void;
  balance: number;
  totalWP: number;
  totalSoles: number;
  hasEnoughCredits: boolean;
}

export function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
  balance,
  totalWP,
  totalSoles,
  hasEnoughCredits,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Elige tu método de pago</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* WinnerPoints Option */}
        <Card
          className={cn(
            "cursor-pointer transition-all border-2",
            selectedMethod === "winner_points"
              ? "border-accent bg-accent/5 shadow-md"
              : "border-border hover:border-accent/50",
            !hasEnoughCredits && "opacity-60"
          )}
          onClick={() => hasEnoughCredits && onMethodChange("winner_points")}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                selectedMethod === "winner_points" ? "bg-accent" : "bg-muted"
              )}>
                <Trophy className={cn(
                  "w-5 h-5",
                  selectedMethod === "winner_points" ? "text-accent-foreground" : "text-muted-foreground"
                )} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">WinnerPoints</span>
                  {selectedMethod === "winner_points" && (
                    <CheckCircle className="w-4 h-4 text-accent" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Pago inmediato con tu saldo
                </p>
                <div className="mt-2">
                  <span className="text-lg font-bold text-primary">{totalWP.toLocaleString()} WP</span>
                </div>
                <div className="mt-1">
                  {hasEnoughCredits ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Saldo: {balance.toLocaleString()} WP
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      Te faltan {(totalWP - balance).toLocaleString()} WP
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Direct Payment Option */}
        <Card
          className={cn(
            "cursor-pointer transition-all border-2",
            selectedMethod === "dinero_real"
              ? "border-primary bg-primary/5 shadow-md"
              : "border-border hover:border-primary/50"
          )}
          onClick={() => onMethodChange("dinero_real")}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                selectedMethod === "dinero_real" ? "bg-primary" : "bg-muted"
              )}>
                <Banknote className={cn(
                  "w-5 h-5",
                  selectedMethod === "dinero_real" ? "text-primary-foreground" : "text-muted-foreground"
                )} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Dinero Real</span>
                  {selectedMethod === "dinero_real" && (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Yape, Plin o Transferencia
                </p>
                <div className="mt-2">
                  <span className="text-lg font-bold text-primary">S/ {totalSoles.toFixed(2)}</span>
                </div>
                <div className="mt-1">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Verificación manual
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
