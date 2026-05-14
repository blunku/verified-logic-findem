import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge as UIBadge } from "@/components/ui/badge";
import { ShieldCheck, Loader2, Sparkles } from "lucide-react";

interface BadgeData {
  full_name: string | null;
  title: string | null;
  github_username: string | null;
  created_at: string;
  overall_score: number | null;
  percentile: number | null;
  verified_at: string | null;
}

const Badge = () => {
  const { username } = useParams<{ username: string }>();
  const [data, setData] = useState<BadgeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      if (!username) return;
      const { data: candidate } = await supabase
        .from("candidates")
        .select("id, full_name, title, github_username, created_at")
        .eq("github_username", username)
        .eq("status", "verified")
        .maybeSingle();

      if (!candidate) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const { data: audit } = await supabase
        .from("audit_results")
        .select("overall_score, updated_at")
        .eq("candidate_id", candidate.id)
        .eq("audit_status", "complete")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Compute percentile across all verified candidates with completed audits
      const { data: allScores } = await supabase
        .from("audit_results")
        .select("overall_score")
        .eq("audit_status", "complete")
        .not("overall_score", "is", null);

      let percentile: number | null = null;
      if (audit?.overall_score && allScores && allScores.length > 0) {
        const scores = allScores.map((s) => s.overall_score as number);
        const below = scores.filter((s) => s < (audit.overall_score as number)).length;
        const top = 100 - Math.round((below / scores.length) * 100);
        percentile = Math.max(1, top);
      }

      setData({
        full_name: candidate.full_name,
        title: candidate.title,
        github_username: candidate.github_username,
        created_at: candidate.created_at,
        overall_score: audit?.overall_score ?? null,
        percentile,
        verified_at: audit?.updated_at ?? candidate.created_at,
      });
      setLoading(false);
    })();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Badge not found</h1>
          <p className="text-muted-foreground mb-6">No verified candidate matches @{username}.</p>
          <Button asChild><Link to="/">Back home</Link></Button>
        </div>
      </div>
    );
  }

  const verifiedDate = data.verified_at
    ? new Date(data.verified_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "—";
  const reportUrl = typeof window !== "undefined" ? `${window.location.origin}/report?u=${data.github_username}` : "/report";
  const title = `${data.full_name || data.github_username} — Findem Verified`;
  const description = `${data.full_name || "This engineer"} scored ${data.overall_score ?? "—"}/100 on Findem${data.percentile ? `, top ${data.percentile}% globally` : ""}.`;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`/badge/${data.github_username}`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={`/badge/${data.github_username}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
      </Helmet>

      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <main className="relative max-w-2xl mx-auto px-6 py-12 md:py-20">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Sparkles className="w-4 h-4" /> Findem
          </Link>
        </div>

        {/* Badge card */}
        <div className="surface-elevated rounded-2xl p-8 md:p-12 border border-primary/20 shadow-[0_0_60px_-15px_hsl(217_91%_60%/0.4)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

          <div className="relative flex flex-col items-center text-center">
            {/* Shield */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full" />
              <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-[0_0_40px_hsl(217_91%_60%/0.5)]">
                <ShieldCheck className="w-12 h-12 md:w-14 md:h-14 text-primary-foreground" strokeWidth={2.5} />
              </div>
            </div>

            <UIBadge variant="outline" className="mb-3 border-emerald-500/40 text-emerald-400 bg-emerald-500/10">
              Findem Verified
            </UIBadge>

            <h1 className="text-3xl md:text-4xl font-bold mb-1">{data.full_name || `@${data.github_username}`}</h1>
            <p className="text-muted-foreground mb-8">{data.title || "Engineer"}</p>

            {/* Score */}
            <div className="grid grid-cols-2 gap-6 md:gap-12 mb-8 w-full max-w-md">
              <div>
                <div className="text-5xl md:text-6xl font-bold font-mono text-primary">{data.overall_score ?? "—"}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Overall Score</div>
              </div>
              <div>
                <div className="text-5xl md:text-6xl font-bold font-mono">
                  {data.percentile ? <>Top {data.percentile}<span className="text-2xl md:text-3xl">%</span></> : "—"}
                </div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Globally</div>
              </div>
            </div>

            <div className="text-sm text-muted-foreground mb-8">Verified on {verifiedDate}</div>

            {/* QR */}
            <div className="bg-white p-4 rounded-xl shadow-lg mb-4">
              <QRCodeSVG value={reportUrl} size={140} level="M" />
            </div>
            <p className="text-xs text-muted-foreground">Scan for full report</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="outline">
            <a href={reportUrl} target="_blank" rel="noreferrer">View full report</a>
          </Button>
          <Button asChild>
            <Link to="/auth?role=candidate">Get your badge</Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Badge;
