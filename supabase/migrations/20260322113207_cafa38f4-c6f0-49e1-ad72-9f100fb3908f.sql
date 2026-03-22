
-- Travel Bingo progress
CREATE TABLE public.travel_bingo_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_key text NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  trip_id uuid REFERENCES public.saved_itineraries(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, item_key)
);

ALTER TABLE public.travel_bingo_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own bingo" ON public.travel_bingo_items
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Referral codes
CREATE TABLE public.referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  uses_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own referral" ON public.referral_codes
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users create own referral" ON public.referral_codes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Referral uses
CREATE TABLE public.referral_uses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id uuid REFERENCES public.referral_codes(id) ON DELETE CASCADE,
  referred_user_id uuid NOT NULL,
  reward_type text DEFAULT 'premium_days',
  reward_value integer DEFAULT 3,
  created_at timestamptz DEFAULT now(),
  UNIQUE(referred_user_id)
);

ALTER TABLE public.referral_uses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own referral uses" ON public.referral_uses
  FOR SELECT TO authenticated
  USING (auth.uid() = referred_user_id);

CREATE POLICY "Insert referral uses" ON public.referral_uses
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = referred_user_id);

-- Update referral count function
CREATE OR REPLACE FUNCTION public.increment_referral_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.referral_codes SET uses_count = uses_count + 1 WHERE id = NEW.referral_code_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_referral_use
  AFTER INSERT ON public.referral_uses
  FOR EACH ROW EXECUTE FUNCTION public.increment_referral_count();
