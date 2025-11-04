-- Fix RLS policy for daily_menus to allow admin inserts
-- Drop the existing insert policy
DROP POLICY IF EXISTS "Admins can insert menus" ON public.daily_menus;

-- Create new insert policy that allows admins to insert menus
CREATE POLICY "Admins can insert menus" 
ON public.daily_menus 
FOR INSERT 
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
);

-- Also update the update policy to ensure it works correctly
DROP POLICY IF EXISTS "Admins can update menus" ON public.daily_menus;

CREATE POLICY "Admins can update menus" 
ON public.daily_menus 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));