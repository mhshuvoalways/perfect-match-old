
-- Enable real-time updates for collaborations table
ALTER TABLE public.collaborations REPLICA IDENTITY FULL;

-- Add the collaborations table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.collaborations;
