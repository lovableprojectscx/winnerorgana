import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";
import { 
  Download, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  ShoppingCart,
  Calendar,
  FileSpreadsheet,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, isWithinInterval } from "date-fns";
import { es } from "date-fns/locale";

interface ReportsSectionProps {
  orders: any[];
  affiliates: any[];
  products: any[];
  commissions: any[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

export const ReportsSection = ({ orders, affiliates, products, commissions }: ReportsSectionProps) => {
  const [dateRange, setDateRange] = useState("30");
  const [chartType, setChartType] = useState("area");

  // Process sales data by date
  const salesByDate = useMemo(() => {
    const days = parseInt(dateRange);
    const startDate = subDays(new Date(), days);
    const endDate = new Date();
    
    const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });
    
    return dateInterval.map(date => {
      const dayOrders = orders.filter(order => {
        const orderDate = parseISO(order.created_at);
        return format(orderDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      });
      
      const totalSales = dayOrders.reduce((sum, order) => sum + parseFloat(order.amount || 0), 0);
      const orderCount = dayOrders.length;
      
      return {
        date: format(date, 'dd MMM', { locale: es }),
        ventas: totalSales,
        pedidos: orderCount,
        fullDate: format(date, 'yyyy-MM-dd')
      };
    });
  }, [orders, dateRange]);

  // Product performance
  const productPerformance = useMemo(() => {
    const productSales: Record<string, { name: string; cantidad: number; total: number }> = {};
    
    orders.forEach(order => {
      const productName = order.product_name || 'Sin nombre';
      if (!productSales[productName]) {
        productSales[productName] = { name: productName, cantidad: 0, total: 0 };
      }
      productSales[productName].cantidad += 1;
      productSales[productName].total += parseFloat(order.amount || 0);
    });
    
    return Object.values(productSales)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [orders]);

  // Order status distribution
  const orderStatusData = useMemo(() => {
    const statusCount: Record<string, number> = {};
    
    orders.forEach(order => {
      const status = order.status || 'Pendiente';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });
    
    return Object.entries(statusCount).map(([name, value]) => ({ name, value }));
  }, [orders]);

  // Affiliate performance
  const affiliatePerformance = useMemo(() => {
    return affiliates
      .map(affiliate => ({
        name: affiliate.name,
        ventas: parseFloat(affiliate.total_sales || 0),
        comisiones: parseFloat(affiliate.total_commissions || 0),
        referidos: affiliate.referral_count || 0
      }))
      .sort((a, b) => b.ventas - a.ventas)
      .slice(0, 5);
  }, [affiliates]);

  // Commission by level
  const commissionsByLevel = useMemo(() => {
    const levelData: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
    
    commissions.forEach(comm => {
      const level = comm.level || 1;
      levelData[level] += parseFloat(comm.amount || 0);
    });
    
    return [
      { name: 'Nivel 1 (10%)', value: levelData[1], level: 1 },
      { name: 'Nivel 2 (5%)', value: levelData[2], level: 2 },
      { name: 'Nivel 3 (2%)', value: levelData[3], level: 3 }
    ];
  }, [commissions]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalSales = orders.reduce((sum, o) => sum + parseFloat(o.amount || 0), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    const totalCommissions = commissions.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);
    const activeAffiliates = affiliates.filter(a => a.status === 'Activo').length;
    const conversionRate = products.length > 0 ? ((totalOrders / products.length) * 100) : 0;
    
    // Calculate growth (comparing last 15 days vs previous 15 days)
    const midPoint = subDays(new Date(), 15);
    const recentOrders = orders.filter(o => parseISO(o.created_at) >= midPoint);
    const olderOrders = orders.filter(o => parseISO(o.created_at) < midPoint);
    
    const recentSales = recentOrders.reduce((sum, o) => sum + parseFloat(o.amount || 0), 0);
    const olderSales = olderOrders.reduce((sum, o) => sum + parseFloat(o.amount || 0), 0);
    
    const salesGrowth = olderSales > 0 ? ((recentSales - olderSales) / olderSales) * 100 : 0;
    
    return {
      totalSales,
      totalOrders,
      avgOrderValue,
      totalCommissions,
      activeAffiliates,
      conversionRate,
      salesGrowth
    };
  }, [orders, affiliates, products, commissions]);

  // Export functions
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        // Handle values with commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const exportOrders = () => {
    const exportData = orders.map(order => ({
      Numero: order.order_number,
      Cliente: order.customer_name,
      Email: order.customer_email,
      Producto: order.product_name,
      Monto: order.amount,
      Estado: order.status,
      Fecha: format(parseISO(order.created_at), 'dd/MM/yyyy HH:mm')
    }));
    exportToCSV(exportData, 'pedidos');
  };

  const exportAffiliates = () => {
    const exportData = affiliates.map(affiliate => ({
      Nombre: affiliate.name,
      Email: affiliate.email,
      Codigo: affiliate.affiliate_code,
      Nivel: affiliate.level,
      Estado: affiliate.status,
      VentasTotales: affiliate.total_sales,
      ComisionesTotales: affiliate.total_commissions,
      CantidadReferidos: affiliate.referral_count,
      Yape: affiliate.yape_number || '',
      FechaRegistro: format(parseISO(affiliate.created_at), 'dd/MM/yyyy')
    }));
    exportToCSV(exportData, 'afiliados');
  };

