CREATE OR REPLACE FUNCTION public.create_user_profiles_table()
RETURNS void AS $$
BEGIN
  -- Проверяем, существует ли таблица user_profiles
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'user_profiles'
  ) THEN
    -- Создаем таблицу user_profiles
    CREATE TABLE public.user_profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL UNIQUE,
      subjects TEXT[] NOT NULL,
      training_days INTEGER[] DEFAULT NULL,
      study_goal_weekday INTEGER DEFAULT NULL,
      study_goal_training INTEGER DEFAULT NULL,
      study_goal_weekend INTEGER DEFAULT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  END IF;

  -- Включаем RLS (даже если таблица уже существует)
  ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

  -- Удаляем существующие политики (если есть)
  DROP POLICY IF EXISTS "Allow public read access" ON public.user_profiles;
  DROP POLICY IF EXISTS "Allow public insert access" ON public.user_profiles;
  DROP POLICY IF EXISTS "Allow public update access" ON public.user_profiles;

  -- Создаем политики доступа
  CREATE POLICY "Allow public read access" ON public.user_profiles
    FOR SELECT USING (true);

  CREATE POLICY "Allow public insert access" ON public.user_profiles
    FOR INSERT WITH CHECK (true);

  CREATE POLICY "Allow public update access" ON public.user_profiles
    FOR UPDATE USING (true);
END;
$$ LANGUAGE plpgsql;
