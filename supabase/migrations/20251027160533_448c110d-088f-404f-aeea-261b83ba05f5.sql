-- Enable realtime for daily_menus table so menu updates are reflected immediately
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_menus;