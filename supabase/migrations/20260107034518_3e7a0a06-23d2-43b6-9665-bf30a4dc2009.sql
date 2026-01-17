-- Add database constraints to contact_messages table for server-side validation
-- This prevents bypass of client-side validation

ALTER TABLE public.contact_messages
  ADD CONSTRAINT contact_messages_nombre_length CHECK (length(nombre) >= 2 AND length(nombre) <= 100),
  ADD CONSTRAINT contact_messages_email_length CHECK (length(email) <= 255),
  ADD CONSTRAINT contact_messages_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  ADD CONSTRAINT contact_messages_mensaje_length CHECK (length(mensaje) >= 10 AND length(mensaje) <= 1000),
  ADD CONSTRAINT contact_messages_whatsapp_length CHECK (whatsapp IS NULL OR length(whatsapp) <= 30);