-- Создание таблицы user_profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  subjects TEXT[] NOT NULL,
  training_days INTEGER[] DEFAULT NULL,
  study_goal_weekday INTEGER DEFAULT NULL,
  study_goal_training INTEGER DEFAULT NULL,
  study_goal_weekend INTEGER DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создание таблицы activity_templates
CREATE TABLE IF NOT EXISTS public.activity_templates (
  id SERIAL PRIMARY KEY,
  subject_key TEXT NOT NULL,
  activity_key TEXT NOT NULL,
  description TEXT NOT NULL,
  default_duration FLOAT NOT NULL
);

-- Создание таблицы weeks
CREATE TABLE IF NOT EXISTS public.weeks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  user_profile_name TEXT REFERENCES public.user_profiles(name) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создание таблицы days
CREATE TABLE IF NOT EXISTS public.days (
  id SERIAL PRIMARY KEY,
  week_id INTEGER REFERENCES public.weeks(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  day_name TEXT NOT NULL,
  day_type TEXT NOT NULL,
  comment TEXT DEFAULT NULL,
  efficiency INTEGER DEFAULT NULL,
  usefulness INTEGER DEFAULT NULL,
  study_hours FLOAT DEFAULT NULL,
  user_profile_name TEXT REFERENCES public.user_profiles(name) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создание таблицы tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id SERIAL PRIMARY KEY,
  day_id INTEGER REFERENCES public.days(id) ON DELETE CASCADE,
  time_of_day TEXT NOT NULL,
  description TEXT NOT NULL,
  duration TEXT DEFAULT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  task_id TEXT DEFAULT NULL,
  score INTEGER DEFAULT NULL,
  is_exam BOOLEAN DEFAULT FALSE,
  activity_template_id INTEGER REFERENCES public.activity_templates(id) ON DELETE SET NULL,
  user_profile_name TEXT REFERENCES public.user_profiles(name) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создание таблицы todo_items
CREATE TABLE IF NOT EXISTS public.todo_items (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  user_profile_name TEXT REFERENCES public.user_profiles(name) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создание таблицы achievements
CREATE TABLE IF NOT EXISTS public.achievements (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  points INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создание таблицы user_achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id SERIAL PRIMARY KEY,
  achievement_id INTEGER REFERENCES public.achievements(id) ON DELETE CASCADE,
  user_profile_name TEXT REFERENCES public.user_profiles(name) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создание таблицы user_stats
CREATE TABLE IF NOT EXISTS public.user_stats (
  id SERIAL PRIMARY KEY,
  total_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_activity_date DATE DEFAULT NULL,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  user_profile_name TEXT REFERENCES public.user_profiles(name) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Настройка Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todo_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Создание политик доступа
-- Для таблицы user_profiles
CREATE POLICY "Allow public read access" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.user_profiles FOR UPDATE USING (true);

-- Для таблицы activity_templates
CREATE POLICY "Allow public read access" ON public.activity_templates FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.activity_templates FOR INSERT WITH CHECK (true);

-- Для таблицы weeks
CREATE POLICY "Allow public read access" ON public.weeks FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.weeks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.weeks FOR UPDATE USING (true);

-- Для таблицы days
CREATE POLICY "Allow public read access" ON public.days FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.days FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.days FOR UPDATE USING (true);

-- Для таблицы tasks
CREATE POLICY "Allow public read access" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.tasks FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.tasks FOR DELETE USING (true);

-- Для таблицы todo_items
CREATE POLICY "Allow public read access" ON public.todo_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.todo_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.todo_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.todo_items FOR DELETE USING (true);

-- Для таблицы achievements
CREATE POLICY "Allow public read access" ON public.achievements FOR SELECT USING (true);

-- Для таблицы user_achievements
CREATE POLICY "Allow public read access" ON public.user_achievements FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.user_achievements FOR INSERT WITH CHECK (true);

-- Для таблицы user_stats
CREATE POLICY "Allow public read access" ON public.user_stats FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.user_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.user_stats FOR UPDATE USING (true);
