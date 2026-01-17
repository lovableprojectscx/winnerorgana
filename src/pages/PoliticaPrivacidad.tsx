import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const PoliticaPrivacidad = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-8">
              Política de Privacidad
            </h1>
            
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
              <p className="text-sm text-muted-foreground">
                Última actualización: 26 de diciembre de 2024
              </p>

              <section className="space-y-4">
                <h2 className="text-xl font-heading font-semibold text-foreground">
                  1. Información que Recopilamos
                </h2>
                <p>
                  En Winner Organa, recopilamos información que usted nos proporciona directamente, incluyendo:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Nombre completo y datos de contacto</li>
                  <li>Dirección de correo electrónico</li>
                  <li>Número de teléfono y WhatsApp</li>
                  <li>Dirección de envío</li>
                  <li>Información de pago (procesada de forma segura)</li>
                  <li>Historial de compras y preferencias</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-heading font-semibold text-foreground">
                  2. Uso de la Información
                </h2>
                <p>
                  Utilizamos la información recopilada para:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Procesar y entregar sus pedidos</li>
                  <li>Comunicarnos con usted sobre su cuenta y pedidos</li>
                  <li>Enviar información sobre productos y promociones (con su consentimiento)</li>
                  <li>Mejorar nuestros productos y servicios</li>
                  <li>Gestionar el programa de afiliados</li>
                  <li>Cumplir con obligaciones legales</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-heading font-semibold text-foreground">
                  3. Protección de Datos
                </h2>
                <p>
                  Implementamos medidas de seguridad técnicas y organizativas para proteger su información personal contra acceso no autorizado, alteración, divulgación o destrucción. Esto incluye:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encriptación de datos sensibles</li>
                  <li>Acceso restringido a información personal</li>
                  <li>Monitoreo regular de nuestros sistemas</li>
                  <li>Capacitación del personal en protección de datos</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-heading font-semibold text-foreground">
                  4. Compartir Información
                </h2>
                <p>
                  No vendemos ni alquilamos su información personal a terceros. Solo compartimos información con:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Proveedores de servicios de envío para entregar sus pedidos</li>
                  <li>Procesadores de pago para completar transacciones</li>
                  <li>Autoridades legales cuando sea requerido por ley</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-heading font-semibold text-foreground">
                  5. Cookies y Tecnologías Similares
                </h2>
                <p>
                  Utilizamos cookies y tecnologías similares para mejorar su experiencia en nuestro sitio web. Estas nos permiten:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Recordar sus preferencias</li>
                  <li>Analizar el tráfico del sitio</li>
                  <li>Personalizar el contenido</li>
                  <li>Mejorar la funcionalidad del sitio</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-heading font-semibold text-foreground">
                  6. Sus Derechos
                </h2>
                <p>
                  Usted tiene derecho a:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Acceder a su información personal</li>
                  <li>Rectificar datos inexactos</li>
                  <li>Solicitar la eliminación de sus datos</li>
                  <li>Oponerse al procesamiento de sus datos</li>
                  <li>Retirar su consentimiento en cualquier momento</li>
                  <li>Presentar una queja ante la autoridad de protección de datos</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-heading font-semibold text-foreground">
                  7. Retención de Datos
                </h2>
                <p>
                  Conservamos su información personal solo durante el tiempo necesario para cumplir con los fines para los que fue recopilada, incluyendo requisitos legales, contables o de informes.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-heading font-semibold text-foreground">
                  8. Menores de Edad
                </h2>
                <p>
                  Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos intencionalmente información de menores de edad.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-heading font-semibold text-foreground">
                  9. Cambios en esta Política
                </h2>
                <p>
                  Podemos actualizar esta política de privacidad periódicamente. Le notificaremos sobre cambios significativos publicando la nueva política en esta página.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-heading font-semibold text-foreground">
                  10. Contacto
                </h2>
                <p>
                  Para ejercer sus derechos o realizar consultas sobre esta política, contáctenos:
                </p>
                <ul className="list-none space-y-2">
                  <li><strong>Email:</strong> Organawinner@gmail.com</li>
                  <li><strong>Teléfono:</strong> +51 993 516 053</li>
                  <li><strong>Dirección:</strong> Calle Monte Apamate 153, Santiago de Surco 15039, Lima, Perú</li>
                </ul>
              </section>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PoliticaPrivacidad;
