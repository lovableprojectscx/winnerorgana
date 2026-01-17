import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserCredits } from "@/hooks/useUserCredits";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BuyWinnerPointsBanner } from "@/components/BuyWinnerPointsBanner";
import { WithdrawalRequestForm } from "@/components/WithdrawalRequestForm";
import { WithdrawalRequestsList } from "@/components/WithdrawalRequestsList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, ArrowUpCircle, ArrowDownCircle, Clock, Wallet, TrendingUp, Banknote } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  created_at: string;
}

const MiBilletera = () => {
  const navigate = useNavigate();
  const { credits, isLoading, isAuthenticated, balance, balanceInSoles, refetch } = useUserCredits();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [withdrawalRefresh, setWithdrawalRefresh] = useState(0);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) setUserId(session.user.id);
    };
    getUser();
    
    if (!isLoading && !isAuthenticated) {
      navigate("/login-afiliado");
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!credits?.id) return;

      try {
        const { data, error } = await supabase
          .from("credit_transactions")
          .select("id, amount, type, description, created_at")
          .eq("user_credit_id", credits.id)
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) {
          console.error("Error fetching transactions:", error);
        } else {
          setTransactions(data || []);
        }
      } catch (error) {
        console.error("Error in fetchTransactions:", error);
      } finally {
        setLoadingTransactions(false);
      }
    };

    if (credits?.id) {
      fetchTransactions();
    } else if (!isLoading) {
      setLoadingTransactions(false);
    }
  }, [credits?.id, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const totalReceived = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalSpent = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Page Title */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground flex items-center justify-center gap-3">
              <Wallet className="h-8 w-8 text-primary" />
              Mi Billetera WinnerPoints
            </h1>
            <p className="text-muted-foreground">
              Gestiona tus WinnerPoints y revisa tu historial de transacciones
            </p>
          </div>

          {/* Balance Card */}
          <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20">
                  <Trophy className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Tu saldo actual</p>
                  <p className="text-5xl md:text-6xl font-bold text-primary">
                    {balance.toLocaleString()}
                  </p>
                  <p className="text-lg text-muted-foreground mt-1">WinnerPoints</p>
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="text-lg">
                    Tu moneda virtual para realizar compras
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-green-500/20 bg-green-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-green-500/20">
                    <ArrowUpCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total recibido</p>
                    <p className="text-2xl font-bold text-green-600">
                      +{totalReceived.toLocaleString()} WP
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-red-500/20 bg-red-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-red-500/20">
                    <ArrowDownCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total gastado</p>
                    <p className="text-2xl font-bold text-red-600">
                      -{totalSpent.toLocaleString()} WP
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for Buy/Withdraw */}
          <Tabs defaultValue="buy" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="buy">Comprar WP</TabsTrigger>
              <TabsTrigger value="withdraw" className="flex items-center gap-2">
                <Banknote className="h-4 w-4" />
                Retirar WP
              </TabsTrigger>
            </TabsList>
            <TabsContent value="buy" className="mt-4">
              <BuyWinnerPointsBanner userEmail={credits?.email} />
            </TabsContent>
            <TabsContent value="withdraw" className="mt-4 space-y-6">
              {credits?.id && userId && (
                <>
                  <WithdrawalRequestForm
                    userCreditId={credits.id}
                    userId={userId}
                    email={credits.email}
                    balance={balance}
                    onSuccess={() => {
                      setWithdrawalRefresh(prev => prev + 1);
                      refetch();
                    }}
                  />
                  <WithdrawalRequestsList userId={userId} refreshTrigger={withdrawalRefresh} />
                </>
              )}
            </TabsContent>
          </Tabs>

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Historial de Transacciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTransactions ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Sin transacciones aún</p>
                  <p className="text-sm">
                    Tus movimientos de WinnerPoints aparecerán aquí
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          transaction.amount > 0 
                            ? "bg-green-500/20" 
                            : "bg-red-500/20"
                        }`}>
                          {transaction.amount > 0 ? (
                            <ArrowUpCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <ArrowDownCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {transaction.description || (
                              transaction.type === "add" 
                                ? "Créditos añadidos" 
                                : "Compra realizada"
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(transaction.created_at), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={transaction.amount > 0 ? "default" : "destructive"}
                          className={transaction.amount > 0 
                            ? "bg-green-600 hover:bg-green-700" 
                            : ""
                          }
                        >
                          {transaction.amount > 0 ? "+" : ""}{transaction.amount.toLocaleString()} WP
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MiBilletera;
