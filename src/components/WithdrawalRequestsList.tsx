import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, CheckCircle2, XCircle, Banknote } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface WithdrawalRequest {
  id: string;
  amount: number;
  amount_in_soles: number;
  payment_method: string;
  payment_details: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  processed_at: string | null;
}

interface WithdrawalRequestsListProps {
  userId: string;
  refreshTrigger?: number;
}

export const WithdrawalRequestsList = ({ userId, refreshTrigger }: WithdrawalRequestsListProps) => {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const { data, error } = await supabase
          .from("withdrawal_requests")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) throw error;
        setRequests(data || []);
      } catch (error) {
        console.error("Error fetching withdrawal requests:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [userId, refreshTrigger]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/30">
            <Clock className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-green-600">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Aprobado
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rechazado
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "yape": return "Yape";
      case "plin": return "Plin";
      case "transfer": return "Transferencia";
      default: return method;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Mis Solicitudes de Retiro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Banknote className="h-5 w-5" />
          Mis Solicitudes de Retiro
        </CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Banknote className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No tienes solicitudes de retiro aún</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div
                key={request.id}
                className="p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">
                        S/ {request.amount_in_soles.toFixed(2)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({request.amount.toLocaleString()} WP)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{getPaymentMethodLabel(request.payment_method)}</span>
                      <span>•</span>
                      <span>{request.payment_details}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(request.created_at), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                    </p>
                    {request.admin_notes && (
                      <p className="text-sm text-muted-foreground mt-2 p-2 bg-muted rounded">
                        <strong>Nota:</strong> {request.admin_notes}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(request.status)}
                    {request.processed_at && (
                      <span className="text-xs text-muted-foreground">
                        Procesado: {format(new Date(request.processed_at), "dd/MM/yyyy", { locale: es })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
