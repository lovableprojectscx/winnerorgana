CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: affiliate_level; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.affiliate_level AS ENUM (
    'Vendedor Directo',
    'Mentor Directo',
    'Líder de Equipo',
    'Desarrollador',
    'Expansor',
    'Consolidador',
    'Embajador'
);


--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'affiliate',
    'user'
);


--
-- Name: add_user_credits(text, numeric, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.add_user_credits(p_email text, p_amount numeric, p_description text DEFAULT 'Créditos añadidos por admin'::text) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_user_id uuid;
  v_user_credit_id uuid;
  v_new_balance numeric;
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'No autorizado');
  END IF;

  -- Find user by email
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Usuario no encontrado con ese email');
  END IF;

  -- Get or create user_credits record
  SELECT id INTO v_user_credit_id FROM user_credits WHERE user_id = v_user_id;
  
  IF v_user_credit_id IS NULL THEN
    INSERT INTO user_credits (user_id, email, balance)
    VALUES (v_user_id, p_email, p_amount)
    RETURNING id, balance INTO v_user_credit_id, v_new_balance;
  ELSE
    UPDATE user_credits 
    SET balance = balance + p_amount
    WHERE id = v_user_credit_id
    RETURNING balance INTO v_new_balance;
  END IF;

  -- Record transaction
  INSERT INTO credit_transactions (user_credit_id, amount, type, description, admin_id)
  VALUES (v_user_credit_id, p_amount, 'add', p_description, auth.uid());

  RETURN json_build_object(
    'success', true, 
    'new_balance', v_new_balance,
    'email', p_email
  );
END;
$$;


--
-- Name: create_order_commissions(uuid, numeric, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_order_commissions(p_order_id uuid, p_order_amount numeric, p_affiliate_code text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_affiliate_id uuid;
  v_current_affiliate_id uuid;
  v_referred_by uuid;
  v_level integer;
  v_commission_rates numeric[] := ARRAY[0.10, 0.04, 0.02, 0.02, 0.01, 0.01, 0.01];
  v_commission_amount numeric;
BEGIN
  -- Find the affiliate by code
  SELECT id, referred_by
  INTO v_affiliate_id, v_referred_by
  FROM affiliates 
  WHERE affiliate_code = UPPER(p_affiliate_code);
  
  IF v_affiliate_id IS NULL THEN
    RETURN; -- No valid affiliate found
  END IF;
  
  -- Level 1 Commission (10%) - Direct seller
  v_commission_amount := p_order_amount * v_commission_rates[1];
  INSERT INTO commissions (affiliate_id, order_id, amount, level, status)
  VALUES (v_affiliate_id, p_order_id, v_commission_amount, 1, 'pending');
  
  -- Update level 1 affiliate's totals
  UPDATE affiliates 
  SET total_sales = COALESCE(total_sales, 0) + p_order_amount,
      total_commissions = COALESCE(total_commissions, 0) + v_commission_amount
  WHERE id = v_affiliate_id;
  
  -- Process levels 2-7 (following the referral chain)
  v_current_affiliate_id := v_referred_by;
  v_level := 2;
  
  WHILE v_current_affiliate_id IS NOT NULL AND v_level <= 7 LOOP
    v_commission_amount := p_order_amount * v_commission_rates[v_level];
    
    -- Insert commission for this level
    INSERT INTO commissions (affiliate_id, order_id, amount, level, status)
    VALUES (v_current_affiliate_id, p_order_id, v_commission_amount, v_level, 'pending');
    
    -- Update affiliate's commissions
    UPDATE affiliates 
    SET total_commissions = COALESCE(total_commissions, 0) + v_commission_amount
    WHERE id = v_current_affiliate_id;
    
    -- Get next referrer in the chain
    SELECT referred_by INTO v_referred_by
    FROM affiliates WHERE id = v_current_affiliate_id;
    
    v_current_affiliate_id := v_referred_by;
    v_level := v_level + 1;
  END LOOP;
END;
$$;


--
-- Name: handle_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: use_credits_for_purchase(numeric, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.use_credits_for_purchase(p_amount numeric, p_order_id uuid) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_user_credit_id uuid;
  v_current_balance numeric;
  v_new_balance numeric;
BEGIN
  -- Get user's credit record
  SELECT id, balance INTO v_user_credit_id, v_current_balance 
  FROM user_credits 
  WHERE user_id = auth.uid();
  
  IF v_user_credit_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'No tienes WinnerPoints');
  END IF;

  IF v_current_balance < p_amount THEN
    RETURN json_build_object('success', false, 'error', 'Saldo insuficiente', 'balance', v_current_balance);
  END IF;

  -- Deduct credits
  UPDATE user_credits 
  SET balance = balance - p_amount
  WHERE id = v_user_credit_id
  RETURNING balance INTO v_new_balance;

  -- Record transaction
  INSERT INTO credit_transactions (user_credit_id, amount, type, description, order_id)
  VALUES (v_user_credit_id, -p_amount, 'purchase', 'Compra con WinnerPoints', p_order_id);

  RETURN json_build_object(
    'success', true, 
    'new_balance', v_new_balance
  );
END;
$$;


SET default_table_access_method = heap;

--
-- Name: affiliates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.affiliates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    affiliate_code text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    total_sales numeric(10,2) DEFAULT 0,
    level text DEFAULT 'Bronce'::text,
    status text DEFAULT 'Activo'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    referred_by uuid,
    commission_rate numeric DEFAULT 10,
    total_commissions numeric DEFAULT 0,
    referral_count integer DEFAULT 0,
    yape_number text
);


--
-- Name: business_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.business_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_name text DEFAULT 'Winner Organa'::text NOT NULL,
    logo_url text,
    contact_email text,
    contact_phone text,
    whatsapp_number text,
    address text,
    commission_level_1 numeric DEFAULT 10 NOT NULL,
    commission_level_2 numeric DEFAULT 5 NOT NULL,
    commission_level_3 numeric DEFAULT 2 NOT NULL,
    notify_new_orders boolean DEFAULT true NOT NULL,
    notify_new_affiliates boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    commission_level_4 numeric DEFAULT 2 NOT NULL,
    commission_level_5 numeric DEFAULT 1 NOT NULL,
    commission_level_6 numeric DEFAULT 1 NOT NULL,
    commission_level_7 numeric DEFAULT 1 NOT NULL
);


