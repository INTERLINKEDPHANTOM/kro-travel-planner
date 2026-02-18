
-- Promo codes table
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL DEFAULT 'percentage', -- 'flat' or 'percentage'
  discount_value numeric NOT NULL DEFAULT 10,
  min_cart_value numeric DEFAULT 0,
  max_uses integer DEFAULT NULL,
  uses_count integer NOT NULL DEFAULT 0,
  new_users_only boolean NOT NULL DEFAULT false,
  one_time_per_user boolean NOT NULL DEFAULT true,
  expires_at timestamp with time zone DEFAULT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage promo codes"
ON public.promo_codes FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active promo codes"
ON public.promo_codes FOR SELECT
USING (is_active = true);

-- Promo code usage tracking
CREATE TABLE IF NOT EXISTS public.promo_code_uses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id uuid REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  trip_id uuid,
  amount_saved numeric,
  used_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.promo_code_uses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all promo uses"
ON public.promo_code_uses FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert own promo uses"
ON public.promo_code_uses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own promo uses"
ON public.promo_code_uses FOR SELECT
USING (auth.uid() = user_id);

-- Super premium access table
CREATE TABLE IF NOT EXISTS public.super_premium_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  granted_by uuid NOT NULL,
  access_type text NOT NULL DEFAULT 'unlimited', -- 'unlimited' or 'time_bound'
  expires_at timestamp with time zone DEFAULT NULL,
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  granted_at timestamp with time zone NOT NULL DEFAULT now(),
  revoked_at timestamp with time zone DEFAULT NULL
);

ALTER TABLE public.super_premium_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage super premium access"
ON public.super_premium_access FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own super premium status"
ON public.super_premium_access FOR SELECT
USING (auth.uid() = user_id);

-- Add super_premium column to user_subscriptions if it doesn't exist
ALTER TABLE public.user_subscriptions ADD COLUMN IF NOT EXISTS is_super_premium boolean NOT NULL DEFAULT false;

-- AI usage tracking
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  usage_type text NOT NULL DEFAULT 'paid', -- 'free' or 'paid'
  status text NOT NULL DEFAULT 'success', -- 'success' or 'failed'
  destination text,
  regenerate_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all AI usage logs"
ON public.ai_usage_logs FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert AI usage logs"
ON public.ai_usage_logs FOR INSERT
WITH CHECK (true);
