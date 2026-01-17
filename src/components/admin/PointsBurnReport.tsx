import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  TrendingDown, 
  Loader2, 
  CalendarIcon, 
  Download,
  Flame,
  DollarSign,
  ShoppingCart,
  Banknote,
  PieChart
} from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface BurnTransaction {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  created_at: string;
  point_value_at_time: number;
  user_credit_id: string;
  email?: string;
}

export const PointsBurnReport = () => {
  const [transactions, setTransactions] = useState<BurnTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });

  useEffect(() => {
    loadBurnData();
  }, [dateRange]);

  const loadBurnData = async () => {
    setIsLoading(true);
    try {
      // Get transactions where amount is negative (burns/spends)
      const { data, error } = await supabase
        .from("credit_transactions")
        .select(`
          id,
          amount,
          type,
          description,
          created_at,
          point_value_at_time,
          user_credit_id
        `)
        .lt("amount", 0)
        .gte("created_at", dateRange.from.toISOString())
        .lte("created_at", dateRange.to.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get user emails for the transactions
      const userCreditIds = [...new Set((data || []).map(t => t.user_credit_id))];
      
      if (userCreditIds.length > 0) {
        const { data: credits } = await supabase
          .from("user_credits")
          .select("id, email")
          .in("id", userCreditIds);

        const emailMap = new Map(credits?.map(c => [c.id, c.email]) || []);
        
        const enrichedData = (data || []).map(t => ({
          ...t,
          email: emailMap.get(t.user_credit_id) || "Desconocido"
        }));

        setTransactions(enrichedData);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error loading burn data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    const totalBurned = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    // Calculate monetary value using point_value_at_time for each transaction
    const totalMonetaryValue = transactions.reduce((sum, t) => {
      return sum + (Math.abs(t.amount) * (t.point_value_at_time || 0.10));
    }, 0);

    // Group by type
    const byType = transactions.reduce((acc, t) => {
      const type = t.type || "other";
      if (!acc[type]) {
        acc[type] = { count: 0, amount: 0, monetaryValue: 0 };
      }
      acc[type].count++;
      acc[type].amount += Math.abs(t.amount);
      acc[type].monetaryValue += Math.abs(t.amount) * (t.point_value_at_time || 0.10);
      return acc;
    }, {} as Record<string, { count: number; amount: number; monetaryValue: number }>);

    return {
      totalBurned,
      totalMonetaryValue,
      transactionCount: transactions.length,
      byType
    };
  }, [transactions]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return Object.entries(stats.byType).map(([type, data]) => ({
      name: type === "purchase" ? "Compras" : type === "withdrawal" ? "Retiros" : "Otros",
      value: data.amount,
      monetaryValue: data.monetaryValue,
      count: data.count
    }));
  }, [stats.byType]);

  const COLORS = ["#10b981", "#f59e0b", "#6366f1", "#ec4899"];

  const exportToCSV = () => {
    const headers = ["Fecha", "Email", "Tipo", "Descripción", "WP Quemados", "Valor S/", "Valor WP al momento"];
    const rows = transactions.map(t => [
      format(new Date(t.created_at), "dd/MM/yyyy HH:mm"),
      t.email,
      t.type,
      t.description || "",
      Math.abs(t.amount),
      (Math.abs(t.amount) * (t.point_value_at_time || 0.10)).toFixed(2),
      t.point_value_at_time || 0.10
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `reporte-quema-puntos-${format(dateRange.from, "yyyy-MM-dd")}-${format(dateRange.to, "yyyy-MM-dd")}.csv`;
    link.click();
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "purchase": return "Compra";
      case "withdrawal": return "Retiro";
      default: return type;
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case "purchase": return "bg-blue-500/10 text-blue-700 border-blue-500/30";
      case "withdrawal": return "bg-orange-500/10 text-orange-700 border-orange-500/30";
      default: return "bg-gray-500/10 text-gray-700 border-gray-500/30";
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
      {/* Header with date filters */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-500" />
            Reporte de Quema de Puntos
          </h2>
          <p className="text-muted-foreground">
            Historial de WinnerPoints gastados/canjeados con valor monetario histórico
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(dateRange.from, "d MMM", { locale: es })} - {format(dateRange.to, "d MMM yyyy", { locale: es })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDateRange({ from: range.from, to: range.to });
                  }
                }}
                locale={es}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Quick date filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDateRange({
            from: startOfMonth(new Date()),
            to: endOfMonth(new Date())
          })}
        >
          Este mes
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDateRange({
            from: startOfMonth(subMonths(new Date(), 1)),
            to: endOfMonth(subMonths(new Date(), 1))
          })}
        >
          Mes anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDateRange({
            from: startOfMonth(subMonths(new Date(), 2)),
            to: endOfMonth(new Date())
          })}
        >
          Últimos 3 meses
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-orange-500/30 bg-orange-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total WP Quemados</p>
                <p className="text-3xl font-bold text-orange-600">{stats.totalBurned.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Flame className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Monetario</p>
                <p className="text-3xl font-bold text-green-600">S/ {stats.totalMonetaryValue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">Calculado con valor histórico del WP</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compras</p>
                <p className="text-3xl font-bold">{stats.byType.purchase?.count || 0}</p>
                <p className="text-sm text-muted-foreground">{(stats.byType.purchase?.amount || 0).toLocaleString()} WP</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Retiros</p>
                <p className="text-3xl font-bold">{stats.byType.withdrawal?.count || 0}</p>
                <p className="text-sm text-muted-foreground">{(stats.byType.withdrawal?.amount || 0).toLocaleString()} WP</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Banknote className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart and Table Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PieChart className="h-4 w-4" />
              Distribución por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPie>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `${value.toLocaleString()} WP`,
                      name
                    ]}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Sin datos para mostrar
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingDown className="h-4 w-4" />
              Detalle de Transacciones
            </CardTitle>
            <CardDescription>
              {transactions.length} transacciones en el período seleccionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Flame className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No hay quema de puntos en este período</p>
              </div>
            ) : (
              <div className="max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">WP</TableHead>
                      <TableHead className="text-right">Valor S/</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.slice(0, 50).map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="text-sm">
                          {format(new Date(tx.created_at), "dd/MM/yy HH:mm", { locale: es })}
                        </TableCell>
                        <TableCell className="text-sm max-w-[150px] truncate">
                          {tx.email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-xs", getTypeBadgeClass(tx.type))}>
                            {getTypeLabel(tx.type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-orange-600">
                          -{Math.abs(tx.amount).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono text-green-600">
                          S/ {(Math.abs(tx.amount) * (tx.point_value_at_time || 0.10)).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
