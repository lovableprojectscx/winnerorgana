import { Link } from "react-router-dom";
import { Facebook, Instagram, Mail, MapPin, Phone, Heart } from "lucide-react";
import logoWinnerOrgana from "@/assets/logo-winner-organa.png";
import LegalSheet from "@/components/legal/LegalSheet";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-[#1a472a] to-[#0f2918] text-white pt-20 pb-10 relative overflow-hidden border-t border-accent/20">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {/* Brand */}
          <div className="lg:col-span-1 space-y-6">
            <Link to="/" className="inline-block group">
              <img
                src={logoWinnerOrgana}
                alt="Winner Organa"
                className="h-16 w-auto object-contain brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity duration-300"
              />
            </Link>
            <p className="text-gray-300 leading-relaxed text-sm font-light max-w-xs">
              Del campo a tus manos. Productos orgánicos de la tierra peruana, cultivados con respeto y dedicación para una vida más saludable.
            </p>
            <div className="flex gap-4 pt-2">
              {[
                { icon: Facebook, href: "#" },
                { icon: Instagram, href: "#" }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="w-10 h-10 bg-white/5 border border-white/10 hover:bg-accent hover:border-accent hover:text-primary rounded-full flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-accent flex items-center gap-2 uppercase tracking-wider text-xs">
              Explorar
            </h3>
            <ul className="space-y-3">
              {[
                { to: "/catalogo", label: "Catálogo de Productos" },
                { to: "/programa-afiliados", label: "Programa de Afiliados" },
                { to: "/contacto", label: "Contáctanos" },
                { to: "/area-afiliado", label: "Área de Afiliado" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-accent transition-colors duration-300 flex items-center gap-2 group text-sm"
                  >
                    <span className="w-1 h-1 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-accent flex items-center gap-2 uppercase tracking-wider text-xs">
              Legal
            </h3>

            <ul className="space-y-3">
              <li>
                <LegalSheet
                  doc="terminos"
                  triggerClassName="text-gray-400 hover:text-accent transition-colors duration-300 text-left text-sm flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
                  Términos y Condiciones
                </LegalSheet>
              </li>
              <li>
                <LegalSheet
                  doc="privacidad"
                  triggerClassName="text-gray-400 hover:text-accent transition-colors duration-300 text-left text-sm flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
                  Política de Privacidad
                </LegalSheet>
              </li>
              <li>
                <LegalSheet
                  doc="devoluciones"
                  triggerClassName="text-gray-400 hover:text-accent transition-colors duration-300 text-left text-sm flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
                  Política de Devoluciones
                </LegalSheet>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-accent flex items-center gap-2 uppercase tracking-wider text-xs">
              Información de Contacto
            </h3>
            <ul className="space-y-5">
              <li className="flex items-start gap-4 group">
                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-accent/10 transition-colors">
                  <MapPin className="w-5 h-5 text-accent shrink-0" />
                </div>
                <span className="text-gray-300 text-sm leading-relaxed">
                  Calle Monte Apamate 153,<br /> Santiago de Surco 15039,<br /> Lima, Perú
                </span>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-accent/10 transition-colors">
                  <Mail className="w-5 h-5 text-accent shrink-0" />
                </div>
                <a
                  href="mailto:Organawinner@gmail.com"
                  className="text-gray-300 text-sm hover:text-accent transition-colors"
                >
                  Organawinner@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-accent/10 transition-colors">
                  <Phone className="w-5 h-5 text-accent shrink-0" />
                </div>
                <a
                  href="tel:+51993516053"
                  className="text-gray-300 text-sm hover:text-accent transition-colors font-mono"
                >
                  +51 993 516 053
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5 bg-black/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <p>© {new Date().getFullYear()} Winner Organa S.A.C. Todos los derechos reservados.</p>
            <p className="flex items-center gap-1">
              Desarrollado con <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" /> en Perú
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

