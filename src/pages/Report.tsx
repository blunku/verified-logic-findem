import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/landing/Navbar";
import {
  Brain,
  Code2,
  Bug,
  Lightbulb,
  CheckCircle2,
  Download,
  Linkedin,
  ShieldCheck,
  Sparkles,
  Loader2,
  ArrowLeft,
} from "lucide-react";

const WEBHOOK_URL = "https://maliksakib.app.n8n.cloud/webhook/get-audit-results";

type AuditData = {
  overall_score?: number;
  logic_score?: number;
  problem_solving_score?: number;
  code_quality_score?: number;
  communication_score?: number;
  gpt_summary?: string;
  full_name?: string;
  github_username?: string;
  title?: string;
};

const scoreCards = [
  { key: "logic_score" as const, label: "Logic Score", icon: Brain, accent: "from-blue-500/20 to-blue-500/5", iconColor: "text-blue-400" },
  { key: "problem_solving_score" as const, label: "Problem Solving", icon: Lightbulb, accent: "from-amber-500/20 to-amber-500/5", iconColor: "text-amber-400" },
  { key: "code_quality_score" as const, label: "Code Quality", icon: Code2, accent: "from-emerald-500/20 to-emerald-500/5", iconColor: "text-emerald-400" },
  { key: "communication_score" as const, label: "Communication", icon: Bug, accent: "from-fuchsia-500/20 to-fuchsia-500/5", iconColor: "text-fuchsia-400" },
];

const getInitials = (name?: string, fallback = "AC") => {
  if (!name) return fallback;
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || fallback;
};

const ScoreRing = ({ score }: { score: number }) => {
  const size = 240;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(142 76% 56%)" />
            <stop offset="100%" stopColor="hsl(160 84% 50%)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="hsl(220 14% 18%)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ringGradient)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground">Overall</div>
        <div className="mt-1 text-6xl font-bold leading-none text-foreground">{clamped}</div>
        <div className="mt-2 text-xs font-medium text-emerald-400">/ 100</div>
      </div>
    </div>
  );
};

const Report = () => {
  const [data, setData] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [issuedAt] = useState(() =>
    new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  );

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch(WEBHOOK_URL);
        const raw = await res.json();
        const parsed = Array.isArray(raw) ? raw[0] : raw;
        if (active) setData(parsed ?? {});
      } catch (e) {
        console.error(e);
        if (active) setData({});
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const handleDownload = () => window.print();
  const handleShare = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const candidateName = data?.full_name || "Anonymous Candidate";
  const githubUsername = data?.github_username || "github-user";
  const title = data?.title || "Software Engineer";
  const overall = data?.overall_score ?? 0;

  return (
    <div className="min-h-screen bg-[hsl(220_18%_5%)] text-foreground">
      {/* Subtle backdrop glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[520px] rounded-full bg-blue-500/10 blur-[140px]" />
      </div>

      <div className="mx-auto max-w-5xl px-6 py-12 print:py-6">
        {/* Header */}
        <header className="flex flex-col gap-4 border-b border-white/10 pb-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_30px_hsl(142_76%_56%/0.4)]">
              <ShieldCheck className="h-5 w-5 text-black" />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight">Findem</div>
              <div className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
                Verified Logic
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Verified Logic Certificate
            </div>
            <div className="mt-1 text-sm text-foreground/80">Issued {issuedAt}</div>
          </div>
        </header>

        {/* Candidate */}
        <section className="mt-10 flex flex-col items-start gap-6 rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:flex-row md:items-center">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-2xl font-bold text-black shadow-[0_0_30px_hsl(142_76%_56%/0.35)]">
              {getInitials(candidateName)}
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[hsl(220_18%_5%)] bg-emerald-500">
              <CheckCircle2 className="h-4 w-4 text-black" />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{candidateName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="text-foreground/80">@{githubUsername}</span>
              <span className="mx-2 opacity-40">•</span>
              {title}
            </p>
          </div>
          <Badge className="border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-emerald-400 hover:bg-emerald-500/15">
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            AI Verified
          </Badge>
        </section>

        {/* Scores */}
        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[auto_1fr]">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/[0.06] to-transparent p-8">
            <ScoreRing score={overall} />
            <div className="mt-6 text-center">
              <div className="text-sm font-semibold text-emerald-400">Excellent Performance</div>
              <div className="mt-1 text-xs text-muted-foreground">Verified by Findem AI</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {scoreCards.map((card) => {
              const score = (data?.[card.key] as number | undefined) ?? 0;
              return (
                <div
                  key={card.key}
                  className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${card.accent} p-5`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 ${card.iconColor}`}>
                      <card.icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">/ 100</span>
                  </div>
                  <div className="mt-4 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    {card.label}
                  </div>
                  <div className="mt-1 text-4xl font-bold leading-none">{score}</div>
                  <Progress value={score} className="mt-4 h-1.5 bg-white/10" />
                </div>
              );
            })}
          </div>
        </section>

        {/* AI Assessment */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-8">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground/80">
                AI Assessment
              </h2>
            </div>
            <Badge className="border-emerald-500/20 bg-emerald-500/10 text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-400 hover:bg-emerald-500/15">
              Powered by Findem AI
            </Badge>
          </div>
          <p className="text-base leading-8 text-foreground/85">
            {data?.gpt_summary ||
              "No assessment summary is available yet. Once the audit completes, the AI-generated review will appear here with a detailed analysis of the candidate's strengths."}
          </p>
        </section>

        {/* Actions */}
        <section className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end print:hidden">
          <Button
            onClick={handleShare}
            variant="outline"
            className="border-white/15 bg-white/[0.03] text-foreground hover:bg-white/[0.08]"
          >
            <Linkedin className="h-4 w-4" />
            Share on LinkedIn
          </Button>
          <Button
            onClick={handleDownload}
            className="bg-emerald-500 text-black shadow-[0_0_30px_hsl(142_76%_56%/0.35)] hover:bg-emerald-400"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </section>

        {/* Footer */}
        <footer className="mt-10 flex flex-col items-center gap-1 border-t border-white/10 pt-6 text-center">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Verified by Findem
          </div>
          <a href="https://findem.app" className="text-xs text-foreground/60 hover:text-emerald-400">
            findem.app
          </a>
        </footer>
      </div>
    </div>
  );
};

export default Report;
