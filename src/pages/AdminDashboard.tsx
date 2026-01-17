import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Settings,
  LogOut,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  BarChart3,
  Trophy,
  Tags,
  Truck
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProductDialog } from "@/components/admin/ProductDialog";
import { AffiliateDialog } from "@/components/admin/AffiliateDialog";
import { OrderStatusDialog } from "@/components/admin/OrderStatusDialog";
import { ShippingDialog } from "@/components/admin/ShippingDialog";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { ReportsSection } from "@/components/admin/ReportsSection";
import { SettingsDialog } from "@/components/admin/SettingsDialog";
import { WinnerPointsManagement } from "@/components/admin/WinnerPointsManagement";
import { ProductsManagement } from "@/components/admin/ProductsManagement";
import { PaymentVerificationSection } from "@/components/admin/PaymentVerificationSection";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const { toast } = useToast();

  // Dialog states
  const [productDialog, setProductDialog] = useState({ open: false, product: null as any });
  const [affiliateDialog, setAffiliateDialog] = useState({ open: false, affiliate: null as any });
  const [orderDialog, setOrderDialog] = useState({ open: false, order: null as any });
  const [shippingDialog, setShippingDialog] = useState({ open: false, order: null as any });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null as any, type: "product" as "product" | "affiliate" });
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/admin-login");
        return;
      }

      // Check if user has admin role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleError || !roleData) {
        toast({
          variant: "destructive",
          title: "Acceso denegado",
          description: "No tienes permisos de administrador"
        });
        await supabase.auth.signOut();
        navigate("/admin-login");
        return;
      }

      // Load data
      await loadData();
      setIsLoading(false);
    } catch (error) {
      console.error('Auth error:', error);
      navigate("/admin-login");
    }
  };

  const loadData = async () => {
    try {
      const [ordersRes, affiliatesRes, productsRes, commissionsRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('affiliates').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('commissions').select('*').order('created_at', { ascending: false })
      ]);

      if (ordersRes.data) setOrders(ordersRes.data);
      if (affiliatesRes.data) setAffiliates(affiliatesRes.data);
      if (productsRes.data) setProducts(productsRes.data);
      if (commissionsRes.data) setCommissions(commissionsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin-login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <p className="text-primary text-lg">Cargando...</p>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Pedidos",
      value: orders.length.toString(),
      change: "+12.5%",
      icon: <ShoppingCart className="w-6 h-6" />
    },
    {
      title: "Afiliados Activos", 
      value: affiliates.filter(a => a.status === 'Activo').length.toString(),
      change: "+8.2%",
      icon: <TrendingUp className="w-6 h-6" />
    },
    {
      title: "Ventas del Mes",
      value: `S/ ${orders.reduce((sum, o) => sum + parseFloat(o.amount), 0).toFixed(2)}`,
      change: "+15.3%", 
      icon: <DollarSign className="w-6 h-6" />
    },
    {
      title: "Productos",
      value: products.length.toString(),
      change: "+22.1%",
      icon: <Users className="w-6 h-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <header className="bg-background border-b border-primary/20 px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-primary truncate">Panel de Admin</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Winner Organa</p>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-4 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)} className="px-2 sm:px-3">
              <Settings className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Configuración</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="px-2 sm:px-3">
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="p-3 sm:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <ScrollArea className="w-full whitespace-nowrap">
            <TabsList className="inline-flex h-10 items-center justify-start gap-1 p-1 w-max min-w-full sm:w-full sm:grid sm:grid-cols-6">
              <TabsTrigger value="overview" className="text-xs sm:text-sm px-3 sm:px-4">
                <ShoppingCart className="w-4 h-4 sm:hidden" />
                <span className="hidden sm:inline">Resumen</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-1.5 text-xs sm:text-sm px-3 sm:px-4">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Reportes</span>
              </TabsTrigger>
              <TabsTrigger value="winnerpoints" className="flex items-center gap-1.5 text-xs sm:text-sm px-3 sm:px-4">
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">WinnerPoints</span>
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-1.5 text-xs sm:text-sm px-3 sm:px-4">
                <DollarSign className="w-4 h-4" />
                <span className="hidden sm:inline">Pagos</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-1.5 text-xs sm:text-sm px-3 sm:px-4">
                <Truck className="w-4 h-4 sm:hidden" />
                <span className="hidden sm:inline">Pedidos</span>
              </TabsTrigger>
              <TabsTrigger value="affiliates" className="flex items-center gap-1.5 text-xs sm:text-sm px-3 sm:px-4">
                <Users className="w-4 h-4 sm:hidden" />
                <span className="hidden sm:inline">Afiliados</span>
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center gap-1.5 text-xs sm:text-sm px-3 sm:px-4">
                <Tags className="w-4 h-4 sm:hidden" />
                <span className="hidden sm:inline">Productos</span>
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" className="sm:hidden" />
          </ScrollArea>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                          {stat.title}
                        </p>
                        <p className="text-lg sm:text-2xl font-bold truncate">{stat.value}</p>
                        <p className="text-xs text-green-600 mt-0.5 sm:mt-1">{stat.change}</p>
                      </div>
                      <div className="text-primary flex-shrink-0">
                        {stat.icon}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader className="px-4 sm:px-6 py-4">
                <CardTitle className="text-lg sm:text-xl">Pedidos Recientes</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                {orders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No hay pedidos recientes</p>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 4).map((order) => (
                      <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border border-border rounded-lg gap-2 sm:gap-4">
                        <div className="min-w-0">
                          <p className="font-medium text-sm sm:text-base truncate">{order.order_number} - {order.customer_name}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">{order.product_name}</p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-2 sm:text-right">
                          <p className="font-bold text-sm sm:text-base text-primary">S/ {parseFloat(order.amount).toFixed(2)}</p>
                          <Badge variant={order.status === "Completado" ? "default" : order.status === "Procesando" ? "secondary" : "outline"} className="text-xs">
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <ReportsSection 
              orders={orders}
              affiliates={affiliates}
              products={products}
              commissions={commissions}
            />
          </TabsContent>

          <TabsContent value="winnerpoints" className="space-y-6">
            <WinnerPointsManagement />
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <PaymentVerificationSection />
          </TabsContent>

          <TabsContent value="orders" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-6 py-4">
                <CardTitle className="text-lg sm:text-xl">Pedidos</CardTitle>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                    <Filter className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Filtrar</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                    <Search className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Buscar</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                {orders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No hay pedidos</p>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border border-border rounded-lg gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-sm sm:text-base">{order.order_number}</p>
                            <Badge variant={order.status === "Completado" ? "default" : order.status === "En Camino" ? "secondary" : "outline"} className="text-xs">
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">{order.customer_name}</p>
                          <p className="text-xs sm:text-sm truncate">{order.product_name}</p>
                          {order.shipping_company && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                              <Truck className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{order.shipping_company === 'olva' ? 'Olva' : 'Shalom'} {order.tracking_code && `• ${order.tracking_code}`}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                          <p className="font-bold text-sm sm:text-base text-primary">S/ {parseFloat(order.amount).toFixed(2)}</p>
                          <div className="flex gap-1.5 sm:gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setOrderDialog({ open: true, order })}
                              title="Cambiar estado"
                              className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setShippingDialog({ open: true, order })}
                              title="Información de envío"
                              className="text-primary h-8 w-8 p-0 sm:h-9 sm:w-9"
                            >
                              <Truck className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="affiliates" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-6 py-4">
                <CardTitle className="text-lg sm:text-xl">Afiliados</CardTitle>
                <Button onClick={() => setAffiliateDialog({ open: true, affiliate: null })} size="sm" className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Afiliado
                </Button>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                {affiliates.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No hay afiliados registrados</p>
                ) : (
                  <div className="space-y-3">
                    {affiliates.map((affiliate) => (
                      <div key={affiliate.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border border-border rounded-lg gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-sm sm:text-base">{affiliate.name}</p>
                            <Badge variant={affiliate.status === "Activo" ? "default" : "secondary"} className="text-xs">
                              {affiliate.status}
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">{affiliate.email}</p>
                          <p className="text-xs sm:text-sm font-mono">Código: {affiliate.affiliate_code}</p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                          <div className="text-left sm:text-right">
                            <p className="font-bold text-sm sm:text-base text-primary">S/ {parseFloat(affiliate.total_sales).toFixed(2)}</p>
                            <Badge variant="outline" className="text-xs">{affiliate.level}</Badge>
                          </div>
                          <div className="flex gap-1.5 sm:gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setAffiliateDialog({ open: true, affiliate })}
                              title="Editar afiliado"
                              className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setDeleteDialog({ open: true, item: affiliate, type: "affiliate" })}
                              title="Eliminar afiliado"
                              className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-4 sm:space-y-6">
            <ProductsManagement
              products={products}
              onEditProduct={(product) => setProductDialog({ open: true, product })}
              onDeleteProduct={(product) => setDeleteDialog({ open: true, item: product, type: "product" })}
              onNewProduct={() => setProductDialog({ open: true, product: null })}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <ProductDialog
        open={productDialog.open}
        onOpenChange={(open) => setProductDialog({ open, product: null })}
        product={productDialog.product}
        onSuccess={loadData}
      />

      <AffiliateDialog
        open={affiliateDialog.open}
        onOpenChange={(open) => setAffiliateDialog({ open, affiliate: null })}
        affiliate={affiliateDialog.affiliate}
        onSuccess={loadData}
      />

      <OrderStatusDialog
        open={orderDialog.open}
        onOpenChange={(open) => setOrderDialog({ open, order: null })}
        order={orderDialog.order}
        onSuccess={loadData}
      />

      <ShippingDialog
        open={shippingDialog.open}
        onOpenChange={(open) => setShippingDialog({ open, order: null })}
        order={shippingDialog.order}
        onSuccess={loadData}
      />

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        item={deleteDialog.item}
        itemType={deleteDialog.type}
        onSuccess={loadData}
      />

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </div>
  );
};

export default AdminDashboard;