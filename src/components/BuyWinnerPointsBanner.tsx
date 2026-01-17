import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trophy, MessageCircle, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";

interface BuyWinnerPointsBannerProps {
  variant?: "inline" | "card" | "compact";
  className?: string;
  userEmail?: string;
}

export const BuyWinnerPointsBanner = ({ 
  variant = "card",
  className = "",
  userEmail = ""
}: BuyWinnerPointsBannerProps) => {
  const [customAmount, setCustomAmount] = useState<string>("");
  const WHATSAPP_NUMBER = "+51993516053";

  const generateWhatsAppUrl = (wpAmount: number) => {
    const solesAmount = wpAmount / 10;
    const message = encodeURIComponent(
      `¡Hola! Quiero comprar ${wpAmount} WinnerPoints (S/ ${solesAmount.toFixed(2)}) para mi cuenta en WinnerOrgana.\n\nMi correo: ${userEmail || "[Tu correo aquí]"}`
    );
    return `https://wa.me/${WHATSAPP_NUMBER.replace(/\s/g, "")}?text=${message}`;
  };

  const handleCustomPurchase = () => {
    const amount = parseInt(customAmount);
    if (amount && amount >= 10) {
      window.open(generateWhatsAppUrl(amount), "_blank");
    }
  };

  if (variant === "compact") {
    return (
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => window.open(generateWhatsAppUrl(100), "_blank")}
        className={`gap-2 border-green-300 text-green-700 hover:bg-green-50 ${className}`}
      >
        <MessageCircle className="w-4 h-4" />
        Comprar WP
      </Button>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`flex items-center gap-3 p-3 bg-gradient-to-r from-accent/10 to-primary/10 rounded-lg border border-accent/20 ${className}`}>
        <Trophy className="w-5 h-5 text-accent shrink-0" />
        <p className="text-sm flex-1">
          <span className="font-medium">¿Necesitas más WinnerPoints?</span>
          <span className="text-muted-foreground ml-1">Contáctanos por WhatsApp</span>
        </p>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => window.open(generateWhatsAppUrl(100), "_blank")}
          className="gap-1.5 border-green-300 text-green-700 hover:bg-green-50"
        >
          <MessageCircle className="w-4 h-4" />
          Comprar
        </Button>
      </div>
    );
  }

  const packages = [
    { wp: 100, soles: 10 },
    { wp: 500, soles: 50 },
    { wp: 1000, soles: 100 },
  ];

  // Default card variant
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-primary/30 shadow-lg ${className}`}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      
      {/* Content */}
      <div className="relative p-6 sm:p-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="w-14 h-14 bg-primary/15 rounded-2xl flex items-center justify-center shrink-0">
              <Trophy className="w-7 h-7 text-primary" />
            </div>
            
            {/* Text */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-foreground mb-1">
                Compra WinnerPoints
              </h3>
              <p className="text-sm text-foreground/80">
                Selecciona un paquete o ingresa la cantidad que deseas. 
                <span className="font-semibold text-primary"> 10 WP = S/ 1.00</span>
              </p>
            </div>
          </div>
        </div>

        {/* Clickable packages */}
        <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
          {packages.map((pack) => (
            <button 
              key={pack.wp}
              onClick={() => window.open(generateWhatsAppUrl(pack.wp), "_blank")}
              className="text-center p-3 bg-background rounded-xl border border-primary/20 shadow-sm hover:border-green-500 hover:shadow-md hover:bg-green-50/50 transition-all cursor-pointer group"
            >
              <p className="text-lg sm:text-xl font-bold text-primary group-hover:text-green-600">{pack.wp} WP</p>
              <p className="text-xs sm:text-sm text-foreground/70">S/ {pack.soles}</p>
              <p className="text-[10px] text-green-600 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                Click para comprar
              </p>
            </button>
          ))}
        </div>

        {/* Custom amount input */}
        <div className="mt-4 p-4 bg-muted/50 rounded-xl border border-border">
          <p className="text-sm font-medium text-foreground mb-2">¿Otra cantidad?</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="number"
                min="10"
                step="10"
                placeholder="Ej: 250"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">WP</span>
            </div>
            <Button 
              onClick={handleCustomPurchase}
              disabled={!customAmount || parseInt(customAmount) < 10}
              className="gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <MessageCircle className="w-4 h-4" />
              Comprar
            </Button>
          </div>
          {customAmount && parseInt(customAmount) >= 10 && (
            <p className="text-xs text-muted-foreground mt-2">
              = S/ {(parseInt(customAmount) / 10).toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
