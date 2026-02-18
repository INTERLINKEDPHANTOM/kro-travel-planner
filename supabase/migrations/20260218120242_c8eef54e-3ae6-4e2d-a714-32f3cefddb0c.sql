
-- Trip Chat Messages table for real-time per-trip chat
CREATE TABLE public.trip_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.saved_itineraries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  sender_name TEXT NOT NULL DEFAULT 'Traveller',
  sender_avatar TEXT,
  message TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text', -- 'text' | 'image'
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trip_messages ENABLE ROW LEVEL SECURITY;

-- Only trip owner and people shared with can read messages
CREATE POLICY "Trip owner can read messages"
ON public.trip_messages FOR SELECT
USING (
  auth.uid() = (SELECT user_id FROM public.saved_itineraries WHERE id = trip_id)
  OR auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.shared_trips
    WHERE shared_trips.trip_id = trip_messages.trip_id
    AND shared_trips.shared_with_id = auth.uid()
  )
);

-- Authenticated users with access can send messages
CREATE POLICY "Authorized users can insert messages"
ON public.trip_messages FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (
    auth.uid() = (SELECT user_id FROM public.saved_itineraries WHERE id = trip_id)
    OR EXISTS (
      SELECT 1 FROM public.shared_trips
      WHERE shared_trips.trip_id = trip_messages.trip_id
      AND shared_trips.shared_with_id = auth.uid()
    )
  )
);

-- Users can delete own messages
CREATE POLICY "Users can delete own messages"
ON public.trip_messages FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime for trip_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_messages;

-- Personal Travel Pages table
CREATE TABLE public.travel_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE, -- e.g. "rohan-traveller"
  display_name TEXT NOT NULL DEFAULT 'Traveller',
  bio TEXT,
  cover_image_url TEXT,
  avatar_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  show_trips BOOLEAN NOT NULL DEFAULT true,
  show_stats BOOLEAN NOT NULL DEFAULT true,
  show_title BOOLEAN NOT NULL DEFAULT true,
  instagram_url TEXT,
  youtube_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.travel_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public pages visible to all"
ON public.travel_pages FOR SELECT
USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage own travel page"
ON public.travel_pages FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Trip anniversary dates stored separately for tracking
CREATE TABLE public.trip_anniversaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  trip_id UUID NOT NULL REFERENCES public.saved_itineraries(id) ON DELETE CASCADE,
  anniversary_date DATE NOT NULL, -- month-day used each year
  destination TEXT NOT NULL,
  reminder_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, trip_id)
);

ALTER TABLE public.trip_anniversaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own anniversaries"
ON public.trip_anniversaries FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_trip_messages_trip_id ON public.trip_messages(trip_id);
CREATE INDEX idx_trip_messages_created_at ON public.trip_messages(created_at);
CREATE INDEX idx_travel_pages_slug ON public.travel_pages(slug);
CREATE INDEX idx_trip_anniversaries_user ON public.trip_anniversaries(user_id);

-- Trigger for travel_pages updated_at
CREATE TRIGGER update_travel_pages_updated_at
BEFORE UPDATE ON public.travel_pages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
