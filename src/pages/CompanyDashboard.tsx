import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/landing/Navbar";
import { Brain, Code2, Lightbulb, Search, Loader2, MapPin, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface VerifiedExpert {
  id: string;
  full_name: string | null;
  title: string | null;
  location: string | null;
  github_username: string | null;
  avatar_url: string | null;
  audit: {
    overall_score: number | null;
    logic_score: number | null;
    code_quality_score: number | null;
    gpt_summary: string | null;
  } | null;
}

const getScoreColor = (score: number | null | undefined) => {
  if (!score) return "bg-muted text-muted-foreground";
  if (score >= 80) return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (score >= 60) return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  return "bg-red-500/15 text-red-400 border-red-500/30";
};

const CompanyDashboard = () => {
  const [search, setSearch] = useState("");
  const [experts, setExperts] = useState<VerifiedExpert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperts = async () => {
      const { data: candidates } = await supabase
        .from("candidates")
        .select("id, full_name, title, location, github_username, avatar_url")
        .eq("status", "verified");

      if (!candidates || candidates.length === 0) {
        setLoading(false);
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

      // Sort by overall_score descending
      enriched.sort((a, b) => (b.audit?.overall_score ?? 0) - (a.audit?.overall_score ?? 0));

      setExperts(enriched);
      setLoading(false);
    };

    fetchExperts();
  }, []);

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
              <h1 className="text-3xl font-bold mb-2">Verified Experts</h1>
              <p className="text-muted-foreground">Browse candidates with AI-verified logic breakdowns.</p>
            </div>
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
                    {/* Profile Info */}
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

                    {/* Score Tags */}
                    <div className="flex flex-wrap items-center gap-2 flex-1">
                      <Badge variant="outline" className="text-xs gap-1.5 px-2.5 py-1">
                        <Lightbulb className="w-3 h-3" /> Logic: {expert.audit?.logic_score ?? "—"}
                      </Badge>
                      <Badge variant="outline" className="text-xs gap-1.5 px-2.5 py-1">
                        <Code2 className="w-3 h-3" /> Code Quality: {expert.audit?.code_quality_score ?? "—"}
                      </Badge>
                    </div>

                    {/* Overall Score + Action */}
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

                  {/* GPT Summary */}
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
