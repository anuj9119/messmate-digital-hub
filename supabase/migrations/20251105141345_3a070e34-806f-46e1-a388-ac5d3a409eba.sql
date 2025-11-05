-- Add unique constraint for menu_date and college combination
-- First drop the old constraint if it exists
ALTER TABLE public.daily_menus DROP CONSTRAINT IF EXISTS daily_menus_menu_date_key;

-- Add new unique constraint on menu_date and college
ALTER TABLE public.daily_menus ADD CONSTRAINT daily_menus_menu_date_college_key UNIQUE (menu_date, college);