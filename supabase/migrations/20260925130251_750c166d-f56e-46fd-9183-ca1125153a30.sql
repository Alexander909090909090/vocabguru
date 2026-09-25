GRANT SELECT ON public.morphemes TO anon, authenticated;
GRANT ALL ON public.morphemes TO service_role;

GRANT SELECT ON public.word_morphemes TO anon, authenticated;
GRANT ALL ON public.word_morphemes TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_word_library TO authenticated;
GRANT ALL ON public.user_word_library TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_study_sessions TO authenticated;
GRANT ALL ON public.user_study_sessions TO service_role;