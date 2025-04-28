-- Триггер для обновления статистики при изменении статуса задачи
CREATE OR REPLACE FUNCTION task_status_changed()
RETURNS TRIGGER AS $$
BEGIN
  -- Если изменился статус выполнения задачи
  IF OLD.is_completed IS DISTINCT FROM NEW.is_completed THEN
    -- Вызываем функцию обновления статистики
    PERFORM update_user_stats(NEW.user_profile_name, NEW.is_completed);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер для таблицы tasks
DROP TRIGGER IF EXISTS task_status_update ON public.tasks;
CREATE TRIGGER task_status_update
AFTER UPDATE OF is_completed ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION task_status_changed();

-- Триггер для обновления статистики при изменении статуса todo_item
CREATE OR REPLACE FUNCTION todo_status_changed()
RETURNS TRIGGER AS $$
BEGIN
  -- Если изменился статус выполнения задачи
  IF OLD.is_completed IS DISTINCT FROM NEW.is_completed THEN
    -- Вызываем функцию обновления статистики
    PERFORM update_user_stats(NEW.user_profile_name, NEW.is_completed);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер для таблицы todo_items
DROP TRIGGER IF EXISTS todo_status_update ON public.todo_items;
CREATE TRIGGER todo_status_update
AFTER UPDATE OF is_completed ON public.todo_items
FOR EACH ROW
EXECUTE FUNCTION todo_status_changed();
