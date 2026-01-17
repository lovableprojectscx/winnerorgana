import * as React from "react";

export type LegalDocId = "terminos" | "privacidad" | "devoluciones";

export const LEGAL_DOCS: Record<
  LegalDocId,
  {
    title: string;
    lastUpdated: string;
    content: React.ReactNode;
  }
> = {
  terminos: {
    title: "Términos y Condiciones",
    lastUpdated: "26 de diciembre de 2024",
    content: (
      <div className="space-y-6">
        <section className="space-y-3">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            1. Aceptación de los Términos
          </h2>
          <p>
            Al acceder y utilizar Winner Organa, usted acepta estar sujeto a estos
            Términos y Condiciones, así como a todas las leyes y regulaciones
            aplicables.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            2. Uso del Sitio
          </h2>
          <p>
            El contenido de este sitio es para su información general y uso
            únicamente. Puede estar sujeto a cambios sin previo aviso.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            3. Productos y Servicios
          </h2>
          <p>
            Winner Organa ofrece productos naturales y orgánicos de alta calidad.
            Todos nuestros productos están elaborados con ingredientes
            cuidadosamente seleccionados de origen peruano.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Los precios están sujetos a cambios sin previo aviso.</li>
            <li>Las imágenes son referenciales y pueden variar.</li>
            <li>La disponibilidad está sujeta a stock.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            4. Programa de Afiliados
          </h2>
          <p>
            Nuestro programa de afiliados permite a usuarios registrados ganar
            comisiones por referir nuevos clientes. Las comisiones se calculan
            según el nivel y las ventas generadas.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Las comisiones se pagan según los términos del programa.</li>
            <li>Winner Organa puede modificar tasas de comisión.</li>
            <li>El uso fraudulento resultará en la cancelación de la cuenta.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            5. Cuenta de Usuario
          </h2>
          <p>
            Usted es responsable de mantener la confidencialidad de su cuenta y
            contraseña, y de las actividades que ocurran bajo su cuenta.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            6. Propiedad Intelectual
          </h2>
          <p>
            Este sitio contiene material propiedad de Winner Organa o licenciado
            para su uso. La reproducción total o parcial está prohibida.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            7. Limitación de Responsabilidad
          </h2>
          <p>
            Winner Organa no será responsable de daños derivados del uso o la
            imposibilidad de uso de los materiales del sitio.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            8. Modificaciones
          </h2>
          <p>
            Winner Organa puede actualizar estos términos en cualquier momento.
            Al usar el sitio, usted acepta la versión vigente.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            9. Contacto
          </h2>
          <p>Para consultas sobre estos términos, contáctenos en:</p>
          <ul className="list-none space-y-2">
            <li>
              <strong>Email:</strong> Organawinner@gmail.com
            </li>
            <li>
              <strong>Teléfono:</strong> +51 993 516 053
            </li>
            <li>
              <strong>Dirección:</strong> Calle Monte Apamate 153, Santiago de
              Surco 15039, Lima, Perú
            </li>
          </ul>
        </section>
      </div>
    ),
  },
  privacidad: {
    title: "Política de Privacidad",
    lastUpdated: "26 de diciembre de 2024",
    content: (
      <div className="space-y-6">
        <section className="space-y-3">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            1. Información que Recopilamos
          </h2>
          <p>Recopilamos información que usted nos proporciona directamente:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Nombre completo y datos de contacto</li>
            <li>Dirección de correo electrónico</li>
            <li>Número de teléfono y WhatsApp</li>
            <li>Dirección de envío</li>
            <li>Información de pago (procesada de forma segura)</li>
            <li>Historial de compras y preferencias</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            2. Uso de la Información
          </h2>
          <p>Utilizamos la información para:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Procesar y entregar pedidos</li>
            <li>Comunicarnos sobre su cuenta y pedidos</li>
            <li>Enviar promociones (con su consentimiento)</li>
            <li>Mejorar productos y servicios</li>
            <li>Gestionar el programa de afiliados</li>
            <li>Cumplir obligaciones legales</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            3. Protección de Datos
          </h2>
          <p>
            Implementamos medidas técnicas y organizativas para proteger su
            información personal contra acceso no autorizado.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Encriptación de datos sensibles</li>
            <li>Acceso restringido</li>
            <li>Monitoreo regular</li>
            <li>Capacitación del personal</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            4. Compartir Información
          </h2>
          <p>No vendemos ni alquilamos su información personal. Solo compartimos con:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Proveedores de envío</li>
            <li>Procesadores de pago</li>
            <li>Autoridades cuando sea requerido por ley</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            5. Cookies y Tecnologías Similares
          </h2>
          <p>Usamos cookies para mejorar su experiencia, por ejemplo para:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Recordar preferencias</li>
            <li>Analizar tráfico</li>
            <li>Personalizar contenido</li>
            <li>Mejorar funcionalidad</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            6. Sus Derechos
          </h2>
          <p>Usted tiene derecho a:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Acceder a su información</li>
            <li>Rectificar datos inexactos</li>
            <li>Solicitar eliminación</li>
            <li>Oponerse al procesamiento</li>
            <li>Retirar su consentimiento</li>
            <li>Presentar una queja ante la autoridad competente</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            7. Retención de Datos
          </h2>
          <p>
            Conservamos su información el tiempo necesario para cumplir los fines
            para los que fue recopilada y requisitos legales.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            8. Menores de Edad
          </h2>
          <p>
            Nuestros servicios no están dirigidos a menores de 18 años. No
            recopilamos intencionalmente información de menores.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            9. Cambios en esta Política
          </h2>
          <p>
            Podemos actualizar esta política periódicamente. Publicaremos la
            versión vigente cuando haya cambios.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            10. Contacto
          </h2>
          <p>Para consultas o ejercer sus derechos, contáctenos:</p>
          <ul className="list-none space-y-2">
            <li>
              <strong>Email:</strong> Organawinner@gmail.com
            </li>
            <li>
              <strong>Teléfono:</strong> +51 993 516 053
            </li>
            <li>
              <strong>Dirección:</strong> Calle Monte Apamate 153, Santiago de
              Surco 15039, Lima, Perú
            </li>
          </ul>
        </section>
      </div>
    ),
  },
  devoluciones: {
    title: "Política de Devoluciones",
    lastUpdated: "26 de diciembre de 2024",
    content: (
      <div className="space-y-6">
        <section className="space-y-3">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            1. Garantía de Satisfacción
          </h2>
          <p>
            En Winner Organa nos comprometemos con la calidad de nuestros
            productos. Si no está satisfecho con su compra, estamos aquí para
            ayudarle.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            2. Plazo para Devoluciones
          </h2>
          <p>
            Tiene un plazo de <strong>7 días calendario</strong> desde la
            recepción del producto para solicitar una devolución o cambio.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            3. Condiciones para Devolución
          </h2>
          <p>Para que su devolución sea aceptada, el producto debe:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Estar sin abrir y en su empaque original</li>
            <li>No presentar daños o alteraciones por el cliente</li>
            <li>Incluir accesorios y documentación original</li>
            <li>Incluir comprobante o número de pedido</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            4. Productos No Elegibles
          </h2>
          <p>No se aceptan devoluciones en los siguientes casos:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Productos abiertos o usados</li>
            <li>Empaque dañado por el cliente</li>
            <li>Compras en promociones especiales (salvo defectos de fábrica)</li>
            <li>Perecibles una vez abiertos</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            5. Proceso de Devolución
          </h2>
          <p>Para iniciar una devolución:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              Contáctenos por WhatsApp al +51 993 516 053 o al email
              Organawinner@gmail.com
            </li>
            <li>Indique su número de pedido y motivo</li>
            <li>Espere confirmación e instrucciones</li>
            <li>Envíe el producto según lo indicado</li>
            <li>Al recibirlo y verificarlo, procesaremos reembolso o cambio</li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            6. Costos de Envío
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Producto defectuoso:</strong> Winner Organa asume el costo
            </li>
            <li>
              <strong>Error en el pedido:</strong> Winner Organa asume el costo
            </li>
            <li>
              <strong>Cambio de opinión:</strong> el cliente asume el costo
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            7. Reembolsos
          </h2>
          <p>Una vez aprobada la devolución:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Se procesará en máximo 5 días hábiles</li>
            <li>Se realizará al mismo método de pago</li>
            <li>Se enviará confirmación por email</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            8. Cambios de Producto
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Sujeto a disponibilidad</li>
            <li>Si el nuevo producto vale más, se paga la diferencia</li>
            <li>Si vale menos, se reembolsa la diferencia</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            9. Productos Defectuosos
          </h2>
          <p>Si recibe un producto defectuoso o dañado:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Notifíquenos dentro de 24 horas</li>
            <li>Tome fotografías del producto y empaque</li>
            <li>No deseche el producto hasta recibir instrucciones</li>
            <li>Gestionaremos reemplazo o reembolso sin costo adicional</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            10. Contacto
          </h2>
          <p>Para consultas sobre devoluciones, contáctenos:</p>
          <ul className="list-none space-y-2">
            <li>
              <strong>WhatsApp:</strong> +51 993 516 053
            </li>
            <li>
              <strong>Email:</strong> Organawinner@gmail.com
            </li>
            <li>
              <strong>Horario:</strong> Lunes a Viernes, 9:00 AM - 6:00 PM
            </li>
            <li>
              <strong>Dirección:</strong> Calle Monte Apamate 153, Santiago de
              Surco 15039, Lima, Perú
            </li>
          </ul>
        </section>
      </div>
    ),
  },
};
