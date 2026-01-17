import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Tags, Plus, Edit, Trash2 } from "lucide-react";
import { CategoriesManagement } from "./CategoriesManagement";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number | null;
}

interface ProductsManagementProps {
  products: Product[];
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onNewProduct: () => void;
}

export const ProductsManagement = ({ 
  products, 
  onEditProduct, 
  onDeleteProduct, 
  onNewProduct 
}: ProductsManagementProps) => {
  const [activeSubTab, setActiveSubTab] = useState("products");

  return (
    <div className="space-y-4">
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-xs">
          <TabsTrigger value="products" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <Package className="w-4 h-4" />
            <span>Productos</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <Tags className="w-4 h-4" />
            <span>Categorías</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-6 py-4">
              <CardTitle className="text-lg sm:text-xl">Productos</CardTitle>
              <Button onClick={onNewProduct} size="sm" className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Producto
              </Button>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              {products.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No hay productos registrados</p>
              ) : (
                <div className="space-y-3">
                  {products.map((product) => (
                    <div key={product.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border border-border rounded-lg gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">{product.name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                          {product.description?.slice(0, 60)}{product.description && product.description.length > 60 ? '...' : ''}
                        </p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                        <div className="text-left sm:text-right">
                          <p className="font-bold text-sm sm:text-base text-primary">{(Number(product.price) * 10).toLocaleString()} WP</p>
                          <p className="text-xs text-muted-foreground">Stock: {product.stock}</p>
                        </div>
                        <div className="flex gap-1.5 sm:gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onEditProduct(product)}
                            title="Editar producto"
                            className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onDeleteProduct(product)}
                            title="Eliminar producto"
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

        <TabsContent value="categories" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Categorías</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoriesManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
