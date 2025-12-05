-- Drop all existing college-based RLS policies
DROP POLICY IF EXISTS "Students can view their own tokens in their college" ON public.tokens;
DROP POLICY IF EXISTS "Admins can view tokens in their college" ON public.tokens;
DROP POLICY IF EXISTS "Students can create tokens in their college" ON public.tokens;
DROP POLICY IF EXISTS "Admins can update tokens in their college" ON public.tokens;

DROP POLICY IF EXISTS "Users can view their college menus" ON public.daily_menus;
DROP POLICY IF EXISTS "Admins can insert menus for their college" ON public.daily_menus;
DROP POLICY IF EXISTS "Admins can update their college menus" ON public.daily_menus;
DROP POLICY IF EXISTS "Admins can delete their college menus" ON public.daily_menus;

DROP POLICY IF EXISTS "Students can view their own meal preferences in their college" ON public.meal_preferences;
DROP POLICY IF EXISTS "Students can insert meal preferences in their college" ON public.meal_preferences;
DROP POLICY IF EXISTS "Students can update their own meal preferences in their college" ON public.meal_preferences;
DROP POLICY IF EXISTS "Admins can view meal preferences in their college" ON public.meal_preferences;

-- Create new simplified RLS policies for tokens
CREATE POLICY "Users can view their own tokens" 
ON public.tokens FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all tokens" 
ON public.tokens FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create their own tokens" 
ON public.tokens FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update tokens" 
ON public.tokens FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create new simplified RLS policies for daily_menus
CREATE POLICY "Anyone can view menus" 
ON public.daily_menus FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert menus" 
ON public.daily_menus FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update menus" 
ON public.daily_menus FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete menus" 
ON public.daily_menus FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create new simplified RLS policies for meal_preferences
CREATE POLICY "Users can view their own meal preferences" 
ON public.meal_preferences FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all meal preferences" 
ON public.meal_preferences FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert their own meal preferences" 
ON public.meal_preferences FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal preferences" 
ON public.meal_preferences FOR UPDATE 
USING (auth.uid() = user_id);

-- Update handle_new_user function to not use college_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role text;
BEGIN
  -- Get role from metadata
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
  
  -- Insert profile
  INSERT INTO public.profiles (id, full_name, college_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    'default'
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Assign role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;