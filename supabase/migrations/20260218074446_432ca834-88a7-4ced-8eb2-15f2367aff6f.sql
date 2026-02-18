-- Create site_settings table for admin-controlled page content and toggles
CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key text NOT NULL UNIQUE,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid NULL
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage site settings
CREATE POLICY "Admins can manage site settings"
ON public.site_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can read site settings (needed for frontend rendering)
CREATE POLICY "Anyone can view site settings"
ON public.site_settings
FOR SELECT
USING (true);

-- Trigger to update updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default settings for all pages
INSERT INTO public.site_settings (page_key, settings) VALUES
('home', '{
  "hero_headline": "Plan trips that feel real.",
  "hero_subheadline": "Within budget, without stress. AI-powered itineraries written like a local planned your trip.",
  "cta_primary_text": "Plan My Trip",
  "cta_secondary_text": "Explore Destinations",
  "announcement_banner": "",
  "announcement_banner_active": false,
  "stats_trips": "50K+",
  "stats_rating": "4.9",
  "stats_generation_time": "60s"
}'::jsonb),
('plan_trip', '{
  "max_budget": 500000,
  "min_budget": 1000,
  "max_people": 20,
  "travel_types_enabled": ["leisure","adventure","corporate","medical","spiritual"],
  "transport_modes_enabled": ["flight","train","bus","own","public","mixed"],
  "multi_city_enabled": true,
  "notes_field_enabled": true
}'::jsonb),
('auth', '{
  "google_login_enabled": false,
  "email_login_enabled": true,
  "otp_login_enabled": false,
  "signup_enabled": true
}'::jsonb),
('plan_selection', '{
  "free_plan_enabled": true,
  "paid_plan_enabled": true,
  "premium_plan_enabled": true,
  "paid_plan_price_label": "Per Trip",
  "premium_plan_price_label": "₹799/yr",
  "recommended_plan": "basic",
  "show_promotions": true
}'::jsonb),
('free_itinerary', '{
  "feature_enabled": true,
  "show_upgrade_cta": true,
  "cta_text": "Plan Your Full Trip"
}'::jsonb),
('paid_itinerary', '{
  "download_enabled": true,
  "sharing_enabled": true,
  "regeneration_enabled": true,
  "watermark_enabled": false,
  "max_regenerations": 3
}'::jsonb),
('memory_vault', '{
  "feature_enabled": true,
  "storage_limit_free_mb": 1024,
  "storage_limit_premium_mb": 40960
}'::jsonb),
('contact', '{
  "whatsapp_enabled": true,
  "whatsapp_number": "",
  "email_address": "support@krotravel.com",
  "faqs_enabled": true
}'::jsonb),
('legal', '{
  "terms_enabled": true,
  "privacy_enabled": true,
  "refund_enabled": true
}'::jsonb);
