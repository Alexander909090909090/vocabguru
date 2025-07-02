
-- Add admin role to Alexander Garside (user ID: d697644a-c8c6-4934-870e-30d2ec1712d9)
INSERT INTO public.user_roles (user_id, role)
VALUES ('d697644a-c8c6-4934-870e-30d2ec1712d9', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
