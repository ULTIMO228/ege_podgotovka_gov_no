export type Week = {
  id: number
  title: string
  start_date: string
  end_date: string
  created_at: string
  user_profile_name: string
}

export type Day = {
  id: number
  week_id: number
  date: string
  day_name: string
  day_type: "weekend" | "weekday" | "training" | "exam"
  comment?: string
  efficiency?: number
  usefulness?: number
  study_hours?: number
  created_at: string
  user_profile_name: string
}

export type Task = {
  id: number
  day_id: number
  time_of_day: "morning" | "afternoon"
  description: string
  duration: string | null
  is_completed: boolean
  task_id: string
  score?: number
  is_exam: boolean
  created_at: string
  user_profile_name: string
  activity_template_id?: number
}

export type TodoItem = {
  id: number
  text: string
  is_completed: boolean
  created_at: string
  user_id: string | null
  user_profile_name: string
}

export type UserStats = {
  id: number
  user_id: string | null
  total_tasks: number
  completed_tasks: number
  streak_days: number
  last_activity_date: string | null
  points: number
  level: number
  created_at: string
  updated_at: string
  user_profile_name: string
}

export type Achievement = {
  id: number
  name: string
  description: string
  icon_name: string
  points: number
  created_at: string
}

export type UserAchievement = {
  id: number
  user_id: string | null
  achievement_id: number
  unlocked_at: string
  user_profile_name: string
}

// Новые типы
export type UserProfile = {
  id: number
  name: string
  subjects: string[]
  training_days: number[] | null
  study_goal_weekday?: number | null
  study_goal_training?: number | null
  study_goal_weekend?: number | null
  created_at: string
}

export type ActivityTemplate = {
  id: number
  subject_key: string
  activity_key: string
  description: string
  default_duration: number | null
}
