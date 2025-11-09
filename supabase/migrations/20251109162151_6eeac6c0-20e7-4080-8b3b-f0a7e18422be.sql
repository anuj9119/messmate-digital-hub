-- Create meal_preferences table for tracking students who want to skip meals
CREATE TABLE public.meal_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_date DATE NOT NULL DEFAULT CURRENT_DATE,
  skip_breakfast BOOLEAN DEFAULT false,
  skip_lunch BOOLEAN DEFAULT false,
  skip_snacks BOOLEAN DEFAULT false,
  skip_dinner BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, meal_date)
);

-- Enable RLS
ALTER TABLE public.meal_preferences ENABLE ROW LEVEL SECURITY;

-- Students can view and update their own preferences
CREATE POLICY "Students can view their own meal preferences"
  ON public.meal_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Students can insert their own meal preferences"
  ON public.meal_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update their own meal preferences"
  ON public.meal_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all preferences
CREATE POLICY "Admins can view all meal preferences"
  ON public.meal_preferences
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger to update updated_at
CREATE TRIGGER update_meal_preferences_updated_at
  BEFORE UPDATE ON public.meal_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();