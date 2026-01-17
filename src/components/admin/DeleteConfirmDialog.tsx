import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: any;
  itemType: "product" | "affiliate";
  onSuccess: () => void;
}

export const DeleteConfirmDialog = ({ 
  open, 
  onOpenChange, 
  item, 
  itemType, 
  onSuccess 
}: DeleteConfirmDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);

    try {
      const table = itemType === "product" ? "products" : "affiliates";
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: "¡Eliminado!",
        description: `${itemType === "product" ? "Producto" : "Afiliado"} eliminado correctamente`
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Ocurrió un error al eliminar"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  const itemName = itemType === "product" ? item.name : item.name;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            ¿Estás seguro?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Esta acción no se puede deshacer. Esto eliminará permanentemente:
            </p>
            <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              <p className="font-semibold text-foreground">{itemName}</p>
              {itemType === "affiliate" && (
                <p className="text-sm text-muted-foreground">Código: {item.affiliate_code}</p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Eliminar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};