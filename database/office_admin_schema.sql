-- ==============================================================================================
-- NEXUSTECH HUB - OFFICE ADMINISTRATION SCHEMA
-- ==============================================================================================
-- This script creates the required tables and RLS policies for the new Office Admin portal.

-- 1. Extend existing `profiles` table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS department_id UUID,
  ADD COLUMN IF NOT EXISTS job_title TEXT,
  ADD COLUMN IF NOT EXISTS office_extension TEXT,
  ADD COLUMN IF NOT EXISTS attendance_status TEXT DEFAULT 'Present',
  ADD COLUMN IF NOT EXISTS employment_status TEXT DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS hire_date DATE,
  ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES auth.users(id);

-- 2. Create `office_departments`
CREATE TABLE IF NOT EXISTS public.office_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  manager_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Pre-seed departments
INSERT INTO public.office_departments (name) VALUES 
  ('Administration'), ('Finance'), ('ICT'), ('Human Resources'), 
  ('Marketing'), ('Sales'), ('Customer Support'), ('Operations')
ON CONFLICT (name) DO NOTHING;

-- Map foreign key for profiles now that departments exist
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS fk_department_id;
ALTER TABLE public.profiles
  ADD CONSTRAINT fk_department_id FOREIGN KEY (department_id) REFERENCES public.office_departments(id) ON DELETE SET NULL;

-- 3. Create `office_tasks`
CREATE TABLE IF NOT EXISTS public.office_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Cancelled')),
  due_date TIMESTAMPTZ,
  assigned_to UUID REFERENCES auth.users(id),
  assigned_by UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  completed_at TIMESTAMPTZ,
  attachments JSONB DEFAULT '[]'::jsonb,
  comments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create `office_messages`
CREATE TABLE IF NOT EXISTS public.office_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id),
  receiver_id UUID REFERENCES auth.users(id),
  department_id UUID REFERENCES public.office_departments(id),
  subject TEXT,
  body TEXT NOT NULL,
  message_type TEXT DEFAULT 'direct' CHECK (message_type IN ('direct', 'department', 'broadcast')),
  read_status BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create `office_announcements`
CREATE TABLE IF NOT EXISTS public.office_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'Normal' CHECK (priority IN ('High', 'Normal', 'Low')),
  start_date TIMESTAMPTZ DEFAULT now(),
  expiry_date TIMESTAMPTZ,
  visible_to TEXT DEFAULT 'All', -- Could be role, department ID, or 'All'
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Create `office_support_requests`
CREATE TABLE IF NOT EXISTS public.office_support_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed')),
  assigned_staff UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- 7. Create `office_visitors`
CREATE TABLE IF NOT EXISTS public.office_visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  purpose TEXT,
  date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Arrived', 'Departed', 'Cancelled')),
  assigned_staff UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- 8. Create `office_calls`
CREATE TABLE IF NOT EXISTS public.office_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_name TEXT NOT NULL,
  subject TEXT,
  date TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'New' CHECK (status IN ('New', 'Returned', 'Resolved')),
  assigned_staff UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- 9. Create `office_emails`
CREATE TABLE IF NOT EXISTS public.office_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender TEXT NOT NULL,
  subject TEXT,
  date TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'New' CHECK (status IN ('New', 'Read', 'Replied', 'Archived')),
  assigned_staff UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- 10. Create `office_documents`
CREATE TABLE IF NOT EXISTS public.office_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT,
  version TEXT DEFAULT '1.0',
  tags JSONB DEFAULT '[]'::jsonb,
  visibility TEXT DEFAULT 'Internal' CHECK (visibility IN ('Internal', 'Confidential', 'Public')),
  department UUID REFERENCES public.office_departments(id),
  file_size BIGINT,
  mime_type TEXT,
  file_path TEXT NOT NULL,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Archived')),
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Create `office_supplies`
CREATE TABLE IF NOT EXISTS public.office_supplies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name TEXT NOT NULL,
  current_stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  unit TEXT DEFAULT 'pcs',
  location TEXT,
  last_restocked TIMESTAMPTZ,
  reorder_quantity INTEGER DEFAULT 10,
  status TEXT DEFAULT 'In Stock' CHECK (status IN ('In Stock', 'Low Stock', 'Out of Stock')),
  supplier TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- 12. Create `office_meetings`
