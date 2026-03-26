
-- Trip Challenges
CREATE TABLE public.trip_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  challenge_key text NOT NULL,
  progress integer NOT NULL DEFAULT 0,
  target integer NOT NULL DEFAULT 5,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, challenge_key)
);
ALTER TABLE public.trip_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own challenges" ON public.trip_challenges FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Duo Travel matching
CREATE TABLE public.duo_travel_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  destination text NOT NULL,
  travel_dates_start date NOT NULL,
  travel_dates_end date NOT NULL,
  travel_style text DEFAULT 'explorer',
  bio text,
  is_active boolean DEFAULT true,
  matched_with uuid,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.duo_travel_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own matches" ON public.duo_travel_matches FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users see active listings" ON public.duo_travel_matches FOR SELECT TO authenticated USING (is_active = true);

-- Trip Ratings
CREATE TABLE public.trip_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  trip_id uuid REFERENCES public.saved_itineraries(id) ON DELETE CASCADE,
  overall_rating integer NOT NULL,
  food_rating integer,
  stay_rating integer,
  experience_rating integer,
  review_text text,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, trip_id)
);
ALTER TABLE public.trip_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ratings" ON public.trip_ratings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public ratings visible" ON public.trip_ratings FOR SELECT USING (is_public = true);

-- Passport Stamps
CREATE TABLE public.passport_stamps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  destination text NOT NULL,
  country text,
  stamp_date date NOT NULL DEFAULT CURRENT_DATE,
  trip_id uuid REFERENCES public.saved_itineraries(id) ON DELETE SET NULL,
  stamp_style text DEFAULT 'classic',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, destination)
);
ALTER TABLE public.passport_stamps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own stamps" ON public.passport_stamps FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Daily Expenses
CREATE TABLE public.trip_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  trip_id uuid REFERENCES public.saved_itineraries(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  currency text DEFAULT 'INR',
  category text NOT NULL DEFAULT 'other',
  description text,
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.trip_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own expenses" ON public.trip_expenses FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Safety Alerts
CREATE TABLE public.safety_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination text NOT NULL,
  alert_level text NOT NULL DEFAULT 'low',
  title text NOT NULL,
  description text NOT NULL,
  source text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);
ALTER TABLE public.safety_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active alerts" ON public.safety_alerts FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage alerts" ON public.safety_alerts FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
