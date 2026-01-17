import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

// Allowed origins for CORS - restrict to known domains
const ALLOWED_ORIGINS = [
  "https://ibkjfnddlbqoabhgdxzl.lovableproject.com",
  "https://winnerorgana.com",
  "https://www.winnerorgana.com",
  "http://localhost:5173",
  "http://localhost:3000",
];

const getCorsHeaders = (origin: string | null) => {
  // Check if origin is allowed, default to first allowed origin
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin || "") 
    ? origin 
    : ALLOWED_ORIGINS[0];
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin || ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
};

// HTML escape function to prevent XSS in email templates
function escapeHtml(text: string): string {
  if (!text) return "";
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Input validation
function validateInput(value: string, maxLength: number): string {
  if (!value || typeof value !== "string") return "";
  // Trim and limit length
  return value.trim().slice(0, maxLength);
}

interface ContactNotificationRequest {
  nombre: string;
  email: string;
  whatsapp?: string;
  mensaje: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-contact-notification function called");

  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate origin
  if (!ALLOWED_ORIGINS.includes(origin || "")) {
    console.log("Rejected request from unauthorized origin:", origin);
    return new Response(JSON.stringify({ success: false, error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const body: ContactNotificationRequest = await req.json();
    
    // Validate and sanitize inputs
    const nombre = validateInput(body.nombre, 100);
    const email = validateInput(body.email, 255);
    const whatsapp = validateInput(body.whatsapp || "", 20);
    const mensaje = validateInput(body.mensaje, 1000);
    
    // Basic validation
    if (!nombre || !email || !mensaje) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Sending notification for contact from:", escapeHtml(nombre), escapeHtml(email));

    // Escape all user inputs for HTML email template
    const safeNombre = escapeHtml(nombre);
    const safeEmail = escapeHtml(email);
    const safeWhatsapp = escapeHtml(whatsapp);
    const safeMensaje = escapeHtml(mensaje);
    
    // Clean whatsapp number for the URL (only digits)
    const whatsappDigits = whatsapp.replace(/\D/g, "");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Winner Organa <onboarding@resend.dev>",
        to: ["winnerorganaoficial@gmail.com"],
        subject: `Nuevo mensaje de contacto: ${safeNombre}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #2e7d32, #4caf50); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; }
              .field { margin-bottom: 15px; }
              .label { font-weight: bold; color: #2e7d32; }
              .value { margin-top: 5px; padding: 10px; background: white; border-radius: 4px; border-left: 3px solid #4caf50; }
              .message-box { white-space: pre-wrap; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🌿 Nuevo Mensaje de Contacto</h1>
                <p>Winner Organa - Superfoods</p>
              </div>
              <div class="content">
                <div class="field">
                  <div class="label">👤 Nombre:</div>
                  <div class="value">${safeNombre}</div>
                </div>
                <div class="field">
                  <div class="label">📧 Email:</div>
                  <div class="value"><a href="mailto:${safeEmail}">${safeEmail}</a></div>
                </div>
                ${safeWhatsapp ? `
                <div class="field">
                  <div class="label">📱 WhatsApp:</div>
                  <div class="value"><a href="https://wa.me/${whatsappDigits}">${safeWhatsapp}</a></div>
                </div>
                ` : ""}
                <div class="field">
                  <div class="label">💬 Mensaje:</div>
                  <div class="value message-box">${safeMensaje}</div>
                </div>
              </div>
              <div class="footer">
                <p>Este mensaje fue enviado desde el formulario de contacto de winnerorgana.com</p>
                <p>Fecha: ${new Date().toLocaleString("es-PE", { timeZone: "America/Lima" })}</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", data);
      throw new Error(data.message || "Failed to send email");
    }

    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending contact notification:", error);
    return new Response(
      JSON.stringify({ success: false, error: "An error occurred processing your request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
