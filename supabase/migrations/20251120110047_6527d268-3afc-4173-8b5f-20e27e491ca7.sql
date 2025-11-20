-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE app_role AS ENUM ('student', 'trainer', 'staff', 'branch_admin', 'main_admin');
CREATE TYPE student_type AS ENUM ('brocamp', 'exclusive', 'none');
CREATE TYPE complaint_status AS ENUM ('logged', 'in_process', 'fixed', 'cancelled', 'rejected');
CREATE TYPE complaint_category AS ENUM (
  'facility_campus',
  'trainer_related',
  'personal_institute',
  'content_quality',
  'platform_issue',
  'payment_membership',
  'support_communication',
  'safety_wellbeing'
);
CREATE TYPE conversation_type AS ENUM ('main_to_branch', 'branch_to_staff_group', 'branch_to_staff_direct');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role app_role NOT NULL DEFAULT 'student',
  student_type student_type NOT NULL DEFAULT 'none',
  branch TEXT,
  program TEXT,
  credits INTEGER NOT NULL DEFAULT 0,
  negative_count_lifetime INTEGER NOT NULL DEFAULT 0,
  banned_from_raise BOOLEAN NOT NULL DEFAULT false,
  high_alert BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create complaints table
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category complaint_category NOT NULL,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_type student_type NOT NULL,
  branch TEXT NOT NULL,
  program TEXT,
  status complaint_status NOT NULL DEFAULT 'logged',
  assigned_staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_trainer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  anonymous BOOLEAN NOT NULL DEFAULT true,
  identity_revealed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create complaint_reviews table
CREATE TABLE public.complaint_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewer_role TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating IN (-1, 0, 1)),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create credit_awards table (to prevent double-awarding)
CREATE TABLE public.credit_awards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  awarded BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(complaint_id, role)
);

-- Create negative_events table
CREATE TABLE public.negative_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversations table
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  type conversation_type NOT NULL,
  branch TEXT,
  started_by_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_closed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  closed_at TIMESTAMP WITH TIME ZONE
);

-- Create conversation_messages table
CREATE TABLE public.conversation_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  data JSONB,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.negative_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Complaints RLS policies
CREATE POLICY "Students can view their own complaints" ON public.complaints 
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Staff can view complaints in their branch" ON public.complaints 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND (role IN ('staff', 'branch_admin') AND branch = complaints.branch)
    )
  );

CREATE POLICY "Trainers can view trainer-related complaints in their branch" ON public.complaints 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'trainer' 
      AND branch = complaints.branch
      AND complaints.category = 'trainer_related'
    )
  );

CREATE POLICY "Main admin can view all complaints" ON public.complaints 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'main_admin'
    )
  );

CREATE POLICY "Students can insert their own complaints" ON public.complaints 
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Staff can update complaints in their branch" ON public.complaints 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('staff', 'branch_admin', 'main_admin')
    )
  );

-- Complaint reviews RLS
CREATE POLICY "Anyone can view reviews" ON public.complaint_reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert their own reviews" ON public.complaint_reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Notifications RLS
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Conversations RLS
CREATE POLICY "Users can view conversations they're part of" ON public.conversations 
  FOR SELECT USING (
    auth.uid() = started_by_id OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND (
        -- Main admin in main_to_branch conversations
        (conversations.type = 'main_to_branch' AND p.role = 'main_admin') OR
        -- Branch admin in any conversation for their branch
        (p.role = 'branch_admin' AND p.branch = conversations.branch) OR
        -- Staff in staff conversations for their branch
        (p.role = 'staff' AND p.branch = conversations.branch AND conversations.type IN ('branch_to_staff_group', 'branch_to_staff_direct'))
      )
    )
  );

CREATE POLICY "Admins can insert conversations" ON public.conversations 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('main_admin', 'branch_admin')
    )
  );

CREATE POLICY "Admins can update conversations" ON public.conversations 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('main_admin', 'branch_admin')
    )
  );

-- Conversation messages RLS
CREATE POLICY "Users can view messages in their conversations" ON public.conversation_messages 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_messages.conversation_id
      AND (
        c.started_by_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid()
          AND (
            (c.type = 'main_to_branch' AND p.role IN ('main_admin', 'branch_admin')) OR
            (c.type IN ('branch_to_staff_group', 'branch_to_staff_direct') AND p.role IN ('branch_admin', 'staff') AND p.branch = c.branch)
          )
        )
      )
    )
  );

CREATE POLICY "Users can insert messages in their conversations" ON public.conversation_messages 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_messages.conversation_id
      AND NOT c.is_closed
      AND (
        c.started_by_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid()
          AND (
            (c.type = 'main_to_branch' AND p.role IN ('main_admin', 'branch_admin')) OR
            (c.type IN ('branch_to_staff_group', 'branch_to_staff_direct') AND p.role IN ('branch_admin', 'staff') AND p.branch = c.branch)
          )
        )
      )
    )
  );

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, student_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'student'),
    COALESCE((NEW.raw_user_meta_data->>'student_type')::student_type, 'none')
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger for complaints updated_at
CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_complaints_student_id ON public.complaints(student_id);
CREATE INDEX idx_complaints_status ON public.complaints(status);
CREATE INDEX idx_complaints_branch ON public.complaints(branch);
CREATE INDEX idx_complaints_category ON public.complaints(category);
CREATE INDEX idx_notifications_user_id_read ON public.notifications(user_id, read);
CREATE INDEX idx_conversations_complaint_id ON public.conversations(complaint_id);
CREATE INDEX idx_conversation_messages_conversation_id ON public.conversation_messages(conversation_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_branch ON public.profiles(branch);