-- Create tokens table for student meal tokens
CREATE TABLE public.tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_code TEXT NOT NULL UNIQUE,
  meal_type TEXT NOT NULL,
  meal_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE,
  qr_code_data TEXT
);

-- Enable RLS
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;

-- Students can view their own tokens
CREATE POLICY "Students can view their own tokens"
ON public.tokens
FOR SELECT
USING (auth.uid() = user_id);

-- Students can create their own tokens
CREATE POLICY "Students can create their own tokens"
ON public.tokens
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all tokens
CREATE POLICY "Admins can view all tokens"
ON public.tokens
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update tokens (for marking as used)
CREATE POLICY "Admins can update tokens"
ON public.tokens
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for better query performance
CREATE INDEX idx_tokens_user_id ON public.tokens(user_id);
CREATE INDEX idx_tokens_meal_date ON public.tokens(meal_date);
CREATE INDEX idx_tokens_token_code ON public.tokens(token_code);