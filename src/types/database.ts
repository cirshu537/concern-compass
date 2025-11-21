export type AppRole = 'student' | 'trainer' | 'staff' | 'branch_admin' | 'main_admin';
export type StudentType = 'brocamp' | 'exclusive' | 'none';
export type ComplaintStatus = 'logged' | 'in_process' | 'fixed' | 'cancelled' | 'rejected';
export type ComplaintCategory = 
  | 'facility_campus'
  | 'trainer_related'
  | 'personal_institute'
  | 'content_quality'
  | 'platform_issue'
  | 'payment_membership'
  | 'support_communication'
  | 'safety_wellbeing';
export type ConversationType = 'main_to_branch' | 'branch_to_staff_group' | 'branch_to_staff_direct';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: AppRole;
  student_type: StudentType;
  branch: string | null;
  program: string | null;
  credits: number;
  negative_count_lifetime: number;
  banned_from_raise: boolean;
  high_alert: boolean;
  handles_exclusive: boolean;
  created_at: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  student_id: string;
  student_type: StudentType;
  branch: string;
  program: string | null;
  status: ComplaintStatus;
  assigned_staff_id: string | null;
  assigned_trainer_id: string | null;
  anonymous: boolean;
  identity_revealed: boolean;
  attachment_url: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface ComplaintReview {
  id: string;
  complaint_id: string;
  reviewer_id: string;
  reviewer_role: string;
  rating: -1 | 0 | 1;
  comment: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  complaint_id: string;
  type: ConversationType;
  branch: string | null;
  started_by_id: string;
  is_closed: boolean;
  created_at: string;
  closed_at: string | null;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  text: string;
  data: any;
  read: boolean;
  created_at: string;
}