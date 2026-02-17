
-- Create saved_itineraries table for paid trip history
CREATE TABLE public.saved_itineraries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  itinerary_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  destination TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'generated',
  regenerate_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_itineraries ENABLE ROW LEVEL SECURITY;

-- Users can view their own saved itineraries
CREATE POLICY "Users can view own saved itineraries"
ON public.saved_itineraries FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own saved itineraries
CREATE POLICY "Users can insert own saved itineraries"
ON public.saved_itineraries FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own saved itineraries
CREATE POLICY "Users can update own saved itineraries"
ON public.saved_itineraries FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own saved itineraries
CREATE POLICY "Users can delete own saved itineraries"
ON public.saved_itineraries FOR DELETE
USING (auth.uid() = user_id);

-- Admins can view all saved itineraries
CREATE POLICY "Admins can view all saved itineraries"
ON public.saved_itineraries FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_saved_itineraries_updated_at
BEFORE UPDATE ON public.saved_itineraries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create notifications table for reminders
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  trip_id UUID REFERENCES public.saved_itineraries(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'reminder',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);
