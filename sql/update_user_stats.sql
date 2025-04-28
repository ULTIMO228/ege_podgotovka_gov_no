CREATE OR REPLACE FUNCTION update_user_stats(profile_name TEXT, task_completed BOOLEAN)
RETURNS VOID AS $$
DECLARE
  stats RECORD;
  today DATE := CURRENT_DATE;
  yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
BEGIN
  -- Получаем текущую статистику пользователя
  SELECT * INTO stats FROM public.user_stats WHERE user_profile_name = profile_name LIMIT 1;
  
  -- Если статистика не найдена, создаем начальную
  IF stats IS NULL THEN
    INSERT INTO public.user_stats (
      total_tasks, 
      completed_tasks, 
      streak_days, 
      points, 
      level, 
      last_activity_date, 
      user_profile_name
    ) VALUES (
      0, 
      0, 
      0, 
      0, 
      1, 
      today, 
      profile_name
    ) RETURNING * INTO stats;
  END IF;
  
  -- Обновляем статистику в зависимости от того, выполнена задача или снята с выполнения
  IF task_completed THEN
    -- Задача выполнена
    -- Увеличиваем количество выполненных задач и очки
    UPDATE public.user_stats 
    SET 
      completed_tasks = completed_tasks + 1,
      points = points + 5
    WHERE user_profile_name = profile_name;
    
    -- Обновляем серию дней, если это новый день
    IF stats.last_activity_date IS DISTINCT FROM today THEN
      IF stats.last_activity_date = yesterday THEN
        -- Последовательный день
        UPDATE public.user_stats 
        SET 
          streak_days = streak_days + 1,
          last_activity_date = today
        WHERE user_profile_name = profile_name;
        
        -- Проверяем, нужно ли добавить бонусные очки за серию
        IF (stats.streak_days + 1) % 3 = 0 THEN
          -- Бонус каждые 3 дня
          UPDATE public.user_stats 
          SET points = points + 15
          WHERE user_profile_name = profile_name;
        END IF;
      ELSE
        -- Серия прервана
        UPDATE public.user_stats 
        SET 
          streak_days = 1,
          last_activity_date = today
        WHERE user_profile_name = profile_name;
      END IF;
    END IF;
  ELSE
    -- Задача снята с выполнения
    UPDATE public.user_stats 
    SET 
      completed_tasks = GREATEST(0, completed_tasks - 1),
      points = GREATEST(0, points - 5)
    WHERE user_profile_name = profile_name;
  END IF;
  
  -- Обновляем уровень пользователя на основе очков
  UPDATE public.user_stats 
  SET level = GREATEST(1, FLOOR(points / 100) + 1)
  WHERE user_profile_name = profile_name;
  
  -- Проверяем и разблокируем достижения
  PERFORM check_and_unlock_achievements(profile_name);
END;
$$ LANGUAGE plpgsql;
