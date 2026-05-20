
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS is_open_to_opportunities BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  from_user_id UUID NOT NULL,
  from_company TEXT,
  to_candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Candidates can view their messages"
ON public.messages FOR SELECT
USING (EXISTS (SELECT 1 FROM public.candidates c WHERE c.id = to_candidate_id AND c.user_id = auth.uid()));

CREATE POLICY "Candidates can mark their messages read"
ON public.messages FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.candidates c WHERE c.id = to_candidate_id AND c.user_id = auth.uid()));

CREATE POLICY "Companies can send messages"
ON public.messages FOR INSERT
WITH CHECK (auth.uid() = from_user_id AND EXISTS (SELECT 1 FROM public.companies co WHERE co.user_id = auth.uid()));

CREATE POLICY "Senders can view their sent messages"
ON public.messages FOR SELECT
USING (auth.uid() = from_user_id);

CREATE INDEX IF NOT EXISTS idx_messages_to_candidate ON public.messages(to_candidate_id);
