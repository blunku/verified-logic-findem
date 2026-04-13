import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/landing/Navbar";
import { Brain, Code2, Bug, Lightbulb, ExternalLink, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const scoreLabels = [
  { key: "problem_solving_score" as const, label: "Problem Solving", icon: Brain },
  { key: "code_quality_score" as const, label: "Code Quality", icon: Code2 },
  { key: "communication_score" as const, label: "Communication", icon: Bug },
  { key: "logic_score" as const, label: "Logic", icon: Lightbulb },
];

interface VerifiedExpert {
  id: string;
  full_name: string | null;
  title: string | null;
  github_username: string | null;
  avatar_url: string | null;
  audit: {
    overall_score: number | null;
    problem_solving_score: number | null;
    code_quality_score: number | null;
    communication_score: number | null;
    logic_score: number | null;
    gpt_summary: string | null;
  } | null;
}

const CompanyDashboard = () => {
  const [search, setSearch] = useState("");
  const [experts, setExperts] = useState<VerifiedExpert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperts = async () => {
      const { data: candidates } = await supabase
        .from("candidates")
        .select("id, full_name, title, github_username, avatar_url")
        .eq("status", "verified");

      if (!candidates || candidates.length === 0) {
        setLoading(false);
        return;
      }

      const enriched: VerifiedExpert[] = await Promise.all(
        candidates.map(async (c) => {
          const { data: audit } = await supabase
            .from("audit_results")
            .select("overall_score, problem_solving_score, code_quality_score, communication_score, logic_score, gpt_summary")
            .eq("candidate_id", c.id)
            .eq("audit_status", "completed")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          return { ...c, audit };
        })
      );

      setExperts(enriched);
      setLoading(false);
    };

    fetchExperts();
  }, []);

  const filtered = experts.filter(
    (e) =>
      (e.full_name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (e.title?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (e.github_username?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-14">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-bold mb-2">Verified Experts</h1>
              <p className="text-muted-foreground">Browse candidates with AI-verified logic breakdowns.</p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or role..."
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
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No verified experts found yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((expert) => (
                <div key={expert.id} className="surface-elevated p-6 hover:border-primary/20 transition-all duration-300 group">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    {/* Profile */}
                    <div className="flex items-center gap-4 lg:w-64 shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {expert.full_name?.split(" ").map(n => n[0]).join("") || "?"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{expert.full_name || "Unknown"}</span>
                          <Badge variant="outline" className="text-[10px] border-success/30 text-success">
                            Verified
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{expert.title || "Engineer"}</p>
                        {expert.github_username && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 mt-1">
                            @{expert.github_username}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Scores */}
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {scoreLabels.map(({ key, label, icon: Icon }) => (
                        <div key={key} className="space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Icon className="w-3 h-3" />
                            {label}
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={expert.audit?.[key] ?? 0} className="h-1.5 flex-1" />
                            <span className="text-xs font-mono font-medium">{expert.audit?.[key] ?? "—"}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Overall */}
                    <div className="flex items-center gap-4 lg:w-32 shrink-0 justify-end">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{expert.audit?.overall_score ?? "—"}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Overall</div>
                      </div>
                      <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Summary */}
                  {expert.audit?.gpt_summary && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground italic">"{expert.audit.gpt_summary}"</p>
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
