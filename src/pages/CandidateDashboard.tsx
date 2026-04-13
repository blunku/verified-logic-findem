import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/landing/Navbar";
import { Github, Play, CheckCircle, Clock, Brain, Code2, Bug, Lightbulb, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
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
  const [startingAudit, setStartingAudit] = useState(false);

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

      if (cand) {
        const { data: auditData } = await supabase
          .from("audit_results")
          .select("*")
          .eq("candidate_id", cand.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        setAudit(auditData);
      }
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/auth");
    });

    init();
    return () => subscription.unsubscribe();
  }, [navigate]);

  // Poll for audit status changes
  useEffect(() => {
    if (!audit || audit.audit_status !== "pending" && audit.audit_status !== "processing") return;

    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("audit_results")
        .select("*")
        .eq("id", audit.id)
        .maybeSingle();
      if (data) setAudit(data);
      if (data?.audit_status === "completed") clearInterval(interval);
    }, 3000);

    return () => clearInterval(interval);
  }, [audit?.id, audit?.audit_status]);

  const githubLinked = !!candidate?.github_url;

  const handleLinkGithub = async () => {
    // For now, simulate linking with a placeholder
    const { error } = await supabase
      .from("candidates")
      .update({ github_username: "developer", github_url: "https://github.com/developer" })
      .eq("id", candidate.id);
    if (error) { toast.error("Failed to link GitHub"); return; }
    setCandidate({ ...candidate, github_username: "developer", github_url: "https://github.com/developer" });
    toast.success("GitHub linked!");
  };

  const handleStartAudit = async () => {
    setStartingAudit(true);
    const { data, error } = await supabase
      .from("audit_results")
      .insert({ candidate_id: candidate.id, audit_status: "pending" })
      .select()
      .single();
    if (error) { toast.error("Failed to start audit"); setStartingAudit(false); return; }
    setAudit(data);
    setStartingAudit(false);
  };

  const auditInProgress = audit && (audit.audit_status === "pending" || audit.audit_status === "processing");
  const auditCompleted = audit && audit.audit_status === "completed";

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

          {/* GitHub Card */}
          <div className="surface-elevated p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Github className="w-6 h-6 text-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">GitHub Integration</h3>
                  <p className="text-sm text-muted-foreground">
                    {githubLinked ? `Connected as @${candidate.github_username}` : "Connect your GitHub to analyze your codebase"}
                  </p>
                </div>
              </div>
              <Button
                variant={githubLinked ? "secondary" : "default"}
                onClick={handleLinkGithub}
                disabled={githubLinked}
              >
                {githubLinked ? (
                  <><CheckCircle className="w-4 h-4" /> Connected</>
                ) : (
                  <><Github className="w-4 h-4" /> Link GitHub</>
                )}
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
                disabled={!githubLinked || auditInProgress || startingAudit}
              >
                {startingAudit ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Starting...</>
                ) : auditInProgress ? (
                  <><Clock className="w-4 h-4 animate-pulse" /> Processing...</>
                ) : (
                  <><Play className="w-4 h-4" /> Start Audit</>
                )}
              </Button>
            </div>

            {!githubLinked && (
              <div className="rounded-lg bg-muted/50 border border-border p-4 text-center">
                <p className="text-sm text-muted-foreground">Link your GitHub first to enable the AI Code Audit.</p>
              </div>
            )}

            {auditInProgress && (
              <div className="rounded-lg bg-muted/30 border border-primary/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <div>
                    <span className="text-sm font-medium">Audit in progress</span>
                    <p className="text-xs text-muted-foreground">Our AI is analyzing your code patterns and logic. This may take a few minutes.</p>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div className="bg-primary h-full rounded-full animate-pulse" style={{ width: audit.audit_status === "processing" ? "60%" : "20%" }} />
                </div>
              </div>
            )}

            {auditCompleted && (
              <div className="rounded-lg bg-muted/30 border border-primary/10 p-6 font-mono text-sm">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-success text-xs font-medium">AUDIT COMPLETE</span>
                </div>
                {audit.gpt_summary && <p className="text-muted-foreground text-sm font-sans">{audit.gpt_summary}</p>}
              </div>
            )}
          </div>

          {/* Results */}
          {auditCompleted && (
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
