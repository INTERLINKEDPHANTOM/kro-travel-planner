
-- Broadcast notifications table (admin sends to all users)
CREATE TABLE IF NOT EXISTS public.broadcast_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  image_url TEXT,
  type TEXT NOT NULL DEFAULT 'announcement',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.broadcast_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage broadcast notifications"
ON public.broadcast_notifications FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active broadcast notifications"
ON public.broadcast_notifications FOR SELECT
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Track which users have dismissed which broadcast notifications
CREATE TABLE IF NOT EXISTS public.notification_dismissals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  notification_id UUID NOT NULL REFERENCES public.broadcast_notifications(id) ON DELETE CASCADE,
  dismissed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, notification_id)
);

ALTER TABLE public.notification_dismissals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own dismissals"
ON public.notification_dismissals FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- User gamification titles table
CREATE TABLE IF NOT EXISTS public.user_titles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT 'Explorer',
  badge_emoji TEXT NOT NULL DEFAULT '🧭',
  trips_count INTEGER NOT NULL DEFAULT 0,
  total_distance_km INTEGER NOT NULL DEFAULT 0,
  dominant_persona TEXT,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_titles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own title"
ON public.user_titles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own title"
ON public.user_titles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own title"
ON public.user_titles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all titles"
ON public.user_titles FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
