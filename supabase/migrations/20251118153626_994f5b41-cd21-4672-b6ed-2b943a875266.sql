-- Add college_name to profiles table
ALTER TABLE public.profiles 
ADD COLUMN college_name TEXT NOT NULL DEFAULT 'default';

-- Add college_name to daily_menus table
ALTER TABLE public.daily_menus 
ADD COLUMN college_name TEXT NOT NULL DEFAULT 'default';

-- Create indexes for performance
CREATE INDEX idx_profiles_college_name ON public.profiles(college_name);
CREATE INDEX idx_daily_menus_college_name ON public.daily_menus(college_name);
CREATE INDEX idx_daily_menus_date_college ON public.daily_menus(menu_date, college_name);

-- Update handle_new_user function to include college_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
  user_college text;
BEGIN
  -- Get role and college from metadata
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
  user_college := COALESCE(NEW.raw_user_meta_data->>'college_name', 'default');
  
  -- Insert profile with college
  INSERT INTO public.profiles (id, full_name, college_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    user_college
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Assign role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Update RLS policies for daily_menus to filter by college
DROP POLICY IF EXISTS "All authenticated users can view menus" ON public.daily_menus;
DROP POLICY IF EXISTS "Admins can insert menus" ON public.daily_menus;
DROP POLICY IF EXISTS "Admins can update menus" ON public.daily_menus;
DROP POLICY IF EXISTS "Admins can delete menus" ON public.daily_menus;

-- Menus: Users can only view menus from their college
CREATE POLICY "Users can view their college menus" 
ON public.daily_menus 
FOR SELECT 
USING (
  college_name = (SELECT college_name FROM public.profiles WHERE id = auth.uid())
);

-- Admins can insert menus for their college only
CREATE POLICY "Admins can insert menus for their college" 
ON public.daily_menus 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) AND
  college_name = (SELECT college_name FROM public.profiles WHERE id = auth.uid())
);

-- Admins can update menus for their college only
CREATE POLICY "Admins can update their college menus" 
ON public.daily_menus 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'admin'::app_role) AND
  college_name = (SELECT college_name FROM public.profiles WHERE id = auth.uid())
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) AND
  college_name = (SELECT college_name FROM public.profiles WHERE id = auth.uid())
);

-- Admins can delete menus for their college only
CREATE POLICY "Admins can delete their college menus" 
ON public.daily_menus 
FOR DELETE 
USING (
  has_role(auth.uid(), 'admin'::app_role) AND
  college_name = (SELECT college_name FROM public.profiles WHERE id = auth.uid())
);