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
  Truck,
  Package,
  ArrowRight,
  UserCheck
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
import { motion, AnimatePresence } from "framer-motion";

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
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-full border-t-2 border-b-2 border-primary animate-spin"></div>
        <p className="text-primary font-serif italic text-lg animate-pulse">Cargando Panel...</p>
      </div>
    );
  }

  const salesTotal = orders.reduce((sum, o) => sum + parseFloat(o.amount), 0);

  const stats = [
    {
      title: "Total Pedidos",
      value: orders.length.toString(),
      change: "+12.5%",
      icon: <ShoppingCart className="w-6 h-6 text-emerald-600" />,
      bg: "bg-emerald-50",
      border: "border-emerald-100"
    },
    {
      title: "Afiliados Activos",
      value: affiliates.filter(a => a.status === 'Activo').length.toString(),
      change: "+8.2%",
      icon: <Users className="w-6 h-6 text-blue-600" />,
      bg: "bg-blue-50",
      border: "border-blue-100"
    },
    {
      title: "Ventas Totales",
      value: `S/ ${salesTotal.toFixed(2)}`,
      change: "+15.3%",
      icon: <DollarSign className="w-6 h-6 text-amber-600" />,
      bg: "bg-amber-50",
      border: "border-amber-100"
    },
    {
      title: "Inventario",
      value: products.length.toString(),
      change: "+22.1%",
      icon: <Package className="w-6 h-6 text-purple-600" />,
      bg: "bg-purple-50",
      border: "border-purple-100"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-foreground font-sans">

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-200/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10"
        >
          <div>
            <Badge className="mb-2 bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">
              <UserCheck className="w-3 h-3 mr-1" /> ADMINISTRADOR
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold font-serif text-primary">
              Panel de Control
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestiona tu imperio orgánico desde un solo lugar.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setSettingsOpen(true)}
              className="bg-white border-gray-200 hover:bg-gray-50 hover:text-primary transition-colors shadow-sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configuración
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="bg-white border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 shadow-sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 inline-flex w-full overflow-hidden">
            <ScrollArea className="w-full whitespace-nowrap">
              <TabsList className="h-12 bg-transparent justify-start gap-2 w-full">
                {[
                  { id: "overview", label: "Resumen", icon: ShoppingCart },
                  { id: "orders", label: "Pedidos", icon: Truck },
                  { id: "affiliates", label: "Afiliados", icon: Users },
                  { id: "products", label: "Catálogo", icon: Tags },
                  { id: "reports", label: "Reportes", icon: BarChart3 },
                  { id: "winnerpoints", label: "Puntos WP", icon: Trophy },
                  { id: "payments", label: "Pagos", icon: DollarSign }
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md rounded-xl px-4 py-2.5 transition-all duration-300"
                  >
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
          </div>

          <motion.div
            key={activeTab}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <TabsContent value="overview" className="space-y-8 mt-0">
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <motion.div key={index} variants={itemVariants}>
                    <Card className="border-0 shadow-lg shadow-gray-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden bg-white group">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className={`p-4 rounded-2xl ${stat.bg} ${stat.border} border group-hover:scale-110 transition-transform duration-300`}>
                            {stat.icon}
                          </div>
                          <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                            {stat.change}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
                            {stat.title}
                          </p>
                          <h3 className="text-2xl font-bold text-gray-900 font-serif">
                            {stat.value}
                          </h3>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div variants={itemVariants} className="lg:col-span-2">
                  <Card className="overflow-hidden border-gray-100 shadow-lg shadow-gray-200/50 bg-white">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-6">
                      <div className="flex items-center justify-between">
                        <CardTitle className="font-serif text-xl font-bold text-primary">Ultimos Pedidos</CardTitle>
                        <Button variant="link" onClick={() => setActiveTab("orders")} className="text-amber-600 p-0 h-auto font-bold text-sm">
                          Ver Todos <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {orders.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">Sin pedidos recientes</div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {orders.slice(0, 5).map((order) => (
                            <div key={order.id} className="p-4 hover:bg-gray-50/80 transition-colors flex items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className="hidden sm:flex w-10 h-10 rounded-full bg-primary/10 items-center justify-center text-primary font-bold">
                                  {order.customer_name?.charAt(0) || "C"}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900">{order.customer_name}</p>
                                  <p className="text-xs text-gray-500">{order.product_name}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-primary">S/ {parseFloat(order.amount).toFixed(2)}</p>
                                <Badge variant={order.status === "Completado" ? "default" : "secondary"} className="text-[10px] uppercase">
                                  {order.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className="overflow-hidden border-gray-100 shadow-lg shadow-gray-200/50 bg-white h-full">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-6">
                      <CardTitle className="font-serif text-xl font-bold text-primary">Accesos Rápidos</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid gap-4">
                        <Button
                          className="w-full justify-start h-14 text-base font-medium px-6 bg-gradient-to-r from-primary to-primary-hover hover:scale-[1.02] transition-transform shadow-md"
                          onClick={() => setProductDialog({ open: true, product: null })}
                        >
                          <Plus className="w-5 h-5 mr-3" /> Nuevo Producto
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start h-14 text-base font-medium px-6 border-dashed border-2 border-gray-300 hover:border-amber-500 hover:text-amber-600 hover:bg-amber-50"
                          onClick={() => setAffiliateDialog({ open: true, affiliate: null })}
                        >
                          <Users className="w-5 h-5 mr-3" /> Registrar Afiliado
                        </Button>
                        <Button
                          variant="secondary"
                          className="w-full justify-start h-14 text-base font-medium px-6 bg-amber-100 text-amber-900 hover:bg-amber-200"
                          onClick={() => setSettingsOpen(true)}
                        >
                          <Settings className="w-5 h-5 mr-3" /> Configuración Global
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="reports" className="mt-0">
              <ReportsSection orders={orders} affiliates={affiliates} products={products} commissions={commissions} />
            </TabsContent>

            <TabsContent value="winnerpoints" className="mt-0">
              <WinnerPointsManagement />
            </TabsContent>

            <TabsContent value="payments" className="mt-0">
              <PaymentVerificationSection />
            </TabsContent>

            <TabsContent value="orders" className="mt-0">
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="flex flex-col sm:flex-row items-center justify-between p-6 bg-gray-50/50 border-b border-gray-100">
                  <div className="mb-4 sm:mb-0">
                    <CardTitle className="text-2xl font-serif text-primary mb-1">Gestión de Pedidos</CardTitle>
                    <p className="text-muted-foreground text-sm">Monitorea y actualiza el estado de los envíos</p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" className="flex-1 bg-white border-gray-200">
                      <Filter className="w-4 h-4 mr-2" /> Filtrar
                    </Button>
                    <Button variant="outline" className="flex-1 bg-white border-gray-200">
                      <Search className="w-4 h-4 mr-2" /> Buscar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {orders.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">No hay pedidos registrados</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase font-bold text-gray-500 tracking-wider">
                          <tr>
                            <th className="px-6 py-4 text-left">Pedido</th>
                            <th className="px-6 py-4 text-left">Cliente</th>
                            <th className="px-6 py-4 text-left">Total</th>
                            <th className="px-6 py-4 text-left">Estado</th>
                            <th className="px-6 py-4 text-left">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <span className="font-mono text-sm font-bold text-gray-900">{order.order_number}</span>
                                <div className="text-xs text-gray-500 mt-1">{new Date(order.created_at).toLocaleDateString()}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="font-medium text-gray-900">{order.customer_name}</div>
                                <div className="text-xs text-gray-500 truncate max-w-[150px]">{order.product_name}</div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-bold text-primary">S/ {parseFloat(order.amount).toFixed(2)}</span>
                              </td>
                              <td className="px-6 py-4">
                                <Badge variant={order.status === "Completado" ? "default" : order.status === "En Camino" ? "secondary" : "outline"}>
                                  {order.status}
                                </Badge>
                                {order.shipping_company && (
                                  <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500 font-medium uppercase tracking-wide">
                                    <Truck className="w-3 h-3" />
                                    {order.shipping_company}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0 border-amber-200 text-amber-700 hover:bg-amber-50"
                                    onClick={() => setOrderDialog({ open: true, order })}
                                    title="Editar Estado"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0 border-blue-200 text-blue-700 hover:bg-blue-50"
                                    onClick={() => setShippingDialog({ open: true, order })}
                                    title="Datos de Envío"
                                  >
                                    <Truck className="w-4 h-4" />
                                  </Button>
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
            </TabsContent>

            <TabsContent value="affiliates" className="mt-0">
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="flex flex-col sm:flex-row items-center justify-between p-6 bg-gray-50/50 border-b border-gray-100">
                  <div className="mb-4 sm:mb-0">
                    <CardTitle className="text-2xl font-serif text-primary mb-1">Directorio de Afiliados</CardTitle>
                    <p className="text-muted-foreground text-sm">Gestiona tu red de socios estratégicos</p>
                  </div>
                  <Button onClick={() => setAffiliateDialog({ open: true, affiliate: null })} className="bg-primary hover:bg-primary-hover text-white shadow-md">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Afiliado
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {affiliates.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">No hay afiliados registrados</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6 bg-gray-50/30">
                      {affiliates.map((affiliate) => (
                        <Card key={affiliate.id} className="overflow-hidden hover:shadow-md transition-shadow">
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xl font-bold font-serif shadow-sm">
                                  {affiliate.name?.charAt(0) || "A"}
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-900 line-clamp-1">{affiliate.name}</h4>
                                  <Badge className="bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100 text-[10px]">
                                    {affiliate.level}
                                  </Badge>
                                </div>
                              </div>
                              <Badge variant={affiliate.status === "Activo" ? "default" : "secondary"}>
                                {affiliate.status}
                              </Badge>
                            </div>

                            <div className="space-y-3 text-sm">
                              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-gray-500">Código</span>
                                <span className="font-mono font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{affiliate.affiliate_code}</span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-gray-500">Ventas</span>
                                <span className="font-bold text-primary">S/ {parseFloat(affiliate.total_sales).toFixed(2)}</span>
                              </div>
                              <div className="pt-2 text-xs text-gray-400 truncate">
                                {affiliate.email}
                              </div>
                            </div>

                            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                              <Button
                                variant="outline"
                                className="flex-1 border-gray-200 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50"
                                onClick={() => setAffiliateDialog({ open: true, affiliate })}
                              >
                                <Edit className="w-4 h-4 mr-2" /> Editar
                              </Button>
                              <Button
                                variant="outline"
                                className="w-10 px-0 border-red-100 text-red-400 hover:border-red-200 hover:text-red-600 hover:bg-red-50"
                                onClick={() => setDeleteDialog({ open: true, item: affiliate, type: "affiliate" })}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="mt-0">
              <ProductsManagement
                products={products}
                onEditProduct={(product) => setProductDialog({ open: true, product })}
                onDeleteProduct={(product) => setDeleteDialog({ open: true, item: product, type: "product" })}
                onNewProduct={() => setProductDialog({ open: true, product: null })}
              />
            </TabsContent>
          </motion.div>
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