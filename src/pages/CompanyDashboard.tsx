import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import { Code2, Lightbulb, Search, Loader2, MapPin, Users, Plus, Github, FileText, Mail, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface VerifiedExpert {
  id: string;
  full_name: string | null;
  title: string | null;
  location: string | null;
  github_username: string | null;
  avatar_url: string | null;
  email: string | null;
  audit: {
    overall_score: number | null;
    logic_score: number | null;
    code_quality_score: number | null;
    gpt_summary: string | null;
  } | null;
}

interface Job {
  id: string;
  job_title: string | null;
  company_name: string | null;
  min_findem_score: number | null;
}

const getScoreColor = (score: number | null | undefined) => {
  if (!score) return "bg-muted text-muted-foreground";
  if (score >= 80) return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (score >= 60) return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  return "bg-red-500/15 text-red-400 border-red-500/30";
};

const PostJobDialog = ({ onPosted }: { onPosted: () => void }) => {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    company_name: "",
    job_title: "",
    salary_min: "",
    salary_max: "",
    min_findem_score: "70",
    description: "",
    apply_url: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Sign in required", variant: "destructive" });
      setSubmitting(false);
      return;
    }
    const { error } = await supabase.from("jobs").insert({
      user_id: user.id,
      company_name: form.company_name,
      job_title: form.job_title,
      salary_min: form.salary_min ? parseInt(form.salary_min) : null,
      salary_max: form.salary_max ? parseInt(form.salary_max) : null,
      min_findem_score: form.min_findem_score ? parseInt(form.min_findem_score) : null,
      description: form.description,
      apply_url: form.apply_url,
      is_active: true,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Could not post job", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Job posted", description: "Matched candidates will appear below." });
    setOpen(false);
    setForm({ company_name: form.company_name, job_title: "", salary_min: "", salary_max: "", min_findem_score: "70", description: "", apply_url: "" });
    onPosted();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="w-4 h-4" /> Post a Job</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Post a Job</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Company name</Label><Input required value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} /></div>
            <div><Label>Job title</Label><Input required value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Salary min</Label><Input type="number" value={form.salary_min} onChange={(e) => setForm({ ...form, salary_min: e.target.value })} /></div>
            <div><Label>Salary max</Label><Input type="number" value={form.salary_max} onChange={(e) => setForm({ ...form, salary_max: e.target.value })} /></div>
            <div><Label>Min score</Label><Input required type="number" min="0" max="100" value={form.min_findem_score} onChange={(e) => setForm({ ...form, min_findem_score: e.target.value })} /></div>
          </div>
          <div><Label>Apply URL</Label><Input type="url" value={form.apply_url} onChange={(e) => setForm({ ...form, apply_url: e.target.value })} /></div>
          <div><Label>Description</Label><Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <DialogFooter>
            <Button type="submit" disabled={submitting}>{submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post Job"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const CompanyDashboard = () => {
  const [search, setSearch] = useState("");
  const [experts, setExperts] = useState<VerifiedExpert[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [invited, setInvited] = useState<Set<string>>(new Set());

  const fetchJobs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("jobs")
      .select("id, job_title, company_name, min_findem_score")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    setJobs(data || []);
  };

  const fetchExperts = async () => {
    const { data: candidates } = await supabase
      .from("candidates")
      .select("id, full_name, title, location, github_username, avatar_url, email")
      .eq("status", "verified");

    if (!candidates || candidates.length === 0) {
      setExperts([]);
      return;
    }

    const enriched: VerifiedExpert[] = await Promise.all(
      candidates.map(async (c) => {
        const { data: audit } = await supabase
          .from("audit_results")
          .select("overall_score, logic_score, code_quality_score, gpt_summary")
          .eq("candidate_id", c.id)
          .eq("audit_status", "complete")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        return { ...c, audit };
      })
    );

    enriched.sort((a, b) => (b.audit?.overall_score ?? 0) - (a.audit?.overall_score ?? 0));
    setExperts(enriched);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchJobs(), fetchExperts()]);
      setLoading(false);
    })();
  }, []);

  const minScoreThreshold = jobs.length > 0
    ? Math.min(...jobs.map((j) => j.min_findem_score ?? 100))
    : null;

  const matched = minScoreThreshold !== null
    ? experts.filter((e) => (e.audit?.overall_score ?? 0) >= minScoreThreshold)
    : [];

  const handleInvite = (expert: VerifiedExpert) => {
    setInvited((s) => new Set(s).add(expert.id));
    toast({
      title: "Interview invite sent",
      description: `${expert.full_name || "Candidate"} has been notified${expert.email ? ` at ${expert.email}` : ""}.`,
    });
  };

  const filtered = experts.filter(
    (e) =>
      (e.full_name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (e.title?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (e.location?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-14">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-bold mb-2">Company Dashboard</h1>
              <p className="text-muted-foreground">Post jobs and discover verified talent.</p>
            </div>
            <PostJobDialog onPosted={fetchJobs} />
          </div>

          {/* Matched Candidates */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Matched Candidates</h2>
                {minScoreThreshold !== null && (
                  <Badge variant="outline" className="text-xs">Score ≥ {minScoreThreshold}</Badge>
                )}
              </div>
              <span className="text-sm text-muted-foreground">{matched.length} match{matched.length === 1 ? "" : "es"}</span>
            </div>

            {jobs.length === 0 ? (
              <div className="text-center py-12 surface-elevated rounded-xl">
                <Briefcase className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium mb-1">No jobs posted yet.</p>
                <p className="text-sm text-muted-foreground">Post a job to auto-match candidates by score.</p>
              </div>
            ) : matched.length === 0 ? (
              <div className="text-center py-12 surface-elevated rounded-xl">
                <p className="text-sm text-muted-foreground">No candidates meet your score threshold yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {matched.map((c) => (
                  <div key={c.id} className="surface-elevated p-4 flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                        {c.full_name?.split(" ").map((n) => n[0]).join("") || "?"}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{c.full_name || "Unknown"}</div>
                        <div className="text-xs text-muted-foreground truncate">{c.title || "Engineer"}</div>
                      </div>
                    </div>
                    <div className={`text-center px-3 py-1.5 rounded-lg border ${getScoreColor(c.audit?.overall_score)}`}>
                      <div className="text-lg font-bold font-mono leading-none">{c.audit?.overall_score ?? "—"}</div>
                      <div className="text-[9px] uppercase tracking-wider opacity-80 mt-0.5">Score</div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {c.github_username && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={`https://github.com/${c.github_username}`} target="_blank" rel="noreferrer">
                            <Github className="w-4 h-4" /> GitHub
                          </a>
                        </Button>
                      )}
                      <Button size="sm" variant="outline" asChild>
                        <Link to="/report"><FileText className="w-4 h-4" /> Report</Link>
                      </Button>
                      <Button size="sm" disabled={invited.has(c.id)} onClick={() => handleInvite(c)}>
                        <Mail className="w-4 h-4" /> {invited.has(c.id) ? "Invited" : "Invite to Interview"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* All Verified Experts */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold">Verified Experts</h2>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, role, or location..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 && search === "" ? (
            <div className="text-center py-20 surface-elevated rounded-xl">
              <Users className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-1">No verified experts yet.</p>
              <p className="text-sm text-muted-foreground">Check back soon.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No results for "{search}"</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((expert) => (
                <div key={expert.id} className="surface-elevated p-6 hover:border-primary/20 transition-all duration-300 group">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    <div className="flex items-center gap-4 lg:w-56 shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                        {expert.full_name?.split(" ").map(n => n[0]).join("") || "?"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold truncate">{expert.full_name || "Unknown"}</span>
                          <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 shrink-0">
                            Verified
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{expert.title || "Engineer"}</p>
                        {expert.location && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {expert.location}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 flex-1">
                      <Badge variant="outline" className="text-xs gap-1.5 px-2.5 py-1">
                        <Lightbulb className="w-3 h-3" /> Logic: {expert.audit?.logic_score ?? "—"}
                      </Badge>
                      <Badge variant="outline" className="text-xs gap-1.5 px-2.5 py-1">
                        <Code2 className="w-3 h-3" /> Code Quality: {expert.audit?.code_quality_score ?? "—"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 lg:w-44 shrink-0 justify-end">
                      <div className={`text-center px-4 py-2 rounded-lg border ${getScoreColor(expert.audit?.overall_score)}`}>
                        <div className="text-2xl font-bold font-mono">{expert.audit?.overall_score ?? "—"}</div>
                        <div className="text-[10px] uppercase tracking-wider opacity-80">Overall</div>
                      </div>
                      <Button size="sm" variant="outline" asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to="/report">View Profile</Link>
                      </Button>
                    </div>
                  </div>

                  {expert.audit?.gpt_summary && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground line-clamp-2">{expert.audit.gpt_summary}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CompanyDashboard;
