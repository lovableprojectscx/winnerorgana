import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Plus, 
  Search, 
  MessageCircle,
  History,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UserCredit {
  id: string;
  user_id: string;
  email: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

interface CreditTransaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
  user_credit_id: string;
}

export const CreditsManagement = () => {
  const { toast } = useToast();
  const [userCredits, setUserCredits] = useState<UserCredit[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Form state for adding credits
  const [addForm, setAddForm] = useState({
    email: "",
    amount: "",
    description: "Créditos añadidos por admin"
  });

  const WHATSAPP_NUMBER = "+51993516053";
  const WHATSAPP_MESSAGE = encodeURIComponent("¡Hola! Quiero comprar WinnerPoints para mi cuenta en WinnerOrgana.");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [creditsRes, transactionsRes] = await Promise.all([
        supabase.from("user_credits").select("*").order("updated_at", { ascending: false }),
        supabase.from("credit_transactions").select("*").order("created_at", { ascending: false }).limit(50)
      ]);

      if (creditsRes.data) setUserCredits(creditsRes.data);
      if (transactionsRes.data) setTransactions(transactionsRes.data);
    } catch (error) {
      console.error("Error loading credits data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!addForm.email || !addForm.amount) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Completa todos los campos"
      });
      return;
    }

    const amount = parseFloat(addForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ingresa una cantidad válida"
      });
      return;
    }

    setIsAdding(true);
    try {
      const { data, error } = await supabase.rpc("add_user_credits", {
        p_email: addForm.email.toLowerCase().trim(),
        p_amount: amount,
        p_description: addForm.description || "Créditos añadidos por admin"
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; new_balance?: number; email?: string };

      if (result.success) {
        toast({
          title: "¡Créditos añadidos!",
          description: `Se añadieron ${amount} WinnerPoints a ${result.email}. Nuevo saldo: ${result.new_balance} WP`
        });
        setAddForm({ email: "", amount: "", description: "Créditos añadidos por admin" });
        loadData();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "No se pudieron añadir los créditos"
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al añadir créditos"
      });
    } finally {
      setIsAdding(false);
    }
  };

  const filteredCredits = userCredits.filter(credit =>
    credit.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCreditsInSystem = userCredits.reduce((sum, uc) => sum + Number(uc.balance), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total WinnerPoints</p>
                <p className="text-2xl font-bold">{totalCreditsInSystem.toLocaleString()} WP</p>
                <p className="text-xs text-muted-foreground mt-1">≈ S/ {(totalCreditsInSystem / 10).toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Usuarios con Créditos</p>
                <p className="text-2xl font-bold">{userCredits.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <Plus className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">WhatsApp de Ventas</p>
                <p className="text-lg font-bold text-green-800 dark:text-green-200">{WHATSAPP_NUMBER}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="border-green-300 text-green-700 hover:bg-green-200"
                onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER.replace(/\s/g, "")}?text=${WHATSAPP_MESSAGE}`, "_blank")}
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Abrir
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Credits Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Añadir WinnerPoints
          </CardTitle>
          <CardDescription>
            Agrega créditos a cualquier usuario registrado por su email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddCredits} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email del Usuario</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@email.com"
                value={addForm.email}
                onChange={(e) => setAddForm(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Cantidad (WP)</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                placeholder="100"
                value={addForm.amount}
                onChange={(e) => setAddForm(prev => ({ ...prev, amount: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                type="text"
                placeholder="Motivo del crédito"
                value={addForm.description}
                onChange={(e) => setAddForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full" disabled={isAdding}>
                {isAdding ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Añadiendo...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Añadir Créditos
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Users Credits Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Usuarios con WinnerPoints</CardTitle>
            <CardDescription>Lista de todos los usuarios con créditos en el sistema</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredCredits.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {searchTerm ? "No se encontraron usuarios" : "No hay usuarios con créditos aún"}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">WinnerPoints</TableHead>
                  <TableHead className="text-right">Equivalente</TableHead>
                  <TableHead>Última Actualización</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCredits.map((credit) => (
                  <TableRow key={credit.id}>
                    <TableCell className="font-medium">{credit.email}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="font-mono">
                        <Trophy className="w-3 h-3 mr-1" />
                        {Number(credit.balance).toLocaleString()} WP
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      S/ {(Number(credit.balance) / 10).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(credit.updated_at).toLocaleDateString("es-PE")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Historial de Transacciones
          </CardTitle>
          <CardDescription>Últimas 50 transacciones de WinnerPoints</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No hay transacciones aún</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div 
                  key={tx.id} 
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === "add" ? "bg-green-100 text-green-600" : 
                      tx.type === "purchase" ? "bg-blue-100 text-blue-600" : 
                      "bg-red-100 text-red-600"
                    }`}>
                      {tx.type === "add" ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{tx.description || "Sin descripción"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleString("es-PE")}
                      </p>
                    </div>
                  </div>
                  <Badge variant={tx.type === "add" ? "default" : "secondary"} className="font-mono">
                    {tx.type === "add" ? "+" : ""}{Number(tx.amount).toLocaleString()} WP
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
