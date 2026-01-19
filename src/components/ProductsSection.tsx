import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowRight, Star, TrendingUp, Sparkles, Package } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  rating: number | null;
  order_count: number;
  total_sales: number;
}

const ProductsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [conversionRate, setConversionRate] = useState(10);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    fetchPopularProducts();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('business_settings')
        .select('wp_conversion_rate')
        .single();

      if (error) throw error;
      if (data?.wp_conversion_rate) {
        setConversionRate(data.wp_conversion_rate);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const fetchPopularProducts = async () => {
    try {
      // First get all products
      const { data: allProducts, error: productsError } = await supabase
        .from('products')
        .select('*');

      if (productsError) throw productsError;

      if (!allProducts || allProducts.length === 0) {
        setProducts([]);
        setIsLoading(false);
        return;
      }

      // Get order statistics for products
      const { data: orderStats, error: ordersError } = await supabase
        .from('orders')
        .select('product_id, amount')
        .not('status', 'eq', 'Cancelado');

      if (ordersError) throw ordersError;

      // Calculate popularity for each product
      const productStats = allProducts.map(product => {
        const productOrders = orderStats?.filter(o => o.product_id === product.id) || [];
        const orderCount = productOrders.length;
        const totalSales = productOrders.reduce((sum, o) => sum + (o.amount || 0), 0);

        return {
          ...product,
          order_count: orderCount,
          total_sales: totalSales
        };
      });

      // Sort by total sales (most popular first), then by order count
      const sortedProducts = productStats.sort((a, b) => {
        if (b.total_sales !== a.total_sales) {
          return b.total_sales - a.total_sales;
        }
        return b.order_count - a.order_count;
      });

      // Take top 3
      setProducts(sortedProducts.slice(0, 3));
    } catch (error) {
      console.error('Error fetching popular products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getBadgeLabel = (index: number, orderCount: number) => {
    if (orderCount > 10) return { label: "Más Vendido", icon: TrendingUp };
    if (orderCount > 5) return { label: "Popular", icon: Star };
    if (orderCount > 0) return { label: "Favorito", icon: Sparkles };
    if (index === 0) return { label: "Destacado", icon: Star };
    return { label: "Nuevo", icon: Package };
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <section ref={sectionRef} className="py-12 md:py-20 bg-gradient-to-b from-muted/20 via-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 md:mb-16">
            <Skeleton className="h-8 w-48 mx-auto mb-4" />
            <Skeleton className="h-12 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-80 mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <CardContent className="p-6 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-8 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // No products available
  if (products.length === 0) {
    return (
      <section ref={sectionRef} className="py-12 md:py-20 bg-gradient-to-b from-muted/20 via-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-accent/10 px-3 py-1.5 md:px-4 md:py-2 rounded-full mb-4">
              <Package className="w-3 h-3 md:w-4 md:h-4 text-accent" />
              <span className="text-xs md:text-sm font-medium text-accent">Productos Premium</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 md:mb-6">
              Próximamente
            </h2>

            <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Estamos preparando una selección increíble de productos naturales para ti. ¡Muy pronto disponibles!
            </p>

            <Button asChild size="lg">
              <Link to="/catalogo">
                Ver Catálogo Completo
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="py-20 md:py-32 bg-[#FDFBF7] relative overflow-hidden">
      {/* --- Ambient Background Effects --- */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-white via-white/50 to-transparent z-10"></div>

      {/* Soft Green Glow (Top Right) */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#1a472a]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

      {/* Warm Golden Glow (Bottom Left) */}
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#A99260]/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

      {/* Organic Curve Decoration */}
      <svg className="absolute top-1/2 left-0 w-full h-auto text-[#1a472a]/5 -translate-y-1/2 pointer-events-none opacity-50" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path fill="currentColor" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
      </svg>

      <div className="container mx-auto px-4 relative z-20">
        {/* Section Header */}
        <div className={`text-center mb-16 md:mb-24 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1a472a]/5 border border-[#1a472a]/10 mb-6">
            <span className="text-accent">
              <Sparkles className="w-4 h-4 fill-accent" />
            </span>
            <span className="text-xs font-bold text-[#1a472a] uppercase tracking-widest">Catálogo Exclusivo</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 font-serif tracking-tight leading-none">
            Bienestar que <br className="hidden sm:block" /> Puedes <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1a472a] to-[#2d7a46] italic relative">
              Compartir
              <svg className="absolute w-full h-2 -bottom-0 left-0 text-accent opacity-40" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground/80 max-w-2xl mx-auto font-light leading-relaxed">
            Descubre nuestra selección premium de productos naturales, formulados para transformar vidas y potenciar tu negocio.
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto place-items-center">
          {products.map((product, index) => {
            const badge = getBadgeLabel(index, product.order_count);
            const BadgeIcon = badge.icon;
            const priceInWP = product.price;

            return (
              <div
                key={product.id}
                className={`group relative w-full max-w-[350px] bg-white rounded-[1.5rem] shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] ring-1 ring-black/5 transition-all duration-500 hover:-translate-y-2 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Image Container with organic mask feel */}
                <div className="relative aspect-[4/3] overflow-hidden rounded-t-[1.5rem] bg-[#f4f4f4]">

                  {/* Floating Badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className="bg-white/90 backdrop-blur-md text-[#1a472a] px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase shadow-sm flex items-center gap-2 border border-white/20">
                      <BadgeIcon className="w-3.5 h-3.5 text-accent" />
                      {badge.label}
                    </span>
                  </div>

                  {/* Product Image */}
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#f0f0f0]">
                      <Package className="w-16 h-16 text-gray-300/50" />
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-[#1a472a]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px] flex items-center justify-center">
                    <Button
                      className="bg-white text-[#1a472a] hover:bg-[#1a472a] hover:text-white border-2 border-white rounded-full px-8 py-6 text-sm font-bold transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 shadow-xl"
                      asChild
                    >
                      <Link to={`/catalogo?producto=${product.id}`}>
                        Ver Detalles
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Content Card */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-foreground font-serif group-hover:text-[#1a472a] transition-colors leading-tight line-clamp-1">
                        {product.name}
                      </h3>
                      {/* Rating Stars */}
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < (product.rating || 5) ? 'text-[#A99260] fill-[#A99260]' : 'text-gray-200'}`}
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-2">({product.order_count} reviews)</span>
                      </div>
                    </div>

                    {/* Price Tag */}
                    <div className="flex flex-col items-end gap-0.5">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-[#1a472a] font-serif leading-none">{priceInWP}</span>
                        <span className="text-[10px] font-bold text-[#1a472a]/70 uppercase tracking-widest">WP</span>
                      </div>
                      <div className="flex items-center justify-end">
                        <span className="text-xs font-medium text-emerald-600/80 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                          S/ {(priceInWP / conversionRate).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-muted-foreground/90 line-clamp-2 text-sm leading-relaxed mb-6 font-light">
                    {product.description || "Descubre el poder de lo natural con este producto exclusivo de nuestra colección."}
                  </p>

                  <div className="pt-5 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#A99260] uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Premium
                    </span>
                    <Link
                      to={`/catalogo?producto=${product.id}`}
                      className="group/link text-[#1a472a] font-bold text-xs flex items-center gap-2 hover:translate-x-1 transition-transform"
                    >
                      EXPLORAR <ArrowRight className="w-3.5 h-3.5 group-hover/link:text-accent transition-colors" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className={`text-center mt-20 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Button
            asChild
            variant="ghost"
            size="lg"
            className="group relative overflow-hidden bg-transparent hover:bg-transparent text-[#1a472a] px-8 py-6 rounded-full"
          >
            <Link to="/catalogo" className="flex flex-col items-center gap-1">
              <span className="text-sm font-bold tracking-[0.2em] uppercase">Explorar Todo el Catálogo</span>
              <span className="h-px w-full bg-[#1a472a]/30 group-hover:w-1/2 group-hover:bg-[#1a472a] transition-all duration-300"></span>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
