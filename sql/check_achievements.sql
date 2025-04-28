CREATE OR REPLACE FUNCTION check_and_unlock_achievements(profile_name TEXT)
RETURNS VOID AS $$
DECLARE
  stats RECORD;
  achievement RECORD;
  already_unlocked BOOLEAN;
BEGIN
  -- Получаем статистику пользователя
  SELECT * INTO stats FROM public.user_stats WHERE user_profile_name = profile_name LIMIT 1;
  
  -- Если статистика не найдена, выходим
  IF stats IS NULL THEN
    RETURN;
  END IF;
  
  -- Проверяем каждое достижение
  FOR achievement IN SELECT * FROM public.achievements LOOP
    -- Проверяем, разблокировано ли уже достижение
    SELECT EXISTS(
      SELECT 1 FROM public.user_achievements 
      WHERE achievement_id = achievement.id AND user_profile_name = profile_name
    ) INTO already_unlocked;
    
    -- Если достижение уже разблокировано, пропускаем его
    IF already_unlocked THEN
      CONTINUE;
    END IF;
    
    -- Проверяем условия для разблокировки достижения
    CASE achievement.name
      WHEN 'First Task' THEN
        IF stats.completed_tasks >= 1 THEN
          -- Разблокируем достижение
          INSERT INTO public.user_achievements (achievement_id, user_profile_name)
          VALUES (achievement.id, profile_name);
          
          -- Добавляем очки
          UPDATE public.user_stats 
          SET points = points + achievement.points 
          WHERE user_profile_name = profile_name;
        END IF;
      
      WHEN 'Task Master' THEN
        IF stats.completed_tasks >= 10 THEN
          INSERT INTO public.user_achievements (achievement_id, user_profile_name)
          VALUES (achievement.id, profile_name);
          
          UPDATE public.user_stats 
          SET points = points + achievement.points 
          WHERE user_profile_name = profile_name;
        END IF;
      
      WHEN '3-Day Streak' THEN
        IF stats.streak_days >= 3 THEN
          INSERT INTO public.user_achievements (achievement_id, user_profile_name)
          VALUES (achievement.id, profile_name);
          
          UPDATE public.user_stats 
          SET points = points + achievement.points 
          WHERE user_profile_name = profile_name;
        END IF;
      
      WHEN 'Week Warrior' THEN
        IF stats.streak_days >= 7 THEN
          INSERT INTO public.user_achievements (achievement_id, user_profile_name)
          VALUES (achievement.id, profile_name);
          
          UPDATE public.user_stats 
          SET points = points + achievement.points 
          WHERE user_profile_name = profile_name;
        END IF;
      
      WHEN 'Point Collector' THEN
        IF stats.points >= 100 THEN
          INSERT INTO public.user_achievements (achievement_id, user_profile_name)
          VALUES (achievement.id, profile_name);
          
          UPDATE public.user_stats 
          SET points = points + achievement.points 
          WHERE user_profile_name = profile_name;
        END IF;
      
      WHEN 'EGE Champion' THEN
        IF stats.level >= 5 THEN
          INSERT INTO public.user_achievements (achievement_id, user_profile_name)
          VALUES (achievement.id, profile_name);
          
          UPDATE public.user_stats 
          SET points = points + achievement.points 
          WHERE user_profile_name = profile_name;
        END IF;
      
      ELSE
        -- Для неизвестных достижений ничего не делаем
        NULL;
    END CASE;
  END LOOP;
  
  -- Обновляем уровень пользователя на основе очков
  UPDATE public.user_stats 
  SET level = GREATEST(1, FLOOR(points / 100) + 1)
  WHERE user_profile_name = profile_name;
END;
$$ LANGUAGE plpgsql;