CREATE TABLE IF NOT EXISTS public.office_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location TEXT,
  status TEXT DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Ongoing', 'Completed', 'Cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- 13. Create `office_meeting_participants`
CREATE TABLE IF NOT EXISTS public.office_meeting_participants (
  meeting_id UUID REFERENCES public.office_meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Declined', 'Tentative')),
  PRIMARY KEY (meeting_id, user_id)
);

-- 14. Create `office_activity_logs`
CREATE TABLE IF NOT EXISTS public.office_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  timestamp TIMESTAMPTZ DEFAULT now(),
  ip_address TEXT,
  device_info TEXT
);

-- ==============================================================================================
-- RLS POLICIES (Simplified for Admin usage)
-- ==============================================================================================

-- Enable RLS on all tables
ALTER TABLE public.office_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_supplies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_activity_logs ENABLE ROW LEVEL SECURITY;

-- We allow all authenticated users in the ERP to have full access for this demonstration.
CREATE POLICY "Enable all access for authenticated users" ON public.office_departments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for authenticated users" ON public.office_tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for authenticated users" ON public.office_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for authenticated users" ON public.office_announcements FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for authenticated users" ON public.office_support_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for authenticated users" ON public.office_visitors FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for authenticated users" ON public.office_calls FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for authenticated users" ON public.office_emails FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for authenticated users" ON public.office_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for authenticated users" ON public.office_supplies FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for authenticated users" ON public.office_meetings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for authenticated users" ON public.office_meeting_participants FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for authenticated users" ON public.office_activity_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('office_documents', 'office_documents', false) ON CONFLICT DO NOTHING;
CREATE POLICY "Authenticated users can upload office documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'office_documents');
CREATE POLICY "Authenticated users can view office documents" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'office_documents');
CREATE POLICY "Authenticated users can delete office documents" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'office_documents');
CREATE POLICY "Authenticated users can update office documents" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'office_documents');

-- ==============================================================================================
-- TRIGGERS FOR UPDATED_AT
-- ==============================================================================================

CREATE OR REPLACE FUNCTION update_office_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_office_departments_modtime BEFORE UPDATE ON public.office_departments FOR EACH ROW EXECUTE PROCEDURE update_office_updated_at_column();
CREATE TRIGGER update_office_tasks_modtime BEFORE UPDATE ON public.office_tasks FOR EACH ROW EXECUTE PROCEDURE update_office_updated_at_column();
CREATE TRIGGER update_office_messages_modtime BEFORE UPDATE ON public.office_messages FOR EACH ROW EXECUTE PROCEDURE update_office_updated_at_column();
CREATE TRIGGER update_office_announcements_modtime BEFORE UPDATE ON public.office_announcements FOR EACH ROW EXECUTE PROCEDURE update_office_updated_at_column();
CREATE TRIGGER update_office_support_requests_modtime BEFORE UPDATE ON public.office_support_requests FOR EACH ROW EXECUTE PROCEDURE update_office_updated_at_column();
CREATE TRIGGER update_office_visitors_modtime BEFORE UPDATE ON public.office_visitors FOR EACH ROW EXECUTE PROCEDURE update_office_updated_at_column();
CREATE TRIGGER update_office_calls_modtime BEFORE UPDATE ON public.office_calls FOR EACH ROW EXECUTE PROCEDURE update_office_updated_at_column();
CREATE TRIGGER update_office_emails_modtime BEFORE UPDATE ON public.office_emails FOR EACH ROW EXECUTE PROCEDURE update_office_updated_at_column();
CREATE TRIGGER update_office_documents_modtime BEFORE UPDATE ON public.office_documents FOR EACH ROW EXECUTE PROCEDURE update_office_updated_at_column();
CREATE TRIGGER update_office_supplies_modtime BEFORE UPDATE ON public.office_supplies FOR EACH ROW EXECUTE PROCEDURE update_office_updated_at_column();
CREATE TRIGGER update_office_meetings_modtime BEFORE UPDATE ON public.office_meetings FOR EACH ROW EXECUTE PROCEDURE update_office_updated_at_column();
