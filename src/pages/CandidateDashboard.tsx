import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/landing/Navbar";
import { Github, Play, CheckCircle, Brain, Code2, Bug, Lightbulb, Loader2, ArrowRight, RotateCcw, TrendingUp, Briefcase } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const auditCategoryMeta = [
  { key: "problem_solving_score" as const, name: "Problem Decomposition", icon: Brain, description: "How well you break complex problems into manageable parts" },
  { key: "code_quality_score" as const, name: "Code Quality", icon: Code2, description: "Clean code, naming conventions, readability" },
  { key: "communication_score" as const, name: "Edge Case Handling", icon: Bug, description: "Anticipating and handling boundary conditions" },
  { key: "logic_score" as const, name: "Optimization Instinct", icon: Lightbulb, description: "Ability to identify and implement efficient solutions" },
];

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<any>(null);
  const [audit, setAudit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [auditRunning, setAuditRunning] = useState(false);
  const [githubInput, setGithubInput] = useState("");
  const [savingGithub, setSavingGithub] = useState(false);
  const [githubSaved, setGithubSaved] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const fetchLatestCompleteAudit = useCallback(async () => {
    try {
      const res = await fetch("https://maliksakib.app.n8n.cloud/webhook/get-audit-results", {
        method: "GET",
      });

      if (!res.ok) {
        console.error("Audit webhook error:", res.status);
        return null;
      }

      const raw = await res.json();
      // Handle either an object or an array response
      const data = Array.isArray(raw) ? raw[0] : raw;

      const hasScores =
        data &&
        (data.overall_score !== undefined ||
          data.logic_score !== undefined ||
          data.problem_solving_score !== undefined ||
          data.code_quality_score !== undefined ||
          data.communication_score !== undefined);

      if (hasScores) {
        setAudit({ ...data, audit_status: "complete" });
        setAuditRunning(false);
        stopPolling();
        return data;
      }

      return null;
    } catch (error) {
      console.error("Audit fetch exception:", error);
      return null;
    }
  }, [stopPolling]);

  const startPolling = useCallback(() => {
    stopPolling();
    pollingRef.current = setInterval(() => {
      void fetchLatestCompleteAudit();
    }, 3000);
  }, [fetchLatestCompleteAudit, stopPolling]);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }

      const { data: cand } = await supabase
        .from("candidates")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      setCandidate(cand);
      if (cand?.github_username) {
        setGithubInput(cand.github_username);
        setGithubSaved(true);
      }

      const latestAudit = await fetchLatestCompleteAudit();
      if (!latestAudit) {
        startPolling();
      }
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/auth");
    });

    init();
    return () => {
      stopPolling();
      subscription.unsubscribe();
    };
  }, [fetchLatestCompleteAudit, navigate, startPolling, stopPolling]);

  const handleSaveGithub = async () => {
    if (!githubInput.trim()) { toast.error("Please enter a GitHub username"); return; }
    setSavingGithub(true);
    const username = githubInput.trim();
    const { error } = await supabase
      .from("candidates")
      .update({ github_username: username, github_url: `https://github.com/${username}` })
      .eq("id", candidate.id);
    setSavingGithub(false);
    if (error) { toast.error("Failed to save GitHub username"); return; }
    setCandidate({ ...candidate, github_username: username, github_url: `https://github.com/${username}` });
    setGithubSaved(true);
    setAudit(null);
    setAuditRunning(false);
    toast.success("GitHub username saved!");
  };

  const handleStartAudit = async () => {
    setAudit(null);
    setAuditRunning(true);
    startPolling();

    // 1. Fetch fresh candidate data
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error("Not authenticated"); setAuditRunning(false); stopPolling(); return; }

    const { data: cand, error: candErr } = await supabase
      .from("candidates")
      .select("id, github_url, github_username")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (candErr || !cand) { toast.error("Could not fetch candidate data"); setAuditRunning(false); stopPolling(); return; }
    if (!cand.github_url) { toast.error("Please link your GitHub first"); setAuditRunning(false); stopPolling(); return; }

    // 2. Insert pending audit row
    const { data: auditRow, error: auditErr } = await supabase
      .from("audit_results")
      .insert({ candidate_id: cand.id, audit_status: "pending" })
      .select()
      .single();

    if (auditErr) { toast.error("Failed to create audit"); setAuditRunning(false); stopPolling(); return; }
    setAudit(auditRow);

    // 3. POST to n8n webhook
    try {
      await fetch("https://maliksakib.app.n8n.cloud/webhook/start-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_id: cand.id,
          github_url: cand.github_url,
          github_username: cand.github_username,
        }),
      });
    } catch {
      toast.error("Failed to trigger audit webhook");
      setAuditRunning(false);
      stopPolling();
    }
  };

  const auditComplete = audit?.audit_status === "complete";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-14">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-2">Candidate Dashboard</h1>
            <p className="text-muted-foreground">Link your GitHub and prove your logic with a live AI audit.</p>
          </div>

          {/* GitHub Username */}
          <div className="surface-elevated p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                <Github className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">GitHub Integration</h3>
                <p className="text-sm text-muted-foreground">Enter your GitHub username so we can analyze your code.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Input
                placeholder="e.g. torvalds"
                value={githubInput}
                onChange={(e) => { setGithubInput(e.target.value); setGithubSaved(false); }}
                disabled={savingGithub}
                className="max-w-xs"
              />
              <Button onClick={handleSaveGithub} disabled={savingGithub || !githubInput.trim()}>
                {savingGithub ? <Loader2 className="w-4 h-4 animate-spin" /> : githubSaved ? <><CheckCircle className="w-4 h-4 text-emerald-400" /> Saved ✓</> : "Save"}
              </Button>
            </div>
          </div>

          {/* AI Code Audit */}
          <div className="surface-elevated p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-lg">Live AI Code Audit</h3>
                <p className="text-sm text-muted-foreground">
                  Solve a real coding challenge while our AI analyzes your thinking process.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline">
                  <Link to="/challenge">
                    <Play className="w-4 h-4" /> Take Challenge
                  </Link>
                </Button>
                <Button
                  variant={auditComplete && !auditRunning ? "default" : "hero"}
                  onClick={handleStartAudit}
                  disabled={!githubSaved || auditRunning}
                  className={auditComplete && !auditRunning ? "bg-success text-success-foreground hover:bg-success/90 shadow-[0_0_24px_hsl(var(--success)/0.25)]" : undefined}
                >
                  {auditRunning ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Audit Running...</>
                  ) : auditComplete ? (
                    <><CheckCircle className="w-4 h-4" /> Audit Complete ✓</>
                  ) : (
                    <><Play className="w-4 h-4" /> Start Audit</>
                  )}
                </Button>
              </div>
            </div>

            {!githubSaved && (
              <div className="rounded-lg bg-muted/50 border border-border p-4 text-center">
                <p className="text-sm text-muted-foreground">Save your GitHub username first to enable the AI Code Audit.</p>
              </div>
            )}

            {auditRunning && (
              <div className="rounded-lg bg-muted/30 border border-primary/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <div>
                    <span className="text-sm font-medium">Audit in progress</span>
                    <p className="text-xs text-muted-foreground">Our AI is analyzing your code patterns and logic. Polling every 3 seconds...</p>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div className="bg-primary h-full rounded-full animate-pulse" style={{ width: "50%" }} />
                </div>
              </div>
            )}

            {auditComplete && (
              <div className="rounded-2xl border border-success/30 bg-card p-6 shadow-[0_0_30px_hsl(var(--success)/0.12)]">
                <div className="mb-6 flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
                  <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                      <CheckCircle className="h-4 w-4" />
                      AUDIT COMPLETE
                    </div>
                    <h3 className="text-2xl font-semibold">Latest AI Scorecard</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Your latest completed audit is now ready.</p>
                  </div>
                  <div className="rounded-2xl border border-success/20 bg-success/10 px-6 py-4 text-center md:min-w-56">
                    <div className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">Overall Score</div>
                    <div className="mt-2 text-6xl font-bold leading-none text-success">{audit.overall_score ?? "—"}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {auditCategoryMeta.map((cat) => {
                    const score = audit[cat.key] ?? 0;

                    return (
                      <div key={cat.name} className="rounded-xl border border-border bg-muted/30 p-4">
                        <div className="mb-3 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-foreground">
                            <cat.icon className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{cat.name}</p>
                            <p className="text-xs text-muted-foreground">{cat.description}</p>
                          </div>
                        </div>
                        <div className="mb-2 flex items-end justify-between gap-4">
                          <span className="text-3xl font-bold leading-none">{score}</span>
                          <Badge variant="secondary" className="font-mono text-xs">/100</Badge>
                        </div>
                        <Progress value={score} className="h-1.5" />
                      </div>
                    );
                  })}
                </div>

                {audit.gpt_summary && (
                  <p className="mt-6 border-t border-border pt-6 text-sm leading-7 text-muted-foreground">{audit.gpt_summary}</p>
                )}

                <div className="mt-6 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <Button asChild variant="default" className="bg-success text-success-foreground hover:bg-success/90">
                    <Link to="/report">
                      View Full Report <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAudit(null);
                      setAuditRunning(false);
                      stopPolling();
                      toast.success("Audit reset. Click Start Audit to run again.");
                    }}
                  >
                    <RotateCcw className="h-4 w-4" /> Re-run Audit
                  </Button>
                </div>
              </div>
            )}
          </div>

          {auditComplete && (() => {
            const score = audit.overall_score ?? 0;
            const tier =
              score >= 90 ? { range: "$120,000 – $180,000", low: 120, high: 180, mid: 150, label: "Elite" }
              : score >= 80 ? { range: "$90,000 – $130,000", low: 90, high: 130, mid: 110, label: "Senior" }
              : score >= 70 ? { range: "$70,000 – $100,000", low: 70, high: 100, mid: 85, label: "Mid-Senior" }
              : score >= 60 ? { range: "$50,000 – $75,000", low: 50, high: 75, mid: 62, label: "Mid-Level" }
              : { range: "$40,000 – $60,000", low: 40, high: 60, mid: 50, label: "Entry" };

            const MAX = 180;
            const bars = [
              { name: "Your Value", value: tier.mid, display: tier.range, accent: "from-primary to-primary/40", highlight: true },
              { name: "Market Average", value: 85, display: "$85,000", accent: "from-muted-foreground/60 to-muted-foreground/20" },
              { name: "Top 10% Earners", value: 160, display: "$160,000", accent: "from-amber-400 to-amber-600/40" },
            ];

            return (
              <div className="surface-elevated relative overflow-hidden p-6 mb-8 border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
                <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
                <div className="relative">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-primary/40 flex items-center justify-center shadow-[0_0_24px_hsl(var(--primary)/0.4)]">
                        <TrendingUp className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Salary Insights</div>
                        <h3 className="text-xl font-semibold">Your Market Value</h3>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                      {tier.label} Tier
                    </Badge>
                  </div>

                  <div className="rounded-2xl border border-primary/20 bg-background/60 p-5 mb-6">
                    <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Estimated Salary Range</div>
                    <div className="mt-1 text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-foreground to-primary bg-clip-text text-transparent">
                      {tier.range}
                      <span className="text-base font-normal text-muted-foreground">/year</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    {bars.map((b) => (
                      <div key={b.name}>
                        <div className="flex items-center justify-between mb-1.5 text-sm">
                          <span className={`font-medium ${b.highlight ? "text-foreground" : "text-muted-foreground"}`}>
                            {b.name}
                            {b.highlight && (
                              <Badge className="ml-2 bg-primary/15 text-primary border border-primary/30 text-[10px]">YOU</Badge>
                            )}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground">{b.display}</span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-muted/40 overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${b.accent} ${b.highlight ? "shadow-[0_0_16px_hsl(var(--primary)/0.5)]" : ""}`}
                            style={{ width: `${Math.min(100, (b.value / MAX) * 100)}%`, transition: "width 700ms ease-out" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground">
                      Based on 10,000+ verified developer salaries on Findem
                    </p>
                    <Button asChild variant="hero">
                      <Link to="/jobs">
                        <Briefcase className="h-4 w-4" /> See Jobs Matching Your Value
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </main>
    </div>
  );
};

export default CandidateDashboard;