--
-- Name: commissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.commissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    affiliate_id uuid NOT NULL,
    order_id uuid,
    amount numeric DEFAULT 0 NOT NULL,
    level integer DEFAULT 1 NOT NULL,
    status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: contact_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre text NOT NULL,
    email text NOT NULL,
    whatsapp text,
    mensaje text NOT NULL,
    status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: credit_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.credit_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_credit_id uuid NOT NULL,
    amount numeric NOT NULL,
    type text NOT NULL,
    description text,
    admin_id uuid,
    order_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT credit_transactions_type_check CHECK ((type = ANY (ARRAY['add'::text, 'subtract'::text, 'purchase'::text])))
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_number text NOT NULL,
    customer_name text NOT NULL,
    customer_email text NOT NULL,
    product_id uuid,
    product_name text NOT NULL,
    amount numeric(10,2) NOT NULL,
    status text DEFAULT 'Pendiente'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    image_url text,
    stock integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: referrals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.referrals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    referrer_id uuid NOT NULL,
    referred_id uuid NOT NULL,
    level integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_credits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_credits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    email text NOT NULL,
    balance numeric DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_credits_balance_check CHECK ((balance >= (0)::numeric))
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: affiliates affiliates_affiliate_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliates
    ADD CONSTRAINT affiliates_affiliate_code_key UNIQUE (affiliate_code);


--
-- Name: affiliates affiliates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliates
    ADD CONSTRAINT affiliates_pkey PRIMARY KEY (id);


--
-- Name: business_settings business_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_settings
    ADD CONSTRAINT business_settings_pkey PRIMARY KEY (id);


--
-- Name: commissions commissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.commissions
    ADD CONSTRAINT commissions_pkey PRIMARY KEY (id);


--
-- Name: contact_messages contact_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (id);


--
-- Name: credit_transactions credit_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_transactions
    ADD CONSTRAINT credit_transactions_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: referrals referrals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_pkey PRIMARY KEY (id);


--
-- Name: referrals referrals_referrer_id_referred_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_referrer_id_referred_id_key UNIQUE (referrer_id, referred_id);


--
-- Name: user_credits user_credits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_credits
    ADD CONSTRAINT user_credits_pkey PRIMARY KEY (id);


