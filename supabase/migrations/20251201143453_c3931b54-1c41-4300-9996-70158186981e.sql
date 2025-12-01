-- Add college_name column to tokens table
ALTER TABLE public.tokens ADD COLUMN college_name TEXT NOT NULL DEFAULT 'default';

-- Add college_name column to meal_preferences table  
ALTER TABLE public.meal_preferences ADD COLUMN college_name TEXT NOT NULL DEFAULT 'default';

-- Create indexes for better performance
CREATE INDEX idx_tokens_college_name ON public.tokens(college_name);
CREATE INDEX idx_meal_preferences_college_name ON public.meal_preferences(college_name);

-- Drop existing RLS policies for tokens
DROP POLICY IF EXISTS "Students can view their own tokens" ON public.tokens;
DROP POLICY IF EXISTS "Admins can view all tokens" ON public.tokens;
DROP POLICY IF EXISTS "Students can create their own tokens" ON public.tokens;
DROP POLICY IF EXISTS "Admins can update all tokens" ON public.tokens;

-- Create new RLS policies for tokens with college filtering
CREATE POLICY "Students can view their own tokens in their college"
ON public.tokens
FOR SELECT
USING (
  auth.uid() = user_id 
  AND college_name = (SELECT college_name FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Admins can view tokens in their college"
ON public.tokens
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND college_name = (SELECT college_name FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Students can create tokens in their college"
ON public.tokens
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND college_name = (SELECT college_name FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Admins can update tokens in their college"
ON public.tokens
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND college_name = (SELECT college_name FROM public.profiles WHERE id = auth.uid())
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  AND college_name = (SELECT college_name FROM public.profiles WHERE id = auth.uid())
);

-- Drop existing RLS policies for meal_preferences
DROP POLICY IF EXISTS "Students can view their own meal preferences" ON public.meal_preferences;
DROP POLICY IF EXISTS "Students can insert their own meal preferences" ON public.meal_preferences;
DROP POLICY IF EXISTS "Students can update their own meal preferences" ON public.meal_preferences;
DROP POLICY IF EXISTS "Admins can view all meal preferences" ON public.meal_preferences;

-- Create new RLS policies for meal_preferences with college filtering
CREATE POLICY "Students can view their own meal preferences in their college"
ON public.meal_preferences
FOR SELECT
USING (
  auth.uid() = user_id
  AND college_name = (SELECT college_name FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Students can insert meal preferences in their college"
ON public.meal_preferences
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND college_name = (SELECT college_name FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Students can update their own meal preferences in their college"
ON public.meal_preferences
FOR UPDATE
USING (
  auth.uid() = user_id
  AND college_name = (SELECT college_name FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Admins can view meal preferences in their college"
ON public.meal_preferences
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND college_name = (SELECT college_name FROM public.profiles WHERE id = auth.uid())
);