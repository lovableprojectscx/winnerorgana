import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const PoliticaDevoluciones = () => {
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
              Política de Devoluciones
            </h1>
            
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
              <p className="text-sm text-muted-foreground">
                Última actualización: 26 de diciembre de 2024
              </p>

              <section className="space-y-4">
                <h2 className="text-xl font-heading font-semibold text-foreground">
                  1. Garantía de Satisfacción
                </h2>
                <p>
                  En Winner Organa nos comprometemos con la calidad de nuestros productos. Si no está completamente satisfecho con su compra, estamos aquí para ayudarle.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-heading font-semibold text-foreground">
                  2. Plazo para Devoluciones
                </h2>
                <p>
                  Tiene un plazo de <strong>7 días calendario</strong> desde la recepción del producto para solicitar una devolución o cambio. Pasado este período, no podremos procesar su solicitud.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-heading font-semibold text-foreground">
                  3. Condiciones para Devolución
                </h2>
                <p>
                  Para que su devolución sea aceptada, el producto debe cumplir las siguientes condiciones:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>El producto debe estar sin abrir y en su empaque original</li>
                  <li>El empaque no debe presentar daños ni alteraciones</li>
                  <li>Debe incluir todos los accesorios y documentación original</li>
                  <li>Debe presentar el comprobante de compra o número de pedido</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-heading font-semibold text-foreground">
                  4. Productos No Elegibles
                </h2>
                <p>
                  No se aceptan devoluciones en los siguientes casos:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Productos abiertos o usados</li>
                  <li>Productos con empaque dañado por el cliente</li>
                  <li>Productos adquiridos en promociones especiales (salvo defectos de fábrica)</li>
                  <li>Productos perecederos una vez abiertos</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-heading font-semibold text-foreground">
                  5. Proceso de Devolución
                </h2>
                <p>
                  Para iniciar una devolución, siga estos pasos:
                </p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Contáctenos por WhatsApp al +51 993 516 053 o email a Organawinner@gmail.com</li>
                  <li>Proporcione su número de pedido y motivo de la devolución</li>
                  <li>Espere la confirmación y las instrucciones de envío</li>
                  <li>Envíe el producto según las instrucciones proporcionadas</li>
                  <li>Una vez recibido y verificado, procesaremos su reembolso o cambio</li>
                </ol>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-heading font-semibold text-foreground">
                  6. Costos de Envío
                </h2>
                <p>
                  Los costos de envío para devoluciones se manejan de la siguiente manera:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Producto defectuoso:</strong> Winner Organa asume el costo de envío</li>
                  <li><strong>Error en el pedido (nuestro error):</strong> Winner Organa asume el costo</li>
                  <li><strong>Cambio de opinión:</strong> El cliente asume el costo de envío</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-heading font-semibold text-foreground">
                  7. Reembolsos
                </h2>
                <p>
                  Una vez recibida y aprobada su devolución:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>El reembolso se procesará en un máximo de 5 días hábiles</li>
                  <li>Se realizará al mismo método de pago utilizado en la compra</li>
                  <li>Recibirá una confirmación por email cuando se procese el reembolso</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-heading font-semibold text-foreground">
                  8. Cambios de Producto
                </h2>
                <p>
                  Si desea cambiar un producto por otro:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>El cambio está sujeto a disponibilidad de stock</li>
                  <li>Si el nuevo producto tiene mayor valor, deberá pagar la diferencia</li>
                  <li>Si el nuevo producto tiene menor valor, se le reembolsará la diferencia</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-heading font-semibold text-foreground">
                  9. Productos Defectuosos
                </h2>
                <p>
                  Si recibe un producto defectuoso o dañado:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Notifíquenos dentro de las 24 horas de recibido</li>
                  <li>Tome fotografías del producto y empaque dañado</li>
                  <li>No deseche el producto ni el empaque hasta recibir instrucciones</li>
                  <li>Procederemos con el reemplazo o reembolso sin costo adicional</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-heading font-semibold text-foreground">
                  10. Contacto
                </h2>
                <p>
                  Para cualquier consulta sobre devoluciones, contáctenos:
                </p>
                <ul className="list-none space-y-2">
                  <li><strong>WhatsApp:</strong> +51 993 516 053</li>
                  <li><strong>Email:</strong> Organawinner@gmail.com</li>
                  <li><strong>Horario:</strong> Lunes a Viernes, 9:00 AM - 6:00 PM</li>
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

export default PoliticaDevoluciones;
