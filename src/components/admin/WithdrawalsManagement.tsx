import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Banknote, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search,
  Loader2,
  AlertTriangle,
  TrendingDown
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface WithdrawalRequest {
  id: string;
  user_id: string;
  email: string;
  amount: number;
  amount_in_soles: number;
  point_value_at_request: number;
  payment_method: string;
  payment_details: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  processed_at: string | null;
}

export const WithdrawalsManagement = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Dialog state
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("withdrawal_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error loading withdrawal requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcess = async (status: "approved" | "rejected") => {
    if (!selectedRequest) return;

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.rpc("process_withdrawal_request", {
        p_request_id: selectedRequest.id,
        p_status: status,
        p_admin_notes: adminNotes || null
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };

      if (result.success) {
        toast({
          title: status === "approved" ? "Retiro aprobado" : "Retiro rechazado",
          description: `La solicitud de ${selectedRequest.email} ha sido ${status === "approved" ? "aprobada" : "rechazada"}`
        });
        setSelectedRequest(null);
        setAdminNotes("");
        loadRequests();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "No se pudo procesar la solicitud"
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al procesar la solicitud"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = requests.filter(r => r.status === "pending").length;
  const approvedTotal = requests
    .filter(r => r.status === "approved")
    .reduce((sum, r) => sum + r.amount_in_soles, 0);
  const pendingTotal = requests
    .filter(r => r.status === "pending")
    .reduce((sum, r) => sum + r.amount_in_soles, 0);

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
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={pendingCount > 0 ? "border-yellow-500/50 bg-yellow-500/5" : ""}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Solicitudes Pendientes</p>
                <p className="text-3xl font-bold">{pendingCount}</p>
                {pendingCount > 0 && (
                  <p className="text-sm text-yellow-600">S/ {pendingTotal.toFixed(2)} por procesar</p>
                )}
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Aprobado</p>
                <p className="text-3xl font-bold text-green-600">S/ {approvedTotal.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Solicitudes</p>
                <p className="text-3xl font-bold">{requests.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Banknote className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Solicitudes de Retiro
          </CardTitle>
          <CardDescription>
            Gestiona las solicitudes de retiro de WinnerPoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {["all", "pending", "approved", "rejected"].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {status === "all" && "Todos"}
                  {status === "pending" && "Pendientes"}
                  {status === "approved" && "Aprobados"}
                  {status === "rejected" && "Rechazados"}
                </Button>
              ))}
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Banknote className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay solicitudes de retiro</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.email}</p>
                        <p className="text-xs text-muted-foreground">{request.payment_details}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-bold">S/ {request.amount_in_soles.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{request.amount.toLocaleString()} WP</p>
                      </div>
                    </TableCell>
                    <TableCell>{getPaymentMethodLabel(request.payment_method)}</TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {format(new Date(request.created_at), "dd/MM/yyyy", { locale: es })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(request.created_at), "HH:mm", { locale: es })}
                      </p>
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-right">
                      {request.status === "pending" ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setAdminNotes("");
                          }}
                        >
                          Procesar
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {request.processed_at 
                            ? format(new Date(request.processed_at), "dd/MM/yyyy", { locale: es })
                            : "-"}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Process Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Procesar Solicitud de Retiro</DialogTitle>
            <DialogDescription>
              Revisa los detalles y aprueba o rechaza la solicitud
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{selectedRequest.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monto:</span>
                  <span className="font-bold text-lg">S/ {selectedRequest.amount_in_soles.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">WinnerPoints:</span>
                  <span>{selectedRequest.amount.toLocaleString()} WP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Método:</span>
                  <span>{getPaymentMethodLabel(selectedRequest.payment_method)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Datos de pago:</span>
                  <span className="font-mono">{selectedRequest.payment_details}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notas del admin (opcional)</label>
                <Textarea
                  placeholder="Ej: Transferencia realizada, referencia: 123456"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0" />
                <p className="text-sm text-yellow-700">
                  Al aprobar, se descontarán {selectedRequest.amount.toLocaleString()} WP de la cuenta del usuario
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="destructive"
              onClick={() => handleProcess("rejected")}
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-1" />}
              Rechazar
            </Button>
            <Button
              onClick={() => handleProcess("approved")}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
              Aprobar y Pagar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
