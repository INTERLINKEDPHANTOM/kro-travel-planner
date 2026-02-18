
-- Fix overly permissive INSERT policy on ai_usage_logs
DROP POLICY IF EXISTS "System can insert AI usage logs" ON public.ai_usage_logs;

-- Only allow authenticated users to insert their own logs
CREATE POLICY "Authenticated users can insert AI logs"
ON public.ai_usage_logs FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
