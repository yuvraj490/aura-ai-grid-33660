-- Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles" ON public.profiles
FOR UPDATE USING (
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Update default prompts_limit to 10
ALTER TABLE public.profiles 
ALTER COLUMN prompts_limit SET DEFAULT 10;

-- Update existing free users to have 10 prompts limit
UPDATE public.profiles
SET prompts_limit = 10
WHERE plan = 'free' AND prompts_limit != 10;