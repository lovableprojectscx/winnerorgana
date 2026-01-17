import Header from "@/components/Header";
import Hero from "@/components/Hero"; 
import OriginSection from "@/components/OriginSection";
import FeaturesSection from "@/components/FeaturesSection";
import ProductsSection from "@/components/ProductsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <OriginSection />
      <FeaturesSection />
      <ProductsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