  const exportProducts = () => {
    const exportData = products.map(product => ({
      Nombre: product.name,
      Descripcion: product.description || '',
      PrecioWP: product.price,
      Stock: product.stock,
      FechaCreacion: format(parseISO(product.created_at), 'dd/MM/yyyy')
    }));
    exportToCSV(exportData, 'productos');
  };

  const exportSalesReport = () => {
    exportToCSV(salesByDate, 'reporte_ventas');
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'ventas' ? `S/ ${entry.value.toFixed(2)}` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header with filters and exports */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 días</SelectItem>
                <SelectItem value="15">Últimos 15 días</SelectItem>
                <SelectItem value="30">Últimos 30 días</SelectItem>
                <SelectItem value="60">Últimos 60 días</SelectItem>
                <SelectItem value="90">Últimos 90 días</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="area">Área</SelectItem>
                <SelectItem value="bar">Barras</SelectItem>
                <SelectItem value="line">Líneas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={exportSalesReport}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Exportar Ventas
          </Button>
          <Button variant="outline" size="sm" onClick={exportOrders}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Pedidos
          </Button>
          <Button variant="outline" size="sm" onClick={exportAffiliates}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Afiliados
          </Button>
          <Button variant="outline" size="sm" onClick={exportProducts}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Productos
          </Button>
        </div>
      </div>

      {/* Advanced Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Ventas Totales</span>
            </div>
            <p className="text-xl font-bold text-primary">S/ {stats.totalSales.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="w-4 h-4 text-accent" />
              <span className="text-xs text-muted-foreground">Total Pedidos</span>
            </div>
            <p className="text-xl font-bold text-accent">{stats.totalOrders}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-green-600" />
              <span className="text-xs text-muted-foreground">Ticket Promedio</span>
            </div>
            <p className="text-xl font-bold text-green-600">S/ {stats.avgOrderValue.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-muted-foreground">Afiliados Activos</span>
            </div>
            <p className="text-xl font-bold text-blue-600">{stats.activeAffiliates}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-muted-foreground">Comisiones</span>
            </div>
            <p className="text-xl font-bold text-purple-600">S/ {stats.totalCommissions.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <PieChartIcon className="w-4 h-4 text-orange-600" />
              <span className="text-xs text-muted-foreground">Productos</span>
            </div>
            <p className="text-xl font-bold text-orange-600">{products.length}</p>
          </CardContent>
        </Card>
        
        <Card className={`bg-gradient-to-br ${stats.salesGrowth >= 0 ? 'from-green-500/10 to-green-500/5' : 'from-red-500/10 to-red-500/5'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              {stats.salesGrowth >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className="text-xs text-muted-foreground">Crecimiento</span>
            </div>
            <p className={`text-xl font-bold ${stats.salesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.salesGrowth >= 0 ? '+' : ''}{stats.salesGrowth.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Ventas en el Tiempo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'area' ? (
                  <AreaChart data={salesByDate}>
                    <defs>
                      <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPedidos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area type="monotone" dataKey="ventas" name="Ventas (S/)" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorVentas)" />
                    <Area type="monotone" dataKey="pedidos" name="Pedidos" stroke="hsl(var(--accent))" fillOpacity={1} fill="url(#colorPedidos)" />
                  </AreaChart>
                ) : chartType === 'bar' ? (
                  <BarChart data={salesByDate}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="ventas" name="Ventas (S/)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pedidos" name="Pedidos" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <LineChart data={salesByDate}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="ventas" name="Ventas (S/)" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                    <Line type="monotone" dataKey="pedidos" name="Pedidos" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ fill: 'hsl(var(--accent))' }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Product Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Top Productos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={100} />
                  <Tooltip 
                    formatter={(value: number) => [`S/ ${value.toFixed(2)}`, 'Ventas']}
                    contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-accent" />
              Estado de Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [value, 'Pedidos']}
                    contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Commission by Level */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              Comisiones por Nivel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={commissionsByLevel}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: S/${value.toFixed(0)}`}
                    labelLine={false}
                  >
                    {commissionsByLevel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`S/ ${value.toFixed(2)}`, 'Comisión']}
                    contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Affiliate Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            Top Afiliados por Rendimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          {affiliatePerformance.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No hay datos de afiliados</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">#</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Afiliado</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Ventas</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Comisiones</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Referidos</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Rendimiento</th>
                  </tr>
                </thead>
                <tbody>
                  {affiliatePerformance.map((affiliate, index) => (
                    <tr key={index} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <Badge variant={index === 0 ? "default" : index < 3 ? "secondary" : "outline"}>
                          {index + 1}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-medium">{affiliate.name}</td>
                      <td className="py-3 px-4 text-right font-bold text-primary">
                        S/ {affiliate.ventas.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-accent">
                        S/ {affiliate.comisiones.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right">{affiliate.referidos}</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center">
                          <div className="w-24 bg-muted rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                              style={{ 
                                width: `${Math.min((affiliate.ventas / (affiliatePerformance[0]?.ventas || 1)) * 100, 100)}%` 
                              }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
