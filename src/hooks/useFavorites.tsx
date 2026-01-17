import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useFavorites = () => {
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    // 1. Check Auth & Load Favorites
    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUserId(session.user.id);
                fetchRemoteFavorites(session.user.id);
            } else {
                setUserId(null);
                setFavorites(new Set());
                setLoading(false);
            }
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUserId(session.user.id);
                fetchRemoteFavorites(session.user.id);
            } else {
                setUserId(null);
                setFavorites(new Set()); // Clear on logout or switch to local
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchRemoteFavorites = async (uid: string) => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("favorites")
                .select("product_id")
                .eq("user_id", uid);

            if (error) throw error;

            const remoteFavs = new Set(data.map((f: any) => f.product_id));
            setFavorites(remoteFavs);
        } catch (error) {
            console.error("Error fetching favorites:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorite = async (productId: string, productName?: string) => {
        if (!userId) {
            toast({
                title: "Inicia sesión",
                description: "Necesitas una cuenta para guardar favoritos.",
                variant: "destructive"
            });
            return;
        }

        const isFav = favorites.has(productId);

        // Optimistic Update
        setFavorites(prev => {
            const next = new Set(prev);
            if (isFav) next.delete(productId);
            else next.add(productId);
            return next;
        });

        // Database Logic
        try {
            if (isFav) {
                // Remove
                const { error } = await supabase
                    .from("favorites")
                    .delete()
                    .eq("user_id", userId)
                    .eq("product_id", productId);
                if (error) throw error;
            } else {
                // Add
                const { error } = await supabase
                    .from("favorites")
                    .insert({ user_id: userId, product_id: productId });
                if (error) throw error;

                if (productName) {
                    // toast({ title: "¡Favorito guardado!", description: `${productName} se guardó en tu cuenta.` });
                }
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
            // Revert optimistic update
            setFavorites(prev => {
                const next = new Set(prev);
                if (isFav) next.add(productId);
                else next.delete(productId);
                return next;
            });
            toast({ title: "Error", description: "No se pudo actualizar favoritos.", variant: "destructive" });
        }
    };

    const isFavorite = (productId: string) => favorites.has(productId);

    return { favorites, toggleFavorite, isFavorite, loading };
};
