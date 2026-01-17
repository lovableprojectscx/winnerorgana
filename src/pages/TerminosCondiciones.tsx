import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const TerminosCondiciones = () => {
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
              Términos y Condiciones
            </h1>
            
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
              <p className="text-sm text-muted-foreground">
                Última actualización: 26 de diciembre de 2024
              </p>

              <section className="space-y-4">
                <h2 className="text-xl font-heading font-semibold text-foreground">
                  1. Aceptación de los Términos
                </h2>
                <p>
                  Al acceder y utilizar el sitio web de Winner Organa, usted acepta estar sujeto a estos Términos y Condiciones, todas las leyes y regulaciones aplicables, y acepta que es responsable del cumplimiento de las leyes locales aplicables.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-heading font-semibold text-foreground">
                  2. Uso del Sitio
                </h2>
                <p>
                  El contenido de las páginas de este sitio web es para su información general y uso únicamente. Está sujeto a cambios sin previo aviso. Este sitio web utiliza cookies para monitorear las preferencias de navegación.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-heading font-semibold text-foreground">
                  3. Productos y Servicios
                </h2>
                <p>
                  Winner Organa ofrece productos naturales y orgánicos de alta calidad. Todos nuestros productos están elaborados con ingredientes cuidadosamente seleccionados de origen peruano.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Los precios están sujetos a cambios sin previo aviso.</li>
                  <li>Las imágenes de los productos son ilustrativas y pueden variar ligeramente.</li>
                  <li>La disponibilidad de productos está sujeta a stock.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-heading font-semibold text-foreground">
                  4. Programa de Afiliados
                </h2>
                <p>
                  Nuestro programa de afiliados permite a los usuarios registrados ganar comisiones por referir nuevos clientes. Las comisiones se calculan según el nivel de afiliación y las ventas generadas.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Las comisiones se pagan según los términos establecidos en el programa.</li>
                  <li>Winner Organa se reserva el derecho de modificar las tasas de comisión.</li>
                  <li>El uso fraudulento del programa resultará en la cancelación de la cuenta.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-heading font-semibold text-foreground">
                  5. Cuenta de Usuario
                </h2>
                <p>
                  Al crear una cuenta, usted es responsable de mantener la confidencialidad de su cuenta y contraseña, y de restringir el acceso a su computadora. Usted acepta la responsabilidad de todas las actividades que ocurran bajo su cuenta.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-heading font-semibold text-foreground">
                  6. Propiedad Intelectual
                </h2>
                <p>
                  Este sitio web contiene material que es propiedad de Winner Organa o está licenciado para nosotros. Este material incluye, pero no se limita a, el diseño, la disposición, la apariencia y los gráficos. La reproducción está prohibida.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-heading font-semibold text-foreground">
                  7. Limitación de Responsabilidad
                </h2>
                <p>
                  Winner Organa no será responsable de ningún daño que surja del uso o la incapacidad de usar los materiales en este sitio web, incluso si Winner Organa o un representante autorizado ha sido notificado de la posibilidad de tales daños.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-heading font-semibold text-foreground">
                  8. Modificaciones
                </h2>
                <p>
                  Winner Organa puede revisar estos términos de servicio para su sitio web en cualquier momento sin previo aviso. Al usar este sitio web, usted acepta estar sujeto a la versión actual de estos términos de servicio.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-heading font-semibold text-foreground">
                  9. Contacto
                </h2>
                <p>
                  Para cualquier consulta sobre estos términos, puede contactarnos en:
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

export default TerminosCondiciones;
