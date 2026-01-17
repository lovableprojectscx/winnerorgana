import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Star,
    ShoppingCart,
    CheckCircle,
    ArrowLeft,
    ShieldCheck,
    Truck,
    Leaf,
    Sparkles,
    Package,
    CreditCard
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface Product {
    id: string;
    name: string;
    description: string | null;
    price: number;
    stock: number | null;
    image_url: string | null;
    rating: number | null;
    category_id: string | null;
    tags: string[] | null;
    category?: { name: string; color: string | null } | null;
}

const ProductDetailPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [addedToCart, setAddedToCart] = useState(false);
    const { addItem } = useCart();
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        if (id) fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const { data, error } = await supabase
                .from("products")
                .select("*, category:categories(*)")
                .eq("id", id)
                .single();

            if (error) throw error;
            setProduct(data);
        } catch (error) {
            console.error("Error fetching product:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (!product) return;

        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.image_url || undefined,
            stock: product.stock ?? undefined,
        });

        setAddedToCart(true);
        toast({
            title: "Agregado al carrito",
            description: `${product.name} ya está en tu carrito.`,
        });

        setTimeout(() => setAddedToCart(false), 2000);
    };

    const handleBuyNow = () => {
        if (!product) return;
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.image_url || undefined,
            stock: product.stock ?? undefined,
        });
        navigate("/checkout");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto px-4 py-20">
                    <Skeleton className="h-[500px] w-full rounded-3xl" />
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <Leaf className="w-16 h-16 text-muted-foreground/30 mb-4" />
                    <h1 className="text-2xl font-bold text-foreground">Producto no encontrado</h1>
                    <Button asChild variant="link" className="mt-4">
                        <Link to="/catalogo">Volver al catálogo</Link>
                    </Button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7]">
            <Header />

            <main className="pt-4 pb-20">
                <div className="container mx-auto px-4">
                    {/* Breadcrumb / Back */}
                    <Link
                        to="/catalogo"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[#1a472a] transition-colors mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al Catálogo
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                        {/* Left: Enhanced Gallery */}
                        <div className="space-y-6 animate-in slide-in-from-left duration-700">
                            <div className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-white shadow-xl ring-1 ring-black/5">
                                {product.image_url ? (
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                        <Leaf className="w-24 h-24 text-gray-200" />
                                    </div>
                                )}

                                {/* Floating Badges */}
                                <div className="absolute top-6 left-6 flex flex-col gap-3">
                                    {product.category && (
                                        <Badge className="bg-white/90 backdrop-blur text-[#1a472a] border border-white/20 shadow-lg px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
                                            {product.category.name}
                                        </Badge>
                                    )}
                                    {product.stock && product.stock <= 10 && (
                                        <Badge className="bg-amber-500 text-white shadow-lg border-0">
                                            ¡Últimas unidades!
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { icon: ShieldCheck, label: "Garantía de Calidad" },
                                    { icon: Leaf, label: "100% Orgánico" },
                                    { icon: Truck, label: "Envíos Seguros" }
                                ].map((item, i) => (
                                    <div key={i} className="bg-white p-4 rounded-2xl shadow-sm text-center border border-[#1a472a]/5">
                                        <item.icon className="w-6 h-6 text-[#A99260] mx-auto mb-2" />
                                        <span className="text-[10px] font-bold text-[#1a472a] uppercase tracking-wide block">
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Product Details */}
                        <div className="animate-in slide-in-from-right duration-700 delay-100">
                            {/* Header */}
                            <div className="mb-8">
                                {product.tags && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {product.tags.map((tag, i) => (
                                            <span key={i} className="text-[11px] font-bold text-[#A99260] uppercase tracking-widest bg-[#A99260]/10 px-3 py-1 rounded-full">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <h1 className="text-4xl lg:text-5xl font-bold text-[#1a472a] font-serif mb-4 leading-tight">
                                    {product.name}
                                </h1>

                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1 text-amber-500">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-4 h-4 ${i < (product.rating || 5) ? "fill-current" : "text-gray-200"}`} />
                                        ))}
                                    </div>
                                    <span className="text-muted-foreground">Based on {product.rating ? 'verified' : '0'} reviews</span>
                                </div>
                            </div>

                            {/* Price Card */}
                            <div className="bg-white p-6 rounded-3xl shadow-lg border border-[#1a472a]/5 mb-10">
                                <div className="flex justify-between items-end mb-6">
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Precio Miembro</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl lg:text-5xl font-bold text-[#1a472a] font-serif">
                                                {product.price.toLocaleString()}
                                            </span>
                                            <span className="text-lg font-bold text-[#1a472a]/60">WP</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                            </span>
                                            Disponible
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <Button
                                        size="lg"
                                        onClick={handleBuyNow}
                                        disabled={product.stock === 0}
                                        className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg bg-amber-500 hover:bg-amber-600 hover:shadow-amber-500/25 hover:-translate-y-1 text-white transition-all duration-300"
                                    >
                                        <span className="flex items-center gap-2">
                                            <CreditCard className="w-6 h-6" />
                                            Comprar Ahora
                                        </span>
                                    </Button>

                                    <Button
                                        size="lg"
                                        onClick={handleAddToCart}
                                        disabled={product.stock === 0}
                                        className={`w-full h-14 text-lg font-bold rounded-2xl shadow-md transition-all duration-300 ${addedToCart
                                            ? 'bg-green-700 hover:bg-green-800 scale-[1.02]'
                                            : 'bg-[#1a472a] hover:bg-[#1a472a]/90 hover:-translate-y-0.5'
                                            }`}
                                    >
                                        {addedToCart ? (
                                            <span className="flex items-center gap-2">
                                                <CheckCircle className="w-6 h-6" />
                                                ¡Agregado al Carrito!
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <ShoppingCart className="w-6 h-6" />
                                                Añadir al Carrito
                                            </span>
                                        )}
                                    </Button>
                                </div>


                            </div>

                            {/* Description */}
                            <div className="prose prose-lg prose-gray max-w-none text-muted-foreground">
                                <h3 className="text-2xl font-bold text-[#1a472a] font-serif mb-4">Sobre este producto</h3>
                                {product.description ? (
                                    <ReactMarkdown
                                        components={{
                                            p: ({ children }) => <p className="leading-relaxed mb-6 font-light">{children}</p>,
                                            li: ({ children }) => (
                                                <li className="flex items-start gap-3 mb-2">
                                                    <CheckCircle className="w-5 h-5 text-[#A99260] shrink-0 mt-0.5" />
                                                    <span>{children}</span>
                                                </li>
                                            ),
                                            strong: ({ children }) => <span className="font-bold text-[#1a472a]">{children}</span>
                                        }}
                                    >
                                        {product.description}
                                    </ReactMarkdown>
                                ) : (
                                    <p>Descripción no disponible por el momento.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ProductDetailPage;
