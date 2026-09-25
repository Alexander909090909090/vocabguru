-- Assign 'user' role to any existing users who don't have roles yet
INSERT INTO public.user_roles (user_id, role)
SELECT au.id, 'user'::app_role
FROM auth.users au
LEFT JOIN public.user_roles ur ON au.id = ur.user_id
WHERE ur.user_id IS NULL
ON CONFLICT (user_id, role) DO NOTHING;