import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/hooks/useFavorites";
import {
  Search,
  Loader2,
  ShoppingCart,
  CheckCircle,
  Leaf,
  Filter,
  Star,
  Sparkles,
  Award,
  Zap,
  Heart,
  Package,
  Dumbbell,
  Coffee,
  Pill,
  Cookie,
  Apple,
  Sun,
  ArrowRight
} from "lucide-react";
import heroBg from "@/assets/hero-products.jpg";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";

interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
}

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
  category?: Category | null;
}

const iconMap: Record<string, any> = {
  Leaf, Dumbbell, Coffee, Pill, Cookie, Package, Sparkles, Award, Zap, Heart, Apple, Sun
};

// Extract short tagline from description
const getShortDescription = (description: string | null): string => {
  if (!description) return "Producto natural premium";
  const firstSentence = description.split(/[.!?]/)[0];
  if (firstSentence.length <= 80) return firstSentence;
  return firstSentence.substring(0, 77) + "...";
};

const Catalogo = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { toast } = useToast();
  const [addedToCart, setAddedToCart] = useState<Set<string>>(new Set());
  const [filterOpen, setFilterOpen] = useState(false); // Make sure this is used if we have the mobile sheet
  const { toggleFavorite, isFavorite } = useFavorites();

  // Sync URL params with state
  useEffect(() => {
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    if (category) setActiveCategory(category);
    if (search) setSearchQuery(search);
  }, [searchParams]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories(*)");

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    if (categoryId === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", categoryId);
    }
    setSearchParams(searchParams);
    setFilterOpen(false); // Close mobile sheet if open
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      searchParams.set("search", query);
    } else {
      searchParams.delete("search");
    }
    setSearchParams(searchParams);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
    });
    setAddedToCart(prev => new Set(prev).add(product.id));
    toast({
      title: "¡Agregado al Carrito!",
      description: `${product.name} añadido correctamente.`,
    });
    setTimeout(() => {
      setAddedToCart(prev => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 2000);
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      activeCategory === "all" || product.category_id === activeCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Header />

      {/* Premium Hero Section */}
      <div className="relative overflow-hidden text-white pt-24 pb-16 lg:pt-32 lg:pb-24">
        {/* Background Image Setup */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#000000]/40 z-10" /> {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a472a] via-[#1a472a]/20 to-transparent z-10" /> {/* Gradient Blend */}
          <img
            src={heroBg}
            alt="Background"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="container mx-auto px-4 relative z-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-accent mb-6">
              <Sparkles className="w-3 h-3" /> Catálogo Premium 2024
            </span>
            <h1 className="text-4xl md:text-6xl font-bold font-serif mb-6 leading-tight">
              Bienestar Natural <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">
                Para Tu Vida
              </span>
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto font-light leading-relaxed">
              Descubre nuestra selección exclusiva de productos orgánicos diseñados para potenciar tu salud y energía.
            </p>
          </motion.div>

          {/* Integrated Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="max-w-xl mx-auto mt-10 relative"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Input
                placeholder="Buscar productos, beneficios..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="h-14 pl-12 pr-6 rounded-full bg-white/95 backdrop-blur shadow-xl border-0 text-gray-800 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-accent text-lg"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-hover:text-accent transition-colors" />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 relative">

        {/* Sticky Filter Bar (Desktop) & Mobile Filter Button */}
        <div className="sticky top-20 z-40 mb-12 -mx-4 px-4 py-4 bg-[#FDFBF7]/80 backdrop-blur-md border-b border-gray-100/50">
          <div className="flex items-center gap-4">
            {/* Mobile Filter Trigger */}
            <div className="lg:hidden">
              <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="rounded-full shadow-sm border-gray-200">
                    <Filter className="w-4 h-4 mr-2" /> Filtros
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="rounded-t-[2rem]">
                  <SheetHeader>
                    <SheetTitle>Categorías</SheetTitle>
                  </SheetHeader>
                  <div className="grid grid-cols-2 gap-3 py-6">
                    <Button
                      variant={activeCategory === "all" ? "default" : "outline"}
                      onClick={() => handleCategoryChange("all")}
                      className="w-full justify-start h-auto py-3 rounded-xl"
                    >
                      Todos
                    </Button>
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={activeCategory === category.id ? "default" : "outline"}
                        onClick={() => handleCategoryChange(category.id)}
                        className="w-full justify-start h-auto py-3 rounded-xl"
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop Scrollable Filters */}
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex space-x-2 pb-2">
                <Button
                  variant={activeCategory === "all" ? "default" : "outline"}
                  onClick={() => handleCategoryChange("all")}
                  className={`rounded-full px-6 h-10 transition-all duration-300 ${activeCategory === 'all'
                    ? 'bg-[#1a472a] shadow-lg shadow-[#1a472a]/20 hover:bg-[#153820]'
                    : 'border-gray-200 text-gray-600 hover:border-[#1a472a] hover:text-[#1a472a] bg-white'
                    }`}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Todos
                </Button>

                {categories.map((category) => {
                  const IconComponent = category.icon ? iconMap[category.icon] : null;
                  return (
                    <Button
                      key={category.id}
                      variant={activeCategory === category.id ? "default" : "outline"}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`rounded-full px-6 h-10 transition-all duration-300 ${activeCategory === category.id
                        ? 'bg-[#1a472a] shadow-lg shadow-[#1a472a]/20 hover:bg-[#153820]'
                        : 'border-gray-200 text-gray-600 hover:border-[#1a472a] hover:text-[#1a472a] bg-white'
                        }`}
                    >
                      {IconComponent && <IconComponent className="w-4 h-4 mr-2" />}
                      {category.name}
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-8 max-w-7xl mx-auto">
          <p className="text-sm text-muted-foreground font-medium">
            Mostrando {filteredProducts.length} {filteredProducts.length === 1 ? "resultado" : "resultados"}
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-accent" />
            <p className="text-muted-foreground animate-pulse">Cargando las mejores opciones...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[2rem] shadow-sm border border-gray-100 max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2 font-serif">No encontramos resultados</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Intenta con otros términos o explora todas nuestras categorías.
            </p>
            <Button onClick={() => { setSearchQuery(""); setActiveCategory("all"); }} variant="outline" className="rounded-full">
              Limpiar Filtros
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto justify-items-center">
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-[280px] md:max-w-[350px]"
                >
                  <Link to={`/catalogo/${product.id}`} className="group block h-full">
                    <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 group-hover:border-accent/20 h-full flex flex-col relative">

                      {/* Image Container */}
                      <div className="relative aspect-square md:aspect-[4/5] overflow-hidden bg-gray-50">
                        {product.rating && product.rating >= 4.5 && (
                          <div className="absolute top-3 left-3 md:top-4 md:left-4 z-10 flex flex-col gap-2">
                            <Badge className="bg-white/90 backdrop-blur text-[#1a472a] shadow-sm border border-white/20 px-2 py-0.5 md:px-3 md:py-1 text-[10px] font-bold uppercase tracking-wider gap-1">
                              <Sparkles className="w-3 h-3 text-accent" /> Premium
                            </Badge>
                          </div>
                        )}

                        {/* Wishlist Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(product.id, product.name);
                          }}
                          className={`absolute top-3 right-3 md:top-4 md:right-4 z-10 w-8 h-8 md:w-10 md:h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-all ${isFavorite(product.id) ? "text-red-500" : "text-gray-400 hover:text-red-500"}`}
                        >
                          <Heart className={`w-4 h-4 md:w-5 md:h-5 ${isFavorite(product.id) ? "fill-current" : ""}`} />
                        </button>

                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Leaf className="w-12 h-12 md:w-16 md:h-16 text-gray-200" />
                          </div>
                        )}

                        {/* Hover Overlay Action */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                          <span className="bg-white/95 backdrop-blur text-[#1a472a] px-4 py-2 md:px-6 md:py-3 rounded-full font-bold text-xs md:text-sm shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-2 pointer-events-auto">
                            Ver Detalles <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 md:p-6 flex flex-col flex-1">
                        <div className="mb-1 flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 md:w-3.5 md:h-3.5 ${i < (product.rating || 5) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                            />
                          ))}
                          <span className="text-[10px] md:text-xs text-muted-foreground ml-1 font-medium">({product.rating || 5}.0)</span>
                        </div>

                        <h3 className="font-serif text-lg md:text-xl font-bold text-[#1a472a] mb-1 md:mb-2 leading-tight group-hover:text-accent transition-colors">
                          {product.name}
                        </h3>

                        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-4 md:mb-6 flex-1 font-light">
                          {getShortDescription(product.description)}
                        </p>

                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest text-[#1a472a]/60 font-bold">Precio</span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg md:text-2xl font-bold text-[#1a472a] font-serif">{product.price}</span>
                              <span className="text-[10px] md:text-xs font-bold text-accent">WP</span>
                            </div>
                          </div>

                          {/* Quick Add Button */}
                          <Button
                            size="icon"
                            className={`rounded-full h-10 w-10 md:h-12 md:w-12 shadow-lg transition-all duration-300 ${addedToCart.has(product.id)
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-[#1a472a] hover:bg-accent hover:scale-110'
                              }`}
                            onClick={(e) => handleAddToCart(e, product)}
                            disabled={product.stock === 0}
                          >
                            {addedToCart.has(product.id) ? (
                              <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-white" />
                            ) : (
                              <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 text-white" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Catalogo;