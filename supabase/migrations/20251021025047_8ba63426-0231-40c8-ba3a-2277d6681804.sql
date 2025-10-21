-- Create a function to validate admin role assignments
CREATE OR REPLACE FUNCTION public.validate_admin_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Only validate for admin role
  IF NEW.role = 'admin' THEN
    -- Get the user's email from profiles table
    SELECT email INTO user_email
    FROM public.profiles
    WHERE id = NEW.user_id;
    
    -- Only allow admin role for specific email
    IF user_email != 'ys8800221@gmail.com' THEN
      RAISE EXCEPTION 'Admin role can only be assigned to ys8800221@gmail.com';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to validate admin role on insert and update
DROP TRIGGER IF EXISTS validate_admin_role_trigger ON public.user_roles;
CREATE TRIGGER validate_admin_role_trigger
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_admin_role();

-- Remove admin role from any users who aren't ys8800221@gmail.com
DELETE FROM public.user_roles
WHERE role = 'admin'
  AND user_id NOT IN (
    SELECT id FROM public.profiles WHERE email = 'ys8800221@gmail.com'
  );

-- Grant admin role to ys8800221@gmail.com if they exist and don't have it
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM public.profiles
WHERE email = 'ys8800221@gmail.com'
  AND id NOT IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
ON CONFLICT (user_id, role) DO NOTHING;