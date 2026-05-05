import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MapPin,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Building2,
  DollarSign,
  Filter,
  Plus,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Job = {
  id: string;
  company_name: string | null;
  job_title: string | null;
  salary_min: number | null;
  salary_max: number | null;
  min_findem_score: number | null;
  description: string | null;
  apply_url: string | null;
  created_at: string;
};

const ROLES = ["All", "Engineering", "AI/ML", "Data", "Infrastructure"];

const Jobs = () => {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("All");
  const [minScore, setMinScore] = useState([0]);
  const [salaryRange, setSalaryRange] = useState([0, 500]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCompany, setIsCompany] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadJobs();
    checkCompany();
  }, []);

  const checkCompany = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("companies").select("id").eq("user_id", user.id).maybeSingle();
    setIsCompany(!!data);
  };

  const loadJobs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load jobs");
    setJobs(data || []);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      const t = (j.job_title || "").toLowerCase();
      const c = (j.company_name || "").toLowerCase();
      if (search && !t.includes(search.toLowerCase()) && !c.includes(search.toLowerCase())) return false;
      if ((j.min_findem_score ?? 0) < minScore[0]) return false;
      if ((j.salary_max ?? 0) < salaryRange[0] * 1000 || (j.salary_min ?? 0) > salaryRange[1] * 1000) return false;
      return true;
    });
  }, [jobs, search, minScore, salaryRange]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-20 max-w-7xl mx-auto px-6">
        {/* Early Access banner */}
        <div className="mb-4 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Early Access — Real jobs are rolling in.
              </p>
              <p className="text-xs text-muted-foreground">
                Get verified now to be first in line.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10">
            <Link to="/candidate">
              Get Verified <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {/* Company submit form */}
        {isCompany && (
          <div className="mb-6">
            {!showForm ? (
              <Button onClick={() => setShowForm(true)} variant="hero">
                <Plus className="h-4 w-4" /> Submit a Job
              </Button>
            ) : (
              <SubmitJobForm
                onCancel={() => setShowForm(false)}
                onSubmitted={() => {
                  setShowForm(false);
                  loadJobs();
                }}
              />
            )}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Explore Opportunities
          </h1>
          <p className="mt-2 text-muted-foreground">
            Curated roles from companies hiring verified engineers.
          </p>

          <div className="mt-6 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by role or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-11 bg-card"
              />
            </div>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="h-11 md:w-44 bg-card">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Layout: sidebar + grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          <aside className="space-y-6">
            <Card className="surface-card">
              <CardContent className="p-5 space-y-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Filter className="h-4 w-4 text-primary" />
                  Filters
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Min Findem Score
                    </label>
                    <span className="text-xs font-mono text-primary">{minScore[0]}</span>
                  </div>
                  <Slider value={minScore} onValueChange={setMinScore} max={100} step={5} className="mt-3" />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Salary range (k)
                    </label>
                    <span className="text-xs font-mono text-primary">
                      ${salaryRange[0]}k-${salaryRange[1]}k
                    </span>
                  </div>
                  <Slider value={salaryRange} onValueChange={setSalaryRange} max={500} step={10} className="mt-3" />
                </div>
              </CardContent>
            </Card>
          </aside>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing <span className="text-foreground font-medium">{filtered.length}</span> {filtered.length === 1 ? "role" : "roles"}
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <Card className="surface-card">
                <CardContent className="p-12 text-center text-muted-foreground">
                  {jobs.length === 0
                    ? "No jobs posted yet. Companies are joining now — check back soon."
                    : "No jobs match your filters."}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

const SubmitJobForm = ({ onCancel, onSubmitted }: { onCancel: () => void; onSubmitted: () => void }) => {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    company_name: "",
    job_title: "",
    salary_min: "",
    salary_max: "",
    min_findem_score: "",
    description: "",
    apply_url: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not signed in");
      setSubmitting(false);
      return;
    }
    const { error } = await supabase.from("jobs").insert({
      user_id: user.id,
      company_name: form.company_name.trim(),
      job_title: form.job_title.trim(),
      salary_min: form.salary_min ? parseInt(form.salary_min) : null,
      salary_max: form.salary_max ? parseInt(form.salary_max) : null,
      min_findem_score: form.min_findem_score ? parseInt(form.min_findem_score) : null,
      description: form.description.trim(),
      apply_url: form.apply_url.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Job posted!");
    onSubmitted();
  };

  return (
    <Card className="surface-card border-primary/30">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Post a Job</h2>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Company name</Label>
              <Input required value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} maxLength={100} />
            </div>
            <div>
              <Label>Job title</Label>
              <Input required value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} maxLength={150} />
            </div>
            <div>
              <Label>Salary min ($/yr)</Label>
              <Input type="number" min={0} value={form.salary_min} onChange={(e) => setForm({ ...form, salary_min: e.target.value })} />
            </div>
            <div>
              <Label>Salary max ($/yr)</Label>
              <Input type="number" min={0} value={form.salary_max} onChange={(e) => setForm({ ...form, salary_max: e.target.value })} />
            </div>
            <div>
              <Label>Required Findem score (min)</Label>
              <Input type="number" min={0} max={100} value={form.min_findem_score} onChange={(e) => setForm({ ...form, min_findem_score: e.target.value })} />
            </div>
            <div>
              <Label>Apply link (URL)</Label>
              <Input type="url" required value={form.apply_url} onChange={(e) => setForm({ ...form, apply_url: e.target.value })} placeholder="https://..." />
            </div>
          </div>
          <div>
            <Label>Job description</Label>
            <Textarea required rows={5} maxLength={3000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex gap-3">
            <Button type="submit" variant="hero" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post Job"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const JobCard = ({ job }: { job: Job }) => {
  const fmt = (n: number | null) => (n ? `$${(n / 1000).toFixed(0)}k` : "—");
  return (
    <Card className="group relative overflow-hidden surface-card hover:border-primary/40 transition-all duration-300 hover:shadow-glow">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-muted-foreground shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-foreground leading-tight">{job.job_title}</h3>
            <p className="text-sm text-muted-foreground truncate">{job.company_name}</p>
          </div>
        </div>

        {(job.salary_min || job.salary_max) && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-success" />
            <span className="font-mono font-semibold text-foreground">
              {fmt(job.salary_min)}–{fmt(job.salary_max)}
            </span>
            <span className="text-muted-foreground">/year</span>
          </div>
        )}

        {job.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">{job.description}</p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border">
          {job.min_findem_score != null && (
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
              <ShieldCheck className="h-3 w-3 mr-1" />
              Min Score: {job.min_findem_score}
            </Badge>
          )}
          {job.apply_url && (
            <Button size="sm" variant="default" asChild>
              <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
                Apply <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Jobs;
