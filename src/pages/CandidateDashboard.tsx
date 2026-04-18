import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/landing/Navbar";
import { Github, Play, CheckCircle, Brain, Code2, Bug, Lightbulb, Loader2 } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
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
      const { data, error } = await supabase
        .from("audit_results")
        .select("*")
        .eq("audit_status", "complete")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Audit fetch error:", error);
        return null;
      }

      if (data) {
        setAudit(data);
        setAuditRunning(false);
        stopPolling();
      }

      return data;
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

      await fetchLatestCompleteAudit();
      startPolling();
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
              <Button
                variant="hero"
                onClick={handleStartAudit}
                disabled={!githubSaved || auditRunning}
              >
                {auditRunning ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Audit Running...</>
                ) : auditComplete ? (
                  <><Play className="w-4 h-4" /> Re-run Audit</>
                ) : (
                  <><Play className="w-4 h-4" /> Start Audit</>
                )}
              </Button>
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
                    <p className="text-xs text-muted-foreground">Our AI is analyzing your code patterns and logic. Polling every 5 seconds...</p>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div className="bg-primary h-full rounded-full animate-pulse" style={{ width: "50%" }} />
                </div>
              </div>
            )}

            {auditComplete && (
              <div className="rounded-lg bg-muted/30 border border-primary/10 p-6 font-mono text-sm">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 text-xs font-medium">AUDIT COMPLETE</span>
                </div>

                {/* Overall Score - Large & Prominent */}
                <div className="flex items-center justify-center my-6">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-primary">{audit.overall_score ?? "—"}</div>
                    <div className="text-xs text-muted-foreground mt-1 font-sans">OVERALL SCORE</div>
                  </div>
                </div>

                {audit.gpt_summary && (
                  <p className="text-muted-foreground text-sm font-sans mb-4 border-t border-border pt-4">{audit.gpt_summary}</p>
                )}
              </div>
            )}
          </div>

          {/* Score Breakdown */}
          {auditComplete && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Your Logic Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {auditCategoryMeta.map((cat) => {
                  const score = audit[cat.key] ?? 0;
                  return (
                    <div key={cat.name} className="surface-card p-5 hover:border-primary/20 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <cat.icon className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm">{cat.name}</span>
                        <Badge variant="secondary" className="ml-auto font-mono text-xs">
                          {score}/100
                        </Badge>
                      </div>
                      <Progress value={score} className="h-1.5 mb-2" />
                      <p className="text-xs text-muted-foreground">{cat.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CandidateDashboard;
