-- Enable realtime for key tables (notifications already enabled)
ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;
ALTER PUBLICATION supabase_realtime ADD TABLE public.complaint_reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_messages;