--
-- Name: user_credits user_credits_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_credits
    ADD CONSTRAINT user_credits_user_id_key UNIQUE (user_id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: affiliates update_affiliates_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_affiliates_updated_at BEFORE UPDATE ON public.affiliates FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: business_settings update_business_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_business_settings_updated_at BEFORE UPDATE ON public.business_settings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: orders update_orders_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: products update_products_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: user_credits update_user_credits_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_credits_updated_at BEFORE UPDATE ON public.user_credits FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: affiliates affiliates_referred_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliates
    ADD CONSTRAINT affiliates_referred_by_fkey FOREIGN KEY (referred_by) REFERENCES public.affiliates(id);


--
-- Name: affiliates affiliates_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliates
    ADD CONSTRAINT affiliates_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: commissions commissions_affiliate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.commissions
    ADD CONSTRAINT commissions_affiliate_id_fkey FOREIGN KEY (affiliate_id) REFERENCES public.affiliates(id) ON DELETE CASCADE;


--
-- Name: commissions commissions_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.commissions
    ADD CONSTRAINT commissions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: credit_transactions credit_transactions_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_transactions
    ADD CONSTRAINT credit_transactions_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES auth.users(id);


--
-- Name: credit_transactions credit_transactions_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_transactions
    ADD CONSTRAINT credit_transactions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: credit_transactions credit_transactions_user_credit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_transactions
    ADD CONSTRAINT credit_transactions_user_credit_id_fkey FOREIGN KEY (user_credit_id) REFERENCES public.user_credits(id) ON DELETE CASCADE;


--
-- Name: orders orders_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: referrals referrals_referred_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_referred_id_fkey FOREIGN KEY (referred_id) REFERENCES public.affiliates(id) ON DELETE CASCADE;


--
-- Name: referrals referrals_referrer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_referrer_id_fkey FOREIGN KEY (referrer_id) REFERENCES public.affiliates(id) ON DELETE CASCADE;


--
-- Name: user_credits user_credits_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_credits
    ADD CONSTRAINT user_credits_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_credits Admins can insert credits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert credits" ON public.user_credits FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: business_settings Admins can insert settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert settings" ON public.business_settings FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: credit_transactions Admins can insert transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert transactions" ON public.credit_transactions FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: affiliates Admins can manage affiliates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage affiliates" ON public.affiliates USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: commissions Admins can manage commissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage commissions" ON public.commissions USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: orders Admins can manage orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage orders" ON public.orders USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: products Admins can manage products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage products" ON public.products USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: referrals Admins can manage referrals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage referrals" ON public.referrals USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_credits Admins can update credits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update credits" ON public.user_credits FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: contact_messages Admins can update messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update messages" ON public.contact_messages FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: business_settings Admins can update settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update settings" ON public.business_settings FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: affiliates Admins can view all affiliates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all affiliates" ON public.affiliates FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_credits Admins can view all credits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all credits" ON public.user_credits FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: contact_messages Admins can view all messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all messages" ON public.contact_messages FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: orders Admins can view all orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can view all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: credit_transactions Admins can view all transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all transactions" ON public.credit_transactions FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: business_settings Admins can view settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view settings" ON public.business_settings FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: affiliates Affiliates can update their own data; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Affiliates can update their own data" ON public.affiliates FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: commissions Affiliates can view their commissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Affiliates can view their commissions" ON public.commissions FOR SELECT USING (((affiliate_id IN ( SELECT affiliates.id
   FROM public.affiliates
  WHERE (affiliates.user_id = auth.uid()))) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: affiliates Affiliates can view their own data; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Affiliates can view their own data" ON public.affiliates FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: referrals Affiliates can view their referrals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Affiliates can view their referrals" ON public.referrals FOR SELECT USING (((referrer_id IN ( SELECT affiliates.id
   FROM public.affiliates
  WHERE (affiliates.user_id = auth.uid()))) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: commissions Allow commission creation via function; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow commission creation via function" ON public.commissions FOR INSERT WITH CHECK (true);


--
-- Name: orders Anyone can create orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);


--
-- Name: contact_messages Anyone can submit contact form; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can submit contact form" ON public.contact_messages FOR INSERT WITH CHECK (true);


--
-- Name: products Anyone can view products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);


--
-- Name: referrals Authenticated users can create referrals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create referrals" ON public.referrals FOR INSERT WITH CHECK ((auth.uid() IS NOT NULL));


--
-- Name: affiliates Users can create their own affiliate record; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own affiliate record" ON public.affiliates FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_credits Users can view their own credits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own credits" ON public.user_credits FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: credit_transactions Users can view their own transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own transactions" ON public.credit_transactions FOR SELECT USING ((user_credit_id IN ( SELECT user_credits.id
   FROM public.user_credits
  WHERE (user_credits.user_id = auth.uid()))));


--
-- Name: affiliates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

--
-- Name: business_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: commissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

--
-- Name: contact_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: credit_transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: orders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

--
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

--
-- Name: referrals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

--
-- Name: user_credits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;