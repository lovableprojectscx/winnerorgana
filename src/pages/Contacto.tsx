import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MapPin, Mail, Phone, Loader2, Send, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const contactSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  email: z.string().trim().email("Ingresa un email válido").max(255),
  whatsapp: z.string().optional(),
  mensaje: z.string().trim().min(10, "El mensaje debe tener al menos 10 caracteres").max(1000)
});

const Contacto = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    whatsapp: "", 
    mensaje: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validation = contactSchema.safeParse(formData);
    if (!validation.success) {
      toast({
        title: "Error de validación",
        description: validation.error.errors[0]?.message || "Por favor verifica los datos",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const trimmedData = {
        nombre: formData.nombre.trim(),
        email: formData.email.trim(),
        whatsapp: formData.whatsapp?.trim() || null,
        mensaje: formData.mensaje.trim(),
      };

      // Save to database
      const { error } = await supabase
        .from("contact_messages")
        .insert({
          ...trimmedData,
          status: "pending"
        });

      if (error) throw error;

      // Send email notification (fire and forget - don't block on this)
      supabase.functions.invoke('send-contact-notification', {
        body: trimmedData
      }).catch(err => console.error('Email notification failed:', err));

      setIsSuccess(true);
      setFormData({ nombre: "", email: "", whatsapp: "", mensaje: "" });
      
      toast({
        title: "¡Mensaje enviado!",
        description: "Hemos recibido tu mensaje. Te contactaremos pronto.",
      });

      // Reset success state after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);

    } catch (error: any) {
      toast({
        title: "Error al enviar",
        description: "No se pudo enviar el mensaje. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-10 md:py-16">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 md:mb-4">
            Ponte en Contacto
          </h1>
          <p className="text-base md:text-xl text-muted-foreground px-4">
            ¿Tienes alguna pregunta o comentario? Estamos aquí para ayudarte.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <Card className="bg-muted/30 p-6 md:p-8 order-2 lg:order-1">
            <CardContent className="p-0 space-y-6 md:space-y-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 md:mb-6">
                Información de Contacto
              </h2>
              
              <div className="flex items-start space-x-3 md:space-x-4">
                <MapPin className="w-5 h-5 md:w-6 md:h-6 text-primary mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground text-sm md:text-base">Nuestra Oficina</h3>
                  <p className="text-muted-foreground text-sm md:text-base">Calle Monte Apamate 153, Santiago de Surco 15039, Lima, Perú</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 md:space-x-4">
                <Mail className="w-5 h-5 md:w-6 md:h-6 text-primary mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground text-sm md:text-base">Correo Electrónico</h3>
                  <p className="text-muted-foreground text-sm md:text-base break-all">Organawinner@gmail.com</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 md:space-x-4">
                <Phone className="w-5 h-5 md:w-6 md:h-6 text-primary mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground text-sm md:text-base">Teléfono</h3>
                  <p className="text-muted-foreground text-sm md:text-base">+51 993 516 053</p>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <div className="pt-4 md:pt-6 border-t border-border">
                <a
                  href={`https://wa.me/51993516053?text=${encodeURIComponent("Hola, tengo una consulta sobre Winner Organa")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-5 md:px-6 py-2.5 md:py-3 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm md:text-base w-full sm:w-auto justify-center"
                >
                  <Phone className="w-4 h-4 md:w-5 md:h-5" />
                  Escríbenos por WhatsApp
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card className="p-6 md:p-8 order-1 lg:order-2">
            <CardContent className="p-0">
              {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-10 md:py-12 text-center space-y-4">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-7 h-7 md:w-8 md:h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-foreground">¡Mensaje Enviado!</h3>
                  <p className="text-muted-foreground max-w-sm text-sm md:text-base">
                    Gracias por contactarnos. Te responderemos a la brevedad posible.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsSuccess(false)}
                    className="mt-4"
                  >
                    Enviar otro mensaje
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-sm">Nombre Completo *</Label>
                    <Input
                      id="nombre"
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      placeholder="Tu nombre completo"
                      required
                      disabled={isLoading}
                      className="h-10 md:h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm">Correo Electrónico *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="tu@email.com"
                      required
                      disabled={isLoading}
                      className="h-10 md:h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="text-sm">WhatsApp (Opcional)</Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                      placeholder="+51 999 999 999"
                      disabled={isLoading}
                      className="h-10 md:h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mensaje" className="text-sm">Mensaje *</Label>
                    <Textarea
                      id="mensaje"
                      rows={4}
                      value={formData.mensaje}
                      onChange={(e) => setFormData({...formData, mensaje: e.target.value})}
                      placeholder="¿En qué podemos ayudarte?"
                      required
                      disabled={isLoading}
                      className="resize-none"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-[hsl(var(--accent))] text-white hover:bg-[hsl(var(--accent))]/90 h-11 md:h-12 text-sm md:text-base" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Enviar Mensaje
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contacto;
