import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  Github,
  CheckCircle2,
  Sparkles,
  Code2,
  ShieldCheck,
  Brain,
  Zap,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Candidate = {
  id: string;
  user_id: string;
  full_name: string | null;
  title: string | null;
  location: string | null;
  github_username: string | null;
  github_url: string | null;
  years_experience: number | null;
};

const TOTAL_STEPS = 3;

const Onboarding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [auditing, setAuditing] = useState(false);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [step, setStep] = useState(1);

  // Step 1
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [years, setYears] = useState<string>("");

  // Step 2
  const [githubUsername, setGithubUsername] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?role=candidate");
        return;
      }

      const { data: cand, error } = await supabase
        .from("candidates")
        .select("id, user_id, full_name, title, location, github_username, github_url, years_experience")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error) {
        toast({ title: "Could not load profile", description: error.message, variant: "destructive" });
        setLoading(false);
        return;
      }

      if (cand) {
        setCandidate(cand as Candidate);
        setFullName(cand.full_name ?? "");
        setTitle(cand.title ?? "");
        setLocation(cand.location ?? "");
        setYears(cand.years_experience?.toString() ?? "");
        setGithubUsername(cand.github_username ?? "");
      }
      setLoading(false);
    };
    load();
  }, [navigate]);

  const progress = useMemo(() => (step / TOTAL_STEPS) * 100, [step]);

  const saveStep1 = async () => {
    if (!candidate) return false;
    if (!fullName.trim()) {
      toast({ title: "Name required", description: "Please enter your full name.", variant: "destructive" });
      return false;
    }
    setSaving(true);
    const { error } = await supabase
      .from("candidates")
      .update({
        full_name: fullName.trim(),
        title: title.trim() || null,
        location: location.trim() || null,
        years_experience: years ? parseInt(years, 10) : null,
      })
      .eq("user_id", candidate.user_id);
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return false;
    }
    return true;
  };

  const saveStep2 = async () => {
    if (!candidate) return false;
    const username = githubUsername.trim().replace(/^@/, "");
    if (!username) {
      toast({ title: "GitHub username required", description: "We need this to audit your code.", variant: "destructive" });
      return false;
    }
    if (!/^[a-zA-Z0-9-]{1,39}$/.test(username)) {
      toast({ title: "Invalid GitHub username", variant: "destructive" });
      return false;
    }
    setSaving(true);
    const { error } = await supabase
      .from("candidates")
      .update({
        github_username: username,
        github_url: `https://github.com/${username}`,
      })
      .eq("user_id", candidate.user_id);
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    if (step === 1) {
      if (await saveStep1()) setStep(2);
    } else if (step === 2) {
      if (await saveStep2()) setStep(3);
    }
  };

  const handleStartAudit = async () => {
    if (!candidate) return;
    setAuditing(true);
    // Create a pending audit row so the dashboard can pick it up
    await supabase.from("audit_results").insert({
      candidate_id: candidate.id,
      audit_status: "pending",
    });
    toast({
      title: "Audit started",
      description: "We're analyzing your GitHub repositories now.",
    });
    navigate("/candidate");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 flex items-center justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-20 max-w-2xl mx-auto px-6">
        {/* Progress header */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <span className="font-medium uppercase tracking-wider">
              Onboarding
            </span>
            <span className="font-mono">
              Step {step} <span className="text-muted-foreground/50">/ {TOTAL_STEPS}</span>
            </span>
          </div>

          {/* Step pills */}
          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-all",
                  s < step && "bg-success",
                  s === step && "bg-primary",
                  s > step && "bg-border",
                )}
              />
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            {Math.round(progress)}% complete
          </p>
        </div>

        {/* Step content */}
        {step === 1 && (
          <Card className="surface-elevated">
            <CardContent className="p-8 space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary text-xs font-medium px-3 py-1 mb-3">
                  <Sparkles className="h-3 w-3" />
                  Welcome to Findem
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                  Complete Your Profile
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Tell us a bit about yourself so companies can find you.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Job title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Senior Full-Stack Engineer"
                    maxLength={80}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="San Francisco, CA · Remote"
                    maxLength={80}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Years of experience</Label>
                  <Select value={years} onValueChange={setYears}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Less than 1 year</SelectItem>
                      <SelectItem value="1">1 year</SelectItem>
                      <SelectItem value="2">2 years</SelectItem>
                      <SelectItem value="3">3 years</SelectItem>
                      <SelectItem value="5">4–5 years</SelectItem>
                      <SelectItem value="7">6–7 years</SelectItem>
                      <SelectItem value="10">8–10 years</SelectItem>
                      <SelectItem value="15">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleNext} disabled={saving} variant="hero">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="surface-elevated">
            <CardContent className="p-8 space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary text-xs font-medium px-3 py-1 mb-3">
                  <Github className="h-3 w-3" />
                  Step 2 of 3
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                  Connect GitHub
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  We audit your real code, not your resume.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gh">GitHub username</Label>
                <div className="relative">
                  <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="gh"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    placeholder="octocat"
                    className="pl-9 font-mono"
                    maxLength={39}
                  />
                </div>
                {githubUsername && (
                  <p className="text-xs text-muted-foreground font-mono">
                    github.com/{githubUsername.trim().replace(/^@/, "")}
                  </p>
                )}
              </div>

              {/* What we audit */}
              <div className="rounded-lg border border-border bg-card/40 p-4 space-y-3">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  What our audit checks
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { icon: Brain, label: "Logic & problem solving" },
                    { icon: Code2, label: "Code quality & structure" },
                    { icon: ShieldCheck, label: "Security best practices" },
                    { icon: Zap, label: "Real commit history" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <item.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button onClick={() => setStep(1)} variant="ghost">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleNext} disabled={saving} variant="hero">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="surface-elevated">
            <CardContent className="p-8 space-y-6 text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 mx-auto">
                <Sparkles className="h-7 w-7 text-primary-foreground" />
              </div>

              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary text-xs font-medium px-3 py-1 mb-3">
                  Final step
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                  Run Your First Audit
                </h1>
                <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                  We'll analyze your public repositories and generate your verified Findem score.
                </p>
              </div>

              {/* Steps preview */}
              <div className="rounded-lg border border-border bg-card/40 p-5 text-left space-y-3">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  What happens next
                </p>
                {[
                  "We scan your public GitHub repositories",
                  "AI evaluates code quality, logic, and communication",
                  "You get a verified score and shareable report",
                ].map((line, i) => (
                  <div key={line} className="flex items-start gap-3 text-sm text-foreground">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary text-[10px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    {line}
                  </div>
                ))}
              </div>

              <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Estimated time: ~60 seconds
              </div>

              <Button
                onClick={handleStartAudit}
                disabled={auditing}
                variant="hero"
                size="lg"
                className="w-full"
              >
                {auditing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Start My Audit
                <ArrowRight className="h-4 w-4" />
              </Button>

              <button
                onClick={() => setStep(2)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back
              </button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Onboarding;
