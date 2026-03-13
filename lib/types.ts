export type PlanType = "product-tech" | "legal" | "biz-dev";

export type TaskStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "blocked"
  | "not_applicable"
  | "critical";

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  start_date?: string | null;
  target_date?: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  name: string;
  storage_path: string;
  size: number | null;
  mime_type: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: Profile;
}

export interface Task {
  end_day: string | null;
  id: string;
  phase_id: string;
  wbs: string;
  name: string;
  owner: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: TaskStatus;
  remarks: string | null;
  deadline: string | null;
  assigned_to: string | null;
  assignee?: Profile;
  comment_count?: number;
  blocked_by: string[];
}

export interface Phase {
  id: string;
  plan_id: string;
  wbs: string;
  name: string;
  display_order: number;
  tasks: Task[];
}

export interface Plan {
  id: string;
  project_id: string;
  name: string;
  type: string;
  color: string;
  phases: Phase[];
}

export interface ProjectStats {
  total: number;
  completed: number;
  in_progress: number;
  blocked: number;
  critical: number;
  not_started: number;
  not_applicable: number;
}
