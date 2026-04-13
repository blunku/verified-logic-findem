
-- Create candidates table
CREATE TABLE public.candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  github_username TEXT,
  github_url TEXT,
  avatar_url TEXT,
  title TEXT,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'unverified',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Candidates can view own profile" ON public.candidates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Candidates can insert own profile" ON public.candidates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Candidates can update own profile" ON public.candidates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view verified candidates" ON public.candidates FOR SELECT USING (status = 'verified');

-- Create audit_results table
CREATE TABLE public.audit_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  logic_score INTEGER,
  problem_solving_score INTEGER,
  code_quality_score INTEGER,
  communication_score INTEGER,
  overall_score INTEGER,
  gpt_summary TEXT,
  audit_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Candidates can view own audits" ON public.audit_results FOR SELECT USING (
  candidate_id IN (SELECT id FROM public.candidates WHERE user_id = auth.uid())
);
CREATE POLICY "Candidates can insert own audits" ON public.audit_results FOR INSERT WITH CHECK (
  candidate_id IN (SELECT id FROM public.candidates WHERE user_id = auth.uid())
);
CREATE POLICY "Anyone can view audits of verified candidates" ON public.audit_results FOR SELECT USING (
  candidate_id IN (SELECT id FROM public.candidates WHERE status = 'verified')
);

-- Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  company_name TEXT,
  email TEXT,
  industry TEXT,
  logo_url TEXT,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies can view own profile" ON public.companies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Companies can insert own profile" ON public.companies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Companies can update own profile" ON public.companies FOR UPDATE USING (auth.uid() = user_id);

-- Timestamp update function and triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON public.candidates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_audit_results_updated_at BEFORE UPDATE ON public.audit_results FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create candidate profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.candidates (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
